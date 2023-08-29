# Login_Oauth_API

Node.js 구글, 네이버 & JWT 로그인 구현

## 사용법

1. [Node.js를 설치합니다.](https://nodejs.org/ko/download)
2. 해당 리포지토리를 복제합니다.
3. 복제한 폴더로 이동한뒤 `PrivateKey.json`을 수정합니다.

   - `google_client_id`: 구글 Oauth 클라이언트 id
   - `google_client_secret`: 구글 Oauth 시크릿 키

    [구글 클라우드 플렛폼에서 발급](https://console.cloud.google.com/)
   - `naver_client_id`: 네이버 Oauth 클라이언트 id
   - `naver_client_secret`: 네이버 Oauth 시크릿 키

    [네이버 개발자 센터에서 발급](https://developers.naver.com/)
   - `jwt_secret_key`: JWT 시크릿키(랜덤 문자열로 지정)
4. 해당폴더에서 명령창를 열고 `npm install` 를 입력하여 패키지를 설치합니다.
5. `npm run build` 를 입력하여 프로젝트를 빌드 합니다.
6. `npm run start` 를 입력하여 서버를 시작합니다.
