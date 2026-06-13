# 사장님 확인/작업 대기 목록

> 제가 자리 비운 동안 자동으로 못 하는 것(계정 로그인·AI 아트 생성 등)만 여기 모아둡니다.
> 돌아오셔서 위에서부터 처리하시면 됩니다. 나머지는 제가 다 구현·검증·푸시해 둡니다.

---

## 1) Vercel 배포 연결 (한 번만, 약 3분)

코드/설정은 모두 준비됨([vercel.json](../vercel.json) 포함). 아래만 해주시면 바로 라이브됩니다.

1. https://vercel.com 접속 → **Continue with GitHub** 로 로그인(계정 없으면 자동 가입).
2. **Add New… → Project** 클릭.
3. `heemkim7/kor-study` 저장소 **Import**.
   - (처음이면 "Install Vercel for GitHub" 로 저장소 접근 권한 한 번 허용 — `kor-study`만 선택해도 됨.)
4. 설정 화면은 **그대로 두고**(자동 감지: Framework=Vite, Build=`npm run build`, Output=`dist`) → **Deploy**.
5. 1~2분 뒤 `https://kor-study-xxxx.vercel.app` 주소가 나옵니다. → 태블릿에서 그 주소로 접속!
   - 홈 화면에서 "홈 화면에 추가"(공유 메뉴) 하면 앱처럼 전체화면 + 오프라인 동작.

> 이후에는 제가 `git push` 할 때마다 Vercel이 **자동 재배포**합니다(추가 작업 없음).
> 주소를 더 예쁘게 바꾸고 싶으면 Vercel 프로젝트 → Settings → Domains 에서 변경 가능.

---

<!-- 아래에 추가 항목이 생기면 제가 이어서 적어둡니다 -->
