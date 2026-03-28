---
title: (Oracle) Airflow & Postgres 구축
created: 2026-01-14
modified: 2026-01-14 19:32
cssclasses:
  - max
tags:
  - cloud/airflow
  - cloud/postgresql
---
> [!summary] 요약
> - **인프라 환경 구축:** 먼저 안정적인 서버 운용을 위해 고정 IP를 확보하고 VCN 보안 목록에서 SSH(22), Airflow(8080), DB(5432) 포트를 개방하여 네트워크 기초를 마련합니다. 인스턴스 생성 시에는 초기화 스크립트를 통해 OS 방화벽을 자동으로 해제하여 접속 타임아웃을 방지하고, 생성 후 VNIC 설정을 통해 고정 IP를 연결하여 변하지 않는 접속 환경을 완성합니다.
> - **소프트웨어 및 서비스 구축:** 서버의 타임존을 한국 표준시(KST)로 변경한 후, 데이터 관리의 편의성과 영속성을 위해 PostgreSQL은 호스트 서버에 직접 설치하고 외부 접속이 가능하도록 설정을 변경합니다. Airflow는 환경 격리를 위해 Docker 컨테이너로 구동하며, 단일 서버에 최적화된 `LocalExecutor`를 사용합니다.
> - **연동 및 최적화:** Docker 컨테이너(Airflow)가 호스트(PostgreSQL)에 효율적으로 접속할 수 있도록 `docker-compose.yaml`에 `extra_hosts` 설정을 추가합니다. 이를 통해 외부 트래픽 노출 없이 내부 주소인 `host.docker.internal`을 사용하여 보안성과 네트워크 성능을 동시에 확보한 하이브리드 아키텍처를 구현합니다.

---
# 0. 들어가며

이전 포스팅에서 Oracle 을 통해 나만의 서버를 구축하였다. (참고: [[💡 Knowledge/💻 Computer-Science/Cloud/(Oracle) 나만의 서버 만들기|(Oracle Cloud) 나만의 서버 만들기]])

이제 하드웨어(서버)가 준비되었으니 소프트웨어를 올릴 차례입니다. 우리의 목표 아키텍처는 다음과 같다.

- **PostgreSQL:** 서버(Host)에 직접 설치 (데이터 영속성 및 관리 용이성)    
- **Airflow:** Docker 컨테이너로 구동 (설치 복잡도 제거 및 환경 격리)

저는 mac에서 termius 라는 앱을 이용하여, 서버에 접속해서 작업을 수행하였다. [Termius 설치](https://www.warp.dev/modern-terminal?utm_source=google&utm_medium=pmax&utm_campaign=pmax_core&gad_source=1&gad_campaignid=21556975801&gbraid=0AAAAAoTBvvqR8vOEHUyNo-4tpNE-cGAlC&gclid=CjwKCAiAmp3LBhAkEiwAJM2JUADrZRQxc7vsOwvVoD5ydt3lqv6SjGl_qWZ9yDWDPpct_7BNizPvlRoCfIAQAvD_BwE)

(해당 내용도 Gemini Pro의 도움을 받았다!)

---

# 1. 서버 기초 설정 (타임존 변경)

클라우드 서버는 기본적으로 세계 표준시(UTC)로 설정되어 있다. 데이터 수집 및 Airflow 스케줄링 등의 편의를 위해 KST(한국 시간)로 변경하였다.

```Bash
# 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# 한국 시간으로 변경
sudo timedatectl set-timezone Asia/Seoul

# 확인
date  # KST라고 나오면 성공
```

---
# 2. PostgreSQL 설치 (Host Install)

> **_Docker로 DB를 띄울 수도 있지만, 데이터의 안전한 보관과 외부(내 로컬 PC, DataGrip 등) 접속 편의를 위해 서버에 직접 설치하는 방식을 선택_**

## 2.1 설치 및 설정

```bash
# PostgreSQL 설치
sudo apt install postgresql postgresql-contrib -y

# 부팅 시 자동 시작 등록 및 실행
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 2.2 외부 접속 허용 (중요)

기본적으로 Postgres는 로컬 접속만 허용하므로, 외부 접속을 위해 두 가지 파일을 수정해야 한다

#### 1) postgresql.conf 수정 (모든 IP에서 접속 허용)
```bash
# 설정 파일 열기 (nano 에디터 사용)
sudo nano /etc/postgresql/16/main/postgresql.conf
# (버전 16이 아니라면 14, 15 등 설치된 버전 숫자로 경로 확인 필요)
```

- `Ctrl + W`를 눌러 `listen_addresses`를 검색    
- 주석(`#`)을 제거하고 `localhost`를 `*`로 변경
	- AS-IS: `#listen_addresses = 'localhost'`
	- TO-BE: `listen_addresses = '*'`        
- `Ctrl + O` (저장) -> `Enter` -> `Ctrl + X` (나가기)

#### 2) pg_hba.conf 수정 (인증 방식 설정)

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

- 파일 맨 아래로 이동해서 다음 줄 추가하여, 모든 IP 에서 접속 허용

```Plaintext
host    all             all             0.0.0.0/0               scram-sha-256
```

#### 서비스 재시작

```bash
sudo systemctl restart postgresql
```

## 2.3 DB 및 유저 생성

프로젝트용 유저와 DB를 생성합니다.
```bash
# postgres 관리자 계정으로 전환
sudo -i -u postgres

# SQL 접속
psql
```

```sql
CREATE USER myuser WITH PASSWORD 'mypassword123';

-- Airflow용 DB 생성
CREATE DATABASE airflow_db;

-- 프로젝트 데이터 저장용 DB 생성
CREATE DATABASE project;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE airflow_db TO myuser;
GRANT ALL PRIVILEGES ON DATABASE project TO myuser;
```

---

# 3. Airflow 설치 (Docker Compose)

> **_Airflow는 의존성 패키지가 많아 직접 설치(Native Install)하면 꼬이기 쉬워 깔끔하게 Docker를 사용_**

## 3.1 Docker 설치

오라클 A1 인스턴스는 ARM64 아키텍처이지만, Docker는 이를 완벽하게 지원합니다. 공식 문서를 참고해 Docker Engine과 Docker Compose를 설치합니다.

```bash
# 1. Docker 필수 패키지 설치
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# 2. Docker 공식 GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 3. 레포지토리 추가 (ARM64 아키텍처 자동 인식)
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Docker Engine 설치
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# 5. 권한 설정 (sudo 없이 docker 쓰기 위함)
sudo usermod -aG docker $USER

# 6. 적용을 위해 세션 재접속 필요 (exit 후 다시 접속)
exit
```

## 3.2 Airflow 실행 및 설정

홈 디렉토리에 `airflow` 폴더를 만들고 `docker-compose.yaml`을 작성했습니다. 여기서 중요한 설정 포인트가 두 가지 있습니다.

#### 프로젝트 폴더 생성 및 이동
```bash
cd ~
mkdir airflow
cd airflow
mkdir -p ./dags ./logs ./plugins ./config
```

#### `docker-compose.yaml` 파일 작성

Airflow 실행 설정을 담은 파일 생성 후, 내용 붙여넣기 (**호스트 DB(PostgreSQL)와의 연결**을 위해 `extra_hosts` 설정을 포함)

```bash
# 파일 생성 및 편집
nano docker-compose.yaml
```

```YAML
version: '3.8'

x-airflow-common:
  &airflow-common
  image: apache/airflow:2.10.4  # 최신 버전
  environment:
    &airflow-common-env
    AIRFLOW__CORE__EXECUTOR: LocalExecutor  # 단일 서버용 최적 모드
    AIRFLOW__CORE__SQL_ALCHEMY_CONN: postgresql+psycopg2://airflow:airflow@postgres/airflow
    AIRFLOW__CORE__FERNET_KEY: ''
    AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION: 'true'
    AIRFLOW__CORE__LOAD_EXAMPLES: 'false'  # 예제 DAG 끄기 (깔끔하게)
    AIRFLOW__API__AUTH_BACKEND: 'airflow.api.auth.backend.basic_auth,airflow.api.auth.backend.session'
  volumes:
    - ./dags:/opt/airflow/dags
    - ./logs:/opt/airflow/logs
    - ./plugins:/opt/airflow/plugins
    - ./config:/opt/airflow/config
  user: "${AIRFLOW_UID:-50000}:0"
  depends_on:
    &airflow-common-depends-on
    postgres:
      condition: service_healthy
  # ★ 중요: 컨테이너 내부에서 호스트(내 서버)의 DB에 접속하기 위한 설정
  extra_hosts:
    - "host.docker.internal:host-gateway"

services:
  # 1. Airflow 메타데이터용 내부 DB (사용자 DB와 분리)
  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: airflow
      POSTGRES_PASSWORD: airflow
      POSTGRES_DB: airflow
    volumes:
      - postgres-db-volume:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "airflow"]
      interval: 5s
      retries: 5
    restart: always

  # 2. Airflow 웹 서버 (UI)
  airflow-webserver:
    <<: *airflow-common
    command: webserver
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "--fail", "http://localhost:8080/health"]
      interval: 10s
      timeout: 10s
      retries: 5
    restart: always

  # 3. Airflow 스케줄러 (작업 관리)
  airflow-scheduler:
    <<: *airflow-common
    command: scheduler
    healthcheck:
      test: ["CMD", "curl", "--fail", "http://localhost:8974/health"]
      interval: 30s
      timeout: 10s
      retries: 5
    restart: always

  # 4. 초기화 컨테이너 (최초 1회 실행 후 종료됨)
  airflow-init:
    <<: *airflow-common
    command: version
    environment:
      <<: *airflow-common-env
      _AIRFLOW_DB_UPGRADE: 'true'
      _AIRFLOW_WWW_USER_CREATE: 'true'
      _AIRFLOW_WWW_USER_USERNAME: ${_AIRFLOW_WWW_USER_USERNAME:-airflow}
      _AIRFLOW_WWW_USER_PASSWORD: ${_AIRFLOW_WWW_USER_PASSWORD:-airflow}
    user: "0:0"
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs
      - ./plugins:/opt/airflow/plugins

volumes:
  postgres-db-volume:
```

> **Point 1: `LocalExecutor` 사용 이유**

보통 상용 환경에서는 `CeleryExecutor` + Redis 조합을 쓰지만, 우리는 단일 서버에서 돌리는 개인 프로젝트입니다. 불필요한 리소스 낭비를 줄이고 구성을 단순화하기 위해 로컬에서 바로 작업을 수행하는 `LocalExecutor`가 가장 효율적입니다.
```YAML
environment:
  AIRFLOW__CORE__EXECUTOR: LocalExecutor
```
> **Point 2: `extra_hosts` 설정 (Linux Docker 필수)**

Docker 컨테이너(Airflow) 안에서 내 서버(Postgres)를 `host.docker.internal`이라는 이름으로 부르기 위한 설정입니다. (Mac/Windows Docker와 달리 리눅스에서는 이 설정을 직접 넣어줘야 한다.

```YAML
extra_hosts:
  - "host.docker.internal:host-gateway"
```   

#### 환경변수 설정 및 초기화

현재 사용자의 권한을 Docker에 전달하기 위해 `.env` 파일을 생성

```bash
echo "AIRFLOW_UID=$(id -u)" > .env
```

최초 한 번 실행해줍니다. `airflow-init` 컨테이너가 실행됐다가 성공적으로 종료(`exited with code 0`)되어야 합니다.

```bash
# 초기화
docker compose up airflow-init

# 실행
docker compose up -d

# 확인
docker compose ps
```

---

# 4. 웹 접속 및 DB 연결 테스트

Airflow 웹 UI(`http://고정IP:8080`)에 접속한 뒤, `Admin -> Connections`에서 DB 연결 정보를 등록합니다. 이때 가장 고민되었던 부분이 바로 **Host 주소**였습니다.

> [!tip] 내 서버에 고정 IP가 있는데, 왜 `host.docker.internal` 사용 이유
> **이유 1: 보안 (Security)**
> - **고정 IP 사용 시:** 트래픽이 서버 밖으로 나갔다가 다시 공인 IP를 타고 들어옵니다. 이를 위해서는 방화벽(VCN)에서 DB 포트(5432)를 전 세계에 열어둬야 합니다.
> - **내부 주소 사용 시:** 트래픽이 외부로 나가지 않고 서버 내부(Docker Bridge)에서만 돕니다. 나중에 보안을 위해 5432 포트를 닫아버려도 Airflow는 여전히 DB에 접속할 수 있습니다.
> 
> **이유 2: 효율성 (Performance)**
> - 방문을 열고 바로 옆방(내부 통신)으로 가는 것과, 현관문을 나가서 전화를 걸어 부르는 것(외부 통신)의 차이입니다. 내부 통신이 네트워크 지연(Latency) 없이 훨씬 빠르고 안정적입니다.

#### 최종 연결 설정

- Conn Id: `사용자설정`
- Conn Type: `Postgres`
- **Host: `host.docker.internal`**
- Database: `project`
- Login/Password: (설정한 계정 정보)
---
