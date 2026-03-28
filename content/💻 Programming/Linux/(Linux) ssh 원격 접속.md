---
title: (Linux) ssh 원격 접속
created: 2025-10-31
modified: 2025-10-31 15:06
cssclasses:
  - max
tags:
  - linux/ssh
---
> [!summary] 요약
> - 

---

# 1. 로컬 내 ssh-key 생성

- `id_rsa`: 개인키
- `id_rsa.pub`: 공개키

```bash
# 1. 로컬에서 키 생성 (없으면)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# 2. 공개키를 원격 서버에 복사
ssh-copy-id <USER>@<REMOTE_SERVER_IP>
# 3. 접속 테스트 (패스워드 없이 접속 가능)

```

# 2. 원격 서버 내 key 복사

---
>[!example] 참고사이트
>- 