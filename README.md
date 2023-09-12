# Login_Oauth_API

-   Node.js 구글, 네이버 & JWT 로그인 구현
-   TCP 소켓을 사용하여 앱 (GUI 환경) 에서 웹 로그인 구현

## 사용법

1. [Node.js를 설치합니다.](https://nodejs.org/ko/download)
2. 해당 리포지토리를 복제합니다.
3. 복제한 폴더로 이동한뒤 `PrivateKey.json`을 수정합니다.

    - `google_redirect_url`: 설정한 리다이렉트 주소
    - `google_client_id`: 발급 받은 구글 Oauth 클라이언트 id
    - `google_client_secret`: 발급 받은 구글 Oauth 시크릿 키

    [구글 클라우드 플렛폼에서 발급](https://console.cloud.google.com/)

    - `naver_redirect_url`: 설정한 리다이렉트 주소
    - `naver_client_id`: 발급 받은 네이버 Oauth 클라이언트 id
    - `naver_client_secret`: 발급 받은 네이버 Oauth 시크릿 키

    [네이버 개발자 센터에서 발급](https://developers.naver.com/)

    - `jwt_secret_key`: JWT 시크릿키(랜덤 문자열로 지정)

4. 해당폴더에서 명령창를 열고 `npm install` 를 입력하여 패키지를 설치합니다.
5. `npm run build` 를 입력하여 프로젝트를 빌드 합니다.

### 웹 로그인

1. `npm run start` 를 입력하여 서버를 시작합니다.
2. 웹 브라우저에서 로컬 주소로 들어가 테스트 합니다

### 앱 로그인

1. `npx ts-node AppLogin/Login_Server.ts` 를 입력하여 로그인 서버를 엽니다.
2. `App.java` 를 실행합니다
