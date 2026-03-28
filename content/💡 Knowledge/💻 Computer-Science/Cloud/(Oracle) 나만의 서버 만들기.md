---
title: (Oracle) 나만의 서버 만들기
created: 2026-01-14
modified: 2026-01-14 19:24
cssclasses:
  - max
tags:
  - cloud/oracle/instance
  - cloud/oracle/vcn
  - cloud/oracle/ip
---
> [!summary] 요약
> - 오라클 클라우드에서 제공하는 평생 무료 ARM 인스턴스를 활용하여 개인 프로젝트용 서버를 구축하는 전체 과정을 상세히 설명함.
> - 안정적인 서비스 운용을 위해 인스턴스 생성 전 고정 IP를 미리 확보하고 VCN 보안 목록에서 필요한 포트를 개방하여 네트워크 기초를 마련함.
> - 인스턴스 생성 시 초기화 스크립트를 사용하여 OS 내부 방화벽을 자동으로 해제함으로써 빈번하게 발생하는 접속 타임아웃 문제를 사전에 차단함.
> - 서버 생성 완료 후 VNIC 설정에서 기본 할당된 임시 IP를 미리 준비해 둔 고정 IP로 교체하여 주소가 변하지 않는 접속 환경을 확정함.
> - 최종적으로 SSH 키 권한 설정 및 로컬 Config 파일 구성을 통해 VSCode 등에서 간편하고 안전하게 서버에 원격 접속할 수 있도록 설정함.

---

# 0. 들어가며

> [!hint] 사용자 환경
> - 운영체제: Mac
> - 클라우드: Oracle
> - 리젼: 싱가포르
> - 인스턴스: Ubuntu / Ampere (4 OCPU, 24GB RAM)

AWS나 GCP와 달리 오라클 클라우드는 **ARM 기반 인스턴스(4 OCPU, 24GB RAM)** 를 **평생 무료(Always Free)** 로 제공하기 때문에, 개인 프로젝트용 서버로는 좋다.

그러나, 위와 같이 좋은 사양의 인스턴스를 생성하는데 사용자의 리젼이 가득차서 생성되지 않는 경우가 있다. 그래서 저는 리전을 싱가포르로 설정하고, 유료로 전환하였다.(사용량을 초과하지 않는다면, 유료 계정이라도 금액이 부과되지 않는다.)

이러한 환경을 구성한 후 나만의 서버 구축을 위해 **VCN 네트워크 구성부터 인스턴스 생성, 그리고 가장 까다로웠던 고정 IP 할당과 방화벽 해제**까지의 전 과정을 상세히 기록하였다.

(거의 모든 도움은 Gemini Pro가 주었다. 그저 갓..)

---
# 1. 사전 준비: 고정 IP (Reserved Public IP) 확보

> **_Airflow UI나 API 이용을 위해 IP가 변경되지 않는 환경이 필요하여, 스턴스 생성 전  IP 주소를 먼저 설정_**

1. OCI 콘솔 메뉴 $\rightarrow$ **Networking** $\rightarrow$ **IP Management** $\rightarrow$ **Reserved Public IPs**.
2. `Reserve Public IP Address` 클릭. 
3. IP 명 등록: 프로젝트 식별을 위해 명확한 이름 사용 (`ip-project`)
4. IP Source: (기본) `Oracle` 선택 후 생성.    
5. 결과: `158.xx.xx.xx`와 같은 고정 IP를 확보

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-reserved-ip.png" width="1000" height="300" />
  <div style="font-size: 15px; text-align: right; width: 1000; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

---

# 2. 네트워크(VCN) 및 보안 설정

> **_서버가 활동할 가상 네트워크 도로를 깔아줍니다. 가장 실수가 잦은 방화벽(Security List) 설정이 핵심_**

## 2.1 VCN 생성

1. **Networking** $\rightarrow$ **Virtual Cloud Networks**.
2. `Start VCN Wizard` 클릭 $\rightarrow$ **"Create VCN with Internet Connectivity"** 선택
3. VCN Name : `vcn-project`    
4. CIDR 등은 기본값 유지 후 생성

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-vcn.png" width="900" height="400" />
  <div style="font-size: 15px; text-align: right; width: 900px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

## 2.2 방화벽(Security List) 포트 개방

> **_외부에서 접속해야 할 포트를 미리 열기_**


생성된 VCN 클릭 $\rightarrow$ **Security Lists** $\rightarrow$ **Default Security List**.    

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/orcale-vcn-security.png" width="800" height="400" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

**Ingress Rules(수신 규칙)** 에 다음 규칙을 추가합니다.
- **주의:** `Source Port`는 비워두고, 반드시 **`Destination Port`** 에 입력해야 합니다.

| 용도      | Source CIDR | Protocol | Destination Port | 설명             |
| ------- | ----------- | -------- | ---------------- | -------------- |
| SSH     | 0.0.0.0/0   | TCP      | 22               | 원격 접속용         |
| Airflow | 0.0.0.0/0   | TCP      | 8080             | 웹 UI 접속용       |
| DB      | 0.0.0.0/0   | TCP      | 5432             | PostgreSQL 접속용 |

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-vcn-ingress-rule.png" width="800" height="400" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

---

# 3. 인스턴스 생성 (방화벽 자동 해제 꿀팁 포함)

> (가장 중요한 단계) 오라클 리눅스나 우분투는 기본적으로 OS 내부 방화벽이 빡빡하게 설정되어 있어, **생성 직후 접속이 안 되는 문제(Timeout)** 가 빈번하다. 이를 해결하기 위해 **초기화 스크립트**를 사용

**Compute** $\rightarrow$ **Instances** $\rightarrow$ `Create Instance]`

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-creaet-instance1.png" width="800" height="300" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>
#### Basic information

- Name: `inst-project`
- Image & Shape
	- Image: `Ubuntu 24.04 Minimal`
	- Shape: `Ampere (ARM) VM.Standard.A1.Flex` (**4 OCPU, 24GB RAM**).

> [!tip] Shape 고급 옵션 (Advanced Options)
> - Management 탭 중 Initalizaion script
> - `Paste cloud-init script`란에 아래 코드 붙여넣기
> - 서버 생성 시 OS 방화벽을 자동으로 내리는 명령어

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-create-instance2.png" width="800" height="500" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

```txt
#cloud-config
bootcmd:
  - iptables -F
  - netfilter-persistent save
runcmd:
  - ufw disable
  - iptables -P INPUT ACCEPT
  - iptables -P OUTPUT ACCEPT
  - iptables -P FORWARD ACCEPT
  - netfilter-persistent save
```

#### Networking

(앞 단계인 `Security` 탭은 기본값 유지)
- 앞서 만든 `vcn` 과 Public Subnet 선택
- 만약, 고정 IP 선택창이 안 보일 경우, 일단 **"Automatically assign public IPv4 address"** 를 선택하거나 IP 없이 생성합니다. (향후 고정 IP 할당할 예정)

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-create-instande3.png" width="900" height="400" />
  <div style="font-size: 15px; text-align: right; width: 900px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>


- SSH key: `Generate a key pair` 선택 후 **Private Key 다운로드** (필수!).


<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-create-instande4.png" width="800" height="300" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

---

# 4. 고정 IP 할당 (생성 후 교체 방식)

> **_인스턴스 생성 시 고정 IP를 바로 붙이지 못한 경우 기존 임시 IP 제거 후 고정 IP 할당_**

인스턴스 상세 페이지 $\rightarrow$ **Networking** 탭 $\rightarrow$ **Attached VNICs** $\rightarrow$ **Primary VNIC** 클릭

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-create-instande5.png" width="900" height="400" />
  <div style="font-size: 15px; text-align: right; width: 900px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

 **IPv4 Addresses** 탭 클릭 $\rightarrow$ `...` 클릭 $\rightarrow$ `edit`
 - 처음에는 Public Ip가 임시 (`ephemeral`) 로 되어 있음
 - **임시 IP 제거**
	 - Edit Public IP
	 - **`No public IP`** 선택 후 업데이트. (잠시 후 IP가 사라짐)
 - **예약 IP 할당**
	 - Edit Public IP
	 - **`Reserved public IP`** 선택 후 업데이트
- **결과 확인:** 인스턴스에 내가 원하던 고정 IP(`158.xx...`)가 정상적으로 할당됨

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/oracle-create-instande6.png" width="800" height="400" />
  <div style="font-size: 15px; text-align: right; width: 800px; margin-top: 3px;">
    <em>source: </em>
  </div>
</div>

---

# 5. 로컬 접속 환경 구성 (Mac, Vscode)

> **_마지막으로 내 컴퓨터에서 편하게 접속하기 위한 설정 (사용: Mac / Cursor)_**

#### SSH 키 권한 설정

다운로드 받은 키 파일에 이름을 수정한 채(`key_name.key`) `~/.ssh` 폴더로 옮기고 권한을 수정
- `chmod 600` 을 통해 권한을 좁혀야 접속이 허용

```bash
mkdir -p ~/.ssh
mv ~/Downloads/ssh-key-xxxx.key ~/.ssh/key_name.key
chmod 600 ~/.ssh/key_name.key
```

### SSH Config 구성

config 파일을 열고 아래 내용 추가

```bash
vi ~/.ssh/config
```
```Plaintext
Host ssh_name
    HostName xxx.xx.xx.xx  (할당받은 고정 IP)
    User ubuntu
    IdentityFile ~/.ssh/key_name.key
    Port 22
```

#### VSCode 접속

- `Cmd + Shift + P` $\rightarrow$  **`Remote-SSH: Connect to Host...`**
- **`ssh_name`** 클릭
- 초기에 자신이 맞는 지 물어본다. 이때 `continue` 선택하면, 접속 성공!!

---
# 마치며

이제 OCI의 인스턴스 위에 Airflow와 PostgreSQL을 올릴 준비가 완벽하게 끝났다.

특히 **초기화 스크립트를 통한 방화벽 해제**와 **VNIC 설정을 통한 고정 IP 교체** 과정 덕분에 연결 타임아웃(Timeout) 문제없이 쾌적한 환경을 구축할 수 있다.

다음 포스팅에서는 이 서버 위에 Docker를 활용해 Airflow를 설치하는 과정을 다뤄보겠습니다.

---