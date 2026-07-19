#!/bin/bash
#
# deploy-dev.sh - Quartz 로컬 미리보기
#   플러그인 설치 후 public 재빌드하고 개발 서버(--serve)를 띄워 브라우저를 자동으로 연다.
#   서버는 Ctrl+C 로 멈추기 전까지 계속 실행된다(=Obsidian 명령도 계속 실행 상태).
#   상세 출력은 로그파일로 보내고, 실패할 때만 마지막 로그를 콘솔에 보여준다.
#
set -u
export PATH="$PATH:/opt/homebrew/bin"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/tmp/quartz-dev.log"

cd "$REPO" || { echo "[ERROR] repo 경로 없음: $REPO"; exit 1; }

echo "[START] 개발 서버 준비 중... 준비되면 브라우저가 자동으로 열립니다 (로그: $LOG)"

echo "플러그인 설치..." | tee "$LOG"
npx quartz plugin install >> "$LOG" 2>&1 || exit 5

# 이전 preview 서버가 안 죽고 8080을 물고 있으면 새 서버가 못 뜨므로 먼저 정리한다.
lsof -ti tcp:8080 | xargs kill 2>/dev/null
sleep 1  # 포트가 완전히 풀릴 때까지 잠깐 대기

# 빌드 시간이 들쭉날쭉하므로 고정 대기 대신, 새 서버가 실제로 응답하면 그때 브라우저를 연다.
# (최대 60초 폴링)
(
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null "http://localhost:8080"; then
      open "http://localhost:8080"
      break
    fi
    sleep 1
  done
) &

# --serve 는 정상일 땐 종료되지 않는다. 즉 여기서 exit 하면 무조건 오류다.
npx quartz build --serve >> "$LOG" 2>&1
status=$?

echo "[ERROR] 개발 서버 종료됨 (exit $status). 마지막 로그:"
tail -n 15 "$LOG"
exit "$status"
