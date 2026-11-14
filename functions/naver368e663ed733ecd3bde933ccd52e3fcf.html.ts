// 네이버 서치어드바이저 소유 확인 파일. public/은 빌드마다 비워져서 Function으로 서빙한다.
export const onRequestGet = (): Response =>
  new Response("naver-site-verification: naver368e663ed733ecd3bde933ccd52e3fcf.html", {
    headers: { "content-type": "text/html; charset=utf-8" },
  })
