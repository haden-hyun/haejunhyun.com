#!/bin/bash
#
# deploy-clean.sh - Quartz 완전 재배포(캐시 삭제)
#   public 과 .quartz-cache 를 지우고 플러그인을 재설치한 뒤 처음부터 다시 빌드해서 배포한다.
#   빌드가 이상하거나 캐시 때문에 반영이 꼬일 때 사용한다.
#   · .quartz-cache 는 빌드 캐시(quartz/cli/constants.js 의 cacheDir)이고, 설치된 플러그인은
#     별도 디렉터리인 .quartz/plugins 에 있으므로 이 삭제로 플러그인이 지워지지 않는다.
#     (플러그인은 이어지는 `quartz plugin install` 단계에서 다시 설치된다.)
#   나머지 로직(변경 없으면 스킵 / --force-with-lease / 로그)은 deploy.sh 와 동일.
#
set -u
export PATH="$PATH:/opt/homebrew/bin"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LOG="/tmp/quartz-clean.log"
BRANCH="v5"

cd "$REPO" || { echo "[ERROR] repo 경로 없음: $REPO"; exit 1; }

# 눌렀을 때 바로 뜨는 시작 알림 (realtime 출력 모드에서 즉시 표시됨)
echo "[START] 완전 재배포 시작 - 캐시 삭제 후 빌드/ push합니다..."

run() {
  echo "==== $(date '+%F %T') clean deploy 시작 ===="
  echo "public / .quartz-cache 삭제..."
  rm -rf public .quartz-cache

  echo "플러그인 설치..."
  npx quartz plugin install || return 5

  echo "클린 빌드..."
  npx quartz build || return 10

  echo "public 스테이징..."
  git add public

  if git diff --cached --quiet; then
    return 20            # 변경 없음
  fi

  echo "커밋..."
  git commit -m "Clean: $(date +%Y-%m-%d_%H:%M)" || return 30

  echo "push (origin/$BRANCH)..."
  git push origin "$BRANCH" --force-with-lease || return 40

  echo "==== 완료 ===="
  return 0
}

run > "$LOG" 2>&1
status=$?

case "$status" in
  0)  echo "[OK] 완전 재배포 완료 -> Cloudflare 반영 중" ;;
  20) echo "[SKIP] 변경 없음 - 배포 스킵" ;;
  5)  echo "[ERROR] 플러그인 설치 실패. 로그 마지막:";  tail -n 15 "$LOG" ;;
  10) echo "[ERROR] 빌드 실패. 로그 마지막:";         tail -n 15 "$LOG" ;;
  30) echo "[ERROR] 커밋 실패. 로그 마지막:";         tail -n 15 "$LOG" ;;
  40) echo "[ERROR] push 실패(인증 등). 로그 마지막:"; tail -n 15 "$LOG" ;;
  *)  echo "[ERROR] 재배포 실패 (exit $status). 로그 마지막:"; tail -n 15 "$LOG" ;;
esac
exit "$status"
