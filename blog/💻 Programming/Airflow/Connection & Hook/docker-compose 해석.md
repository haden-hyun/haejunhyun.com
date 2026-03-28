---
title: docker-compose 해석
created: 2024-05-08
modified: 2024-05-08 23:34
cssclasses:
  - max
tags:
  - airflow
  - airflow/docker-compose
  - airflow/도커컴포즈
  - 도커컴포즈
---
## 도커 컴포즈 목적
> [!hint] 목적과 서비스
> - 목적: 1개 이상 도커 컨테이너 생성 시 스크립트 하나(docker-compose.yaml)로 컨테이너들 설정을 관리해주는 Docker의 기능
> - 서비스: yaml 파일이 있는 위치에서 `sudo docker compose up`명령어 입력

## 도커 컴포즈 해석
#### 1) 계층적 구조
- json, xml과 같이 key, value로 구성되며 계측적 구조

#### 2) 1 Level
- `version` : yaml 파일의 버전 정보
- `x-airflow-common`: Extention Fields > 컨테이너에 공통 적용될 항목들 정의 
- `services`: 컨테이너 실행할 서비스 정의
- `volumes`: 컨테이너 할당할 volume 정의
- `networks`: 컨테이너에 연결할 network 정의
	- 기본적으로 작성 X
	- IP 또는 네트워크 적용시 작성
###### 2-1) `x-airflow-common`
- 공통 지정할 항목을 `&`붙여서 지정
- 컨테이너 생성 시, `airflow-common`, `airflow-common-env`, `airflow-common-depends-on`을 받음
![[Pasted image 20240508234413.png|center|800x500]]

###### 2-2) `services`
- 컨테이너에 올릴 서비스 지정
	- 예) 웹서버, postgres 등
- `airflow-webserver`애 `x-airflow-common`에서 설정한 `image, environment, depends_on` 등이 들어감
- 이 때, `depends_on`이 다시 등장하는 경우 위에서 작성된 건 무시되고 덮어씌어짐
	- 컨테이너 실행 순서 정의에 활용
	- 위에서 지정된 `airflow_common-depends-on`에서 설정한 `redis, postgres`의 컨디션을 가져옴
	- 즉, `depends_on`에서 설정한 컨테이너(`redis, postgres, codition`)을 띄운 후 본 컨테이너인 `airflow-webserver`가 띄어짐!
![[Pasted image 20240508235049.png|center|1000x300]]

- `postgres` 의 컨테이너 서비스
	- `image`: 사용할 postgres 버전
	- `environment`: postgres에서 사용할 OS 환경변수
	- `volumes`: 컨테이너와 연결할 Local 파일 시스템 경로
		- `postgres-db-volume`: 로컬 파일 시스템 경로
			- Level 1의 `volumes` 에서 정의됨
		- `/var/lib/postgresql/data`: 연결할 컨테이너 경로
		- **Why? 컨테이너를 내렸다가 올릴 때 DB에 저장된 파일을 로컬에 옮겨야 DB내 데이터가 사라지지 않음!**
	- `ports`: 로컬과 docker에 포트 연결 방법
		- 예를 들어, WSL에서의 포트는 5432가 여러 개인 경우, 로컬에서는 5432, 5431 각기 설정해야함
		- 즉, 로컬port:컨테이너port

![[Pasted image 20240508235936.png]]

![[Pasted image 20240509000620.png]]

- `redis`
	- `expose`: 6379
		- 내부 컨테이너 간 연동 > 외부에서 연동 X
		- `ports`는 외부와 컨테이너 연결

![[Pasted image 20240509000955.png|center|500]]
###### 2-3) `volumes`
- 컨테이너에 사용될 볼륨을 미리 정의
- `postgres-db-volume`이 새로 만들 볼륨 이름
- 볼륨 정보 확인 방법
	- 볼륨 리스트 확인; `sudo docker volume ls`
	- 볼륨 상세 보기: `sudo docker volume inspect {volume_id}`
![[Pasted image 20240508235518.png]]

###### 2-4) `networks`
- 컨테이너 네트워크 정보 구성
- 중요변수
	- `subnet`: 
	- `gateway`: 
- 네트워크 정보 확인 방법
	- 네트워크 리스트: `sudo docker network ls`
	- 네트워크 상세 보기: `sudo docker network inspect {network_id}`

![[Pasted image 20240509001142.png]]