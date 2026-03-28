---
title: airflow postgres 컨테이너
created: 2024-05-09
modified: 2024-05-09 00:14
cssclasses:
  - max
tags:
  - airflow
  - airflow/postgresql
---
## Postgres 컨테이너 추가
- `postgres_custom` 이라는 컨테이너 서비스 추가
	- `services:` 하위 항목에 작성
	- `volumes`에 항목 미리 추가
![[Pasted image 20240509002021.png]]
## 컨테이너 고정 IP 할당

> [!warning] 고정IP 설정 이유?
> - 기본적으로 컨테이너들은 유동 IP 지님
> 	- 재기동시 IP 변동 가능
> - 고정 IP 미지정시, 컨테이너들은 default network에 묶임
> 	- 즉, network가 다른 컨테이너들끼리 서로 통신하지 못함
> - 따라서, `networks`를 통해 고정 IP를 할당하여 동일 네트워크에 두고 싶은 컨테이너들끼리 동일 `networks` 할당 필요 

- 새롭게 생성한 `postgres_custom` 서비스에 `networks` 항목 추가
	- 상위 `networks` 항목에서 작성된 `network_custom`을 사용하겠다고 선언
	- `ipv4_address`: 고정 IP
- `services` 와 동일한 계층의 `networks` 항목 생성
	- `network_custom`이라는 네트워크 항목 생성
- 이때, 하나의 컨테이너에만 고정 IP를 부여하는게 아닌 다른 컨테이너에도 `network_custom`을 할당하고, IP를 부여해야함!!
	- 기본 메타 DB 인 `postgres`에 5431을 사용하여 접속할 수 있게 포트 노출

![[Pasted image 20240509002451.png|center|800]]

![[Pasted image 20240509002941.png|center|600]]

###### 대역폭 설정
> [!warning]  172.28.0.0 에서 대역폭 28 사용 이유?
> - defalut network에서 25.0 대역폭을 사용
> - 따라서, 해당 대역폭을 사용하면 안됨!!

> [!summary] 대역폭 확인 방법
> - docker 내 컨테이너 상세 목록 확인
> 	- `sudo docker inspect {CONTAINER ID}`
> - 현재 네트워크 목록 확인
> 	- `sudo docker network ls`
> 	- `NETWORK ID` 확인™

![[Pasted image 20240509004240.png|center]]
## DB 접속
> [!warning] port 설정
> `docker-compose.yaml`에 커스텀 db의 Port를 9999로 설정하여도
> airflow 내에서는 5432로 지정해야함!!!
> 이는 로컬에서는 9999 포트로 연결하지만, 컨테이너 간 연결은 **5432** 포트로 연결되기 때문임

