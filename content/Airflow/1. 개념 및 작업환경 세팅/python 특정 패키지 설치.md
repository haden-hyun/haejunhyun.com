---
title: python 특정 패키지 설치
created: 2024-06-28
tags:
  - airflow/python
  - airflow/package
  - airflow/image
---
> [!hint] 요약
> 1. **목적**: Airflow 내 Python의 특정 패키지를 설치
> 2. `requirements.txt`를 통한 설치할 패키지 버전 목록 작성
> 3. `Dockerfile` 을 통해 위 txt 파일을 Docker 이미지로 복사
> 4. 위 적용할 이미지를 생성 또는 복사

---
# 1. Python 패키지 목록
1. vscode 내 airflow 프로젝트 파일 내 `requirements.txt` 생성
2. txt 파일에 설치할 패키지 명과 버전 목록을 작성

```txt
mojito2==0.1.6
PyJWT==2.1.0
``` 
# 2. 이미지 복사
- 로컬에서 작성한 `requirements.txt`을 **Docker 이미지로 복사**
- vscode 내 airflow 프로젝트 파일 내 `Dockerfile` 생성
- `FROM` 뒤에 Image 이름 작성
	- `apache/airflow:2.9.1`: 내가 작성한 기존 Image 이름
```docker
FROM apache/airflow:2.9.1
COPY requirements.txt /requirements.txt
RUN pip install --upgrade pip
RUN pip install -r /requirements.txt
```
# 3. 도커 파일 빌드
- 위에서 수정한 Image를 새롭게 생성하거나 기존 Imgae 덮어쓰기
- 이때, 위에서 생성한 `Dockerfile`을 참고함
	- `extending-airflow:latest`: 새롭게 생성한 이미지 이름과 태그명
- **(추천) 기존 Image를 계속 사용할 경우, 기존 이미지 이름을 설정하여 빌드**
```bash
docker build --tag extending-airflow:latest
```

<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/%EB%8F%84%EC%BB%A4%20%ED%8C%8C%EC%9D%BC%20%EB%B9%8C%EB%93%9C.png" width="1500" height="150" />
</div>

# 4. 관리 문서 수정
- 새롭게 생성한 Image를 Airflow에 적용할 경우, `docker-compose.yaml` 내 Image 경로 수정
	- (기존)`apache/airflow:2.9.1` -> (수정)`extending-airflow:latest`
- **단, 기존 Image 사용할 경우 수정 안해도 됨**


<div align="center">
  <img src="https://raw.githubusercontent.com/haden-hyun/obsidian-image/main/images/%EB%8F%84%EC%BB%A4_%EC%9D%B4%EB%AF%B8%EC%A7%80_%EC%88%98%EC%A0%95.png" width="1000" height="150" />
</div>

---
> [!example] 참고 사이트
> - [(Youtube)Airflow 내 python 패키지 설치](https://www.youtube.com/watch?v=0UepvC9X4HY)
> - [Docker를 이용한 Python 개발환경 구축](https://heekng.tistory.com/117)