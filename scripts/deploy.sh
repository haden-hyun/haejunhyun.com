#!/bin/bash
#
# deploy.sh - Quartz 일상 배포
#   플러그인 설치 -> 빌드 -> public 커밋 -> 원격(v5) push. push 되면 Cloudflare 가 자동 배포한다.
#   · content 는 심링크 1개로만 추적되므로 스테이징하지 않는다(실효 없음). public 만 커밋.
#   · 변경이 없으면 커밋/푸시를 건너뛴다(빈 커밋으로 체인이 끊기던 문제 해결).
#   · push 는 --force-with-lease 로 원격의 남의 커밋을 덮어쓰지 않는다.
#
set -u
export PATH="$PATH:/opt/homebrew/bin"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/tmp/quartz-deploy.log"
BRANCH="v5"

cd "$REPO" || { echo "[ERROR] repo 경로 없음: $REPO"; exit 1; }

# 눌렀을 때 바로 뜨는 시작 알림 (realtime 출력 모드에서 즉시 표시됨)
echo "[START] 일상 배포 시작 - 빌드 후 push합니다..."

run() {
  echo "==== $(date '+%F %T') deploy 시작 ===="
  echo "플러그인 설치..."
  npx quartz plugin install || return 5

  echo "빌드..."
  npx quartz build || return 10

  echo "public 스테이징..."
  git add public

  if git diff --cached --quiet; then
    return 20            # 변경 없음
  fi

  echo "커밋..."
  git commit -m "Update: $(date +%Y-%m-%d_%H:%M)" || return 30

  echo "push (origin/$BRANCH)..."
  git push origin "$BRANCH" --force-with-lease || return 40

  echo "==== 완료 ===="
  return 0
}

run > "$LOG" 2>&1
status=$?

case "$status" in
  0)  echo "[OK] 배포 완료 -> Cloudflare 반영 중" ;;
  20) echo "[SKIP] 변경 없음 - 배포 스킵" ;;
  5)  echo "[ERROR] 플러그인 설치 실패. 로그 마지막:";  tail -n 15 "$LOG" ;;
  10) echo "[ERROR] 빌드 실패. 로그 마지막:";         tail -n 15 "$LOG" ;;
  30) echo "[ERROR] 커밋 실패. 로그 마지막:";         tail -n 15 "$LOG" ;;
  40) echo "[ERROR] push 실패(인증 등). 로그 마지막:"; tail -n 15 "$LOG" ;;
  *)  echo "[ERROR] 배포 실패 (exit $status). 로그 마지막:"; tail -n 15 "$LOG" ;;
esac
exit "$status"
