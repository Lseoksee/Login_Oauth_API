// 로컬스토리지 로그인 저장 타입
type login = {
    type: string;
    access_token: string;
    refresh_token: string;
    expires_in: number; // 토큰이 만료되는 시간 (밀리초)
    data: {
        // jwt 로그인시
        exp: number;
        iat: number;
        id: string;
        iss: string;
    } & {
        // 구글 로그인시
        email: string; //이메일
        family_name: string; //성
        given_name: string; //이름
        id: string;
        locale: string; //프사 경로
        name: string;
        picture: string;
    } & {
        // 네이버 로그인시
        birthyear: string;
        email: string;
        gender: string; // M, G
        id: string;
        mobile: string;
        mobile_e164: string;
        name: string;
    };
    /* DB 가 없으므로 refresh_token도 localStorage 에 저장하지만 보안 이슈로 반드시 DB에 저장해야함  */
};

let login: login = JSON.parse(localStorage?.getItem("login") as string);

// 브라우저에서 로그인이 된 상태가 아닌경우
if (!login) {
    window.location.href = "/login";
}

//jwt
if (login.type === "jwt") {
    // 화면 닉네임 표시 (응답 속도로 인해 미리 로드)
    const text = document.getElementById("name");
    const expired_time = document.getElementById("ann");

    if (text && expired_time) {
        text.innerHTML = `${login.data.id}님 환영합니다`;
        expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
            (login.expires_in - Date.now()) / 1000
        )}초`;
    }

    const jwt = async () => {
        const reqverify = await fetch("/login/verifyjwt", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_token: login.access_token,
            }),
        });

        // 정상 응답 타입 (사실상 해당 데이터 사용안함)
        type resjwt = {
            exp: number;
            iat: number;
            id: string;
            iss: string;
        } & {
            //오류 응답 타입
            err: string;
        };
        let userdata: resjwt = await reqverify.json();
        console.log(userdata);

        // refresh 토큰
        if (userdata.err === "jwt expired") {
            const reqrefresh = await fetch("/login/refreshjwt", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: login.access_token,
                    refresh_token: login.refresh_token,
                } as login),
            });

            // refreshjwt 응답
            type resrefresh = login & {
                err: "refresh_fail";
            };
            const resrefresh: resrefresh = await reqrefresh.json();
            console.log(resrefresh);

            if (resrefresh.err) {
                // refresh_token이 만료되거나 갱신 불가
                localStorage.removeItem("login");
                window.location.href = "/login";
                return;
            }

            // 갱신한 토큰 localStorage 에 저장
            localStorage.setItem("login", JSON.stringify(resrefresh));

            // localStorage 갱신
            login = JSON.parse(localStorage?.getItem("login") as string);
        } else if (userdata.err) {
            // access_token 인증시 알 수 없는 오류 발생
            localStorage.removeItem("login");
            window.location.href = "/login";
            return;
        }
    };
    jwt().then(() => {
        if (expired_time) {
            // 만료시간을 즉각적으로 바꾸기 위한 코드
            expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
                (login.expires_in - Date.now()) / 1000
            )}초`;
        }
    });
}

// 구글
if (login.type === "google") {
    // 화면 닉네임 표시 (응답 속도로 인해 미리 로드)
    const text = document.getElementById("name");
    const expired_time = document.getElementById("ann");

    if (text && expired_time) {
        text.innerHTML = `${login.data.family_name}${login.data.given_name}님 환영합니다`;
        expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
            (login.expires_in - Date.now()) / 60000
        )}분`;
    }

    const google = async () => {
        // 토큰 유효성 검사 (토큰 만료는 1시간)
        const user = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                method: "get",
                headers: {
                    Authorization: `Bearer ${login.access_token}`,
                },
            }
        );

        // 토큰 만료시
        if (!user.ok) {
            const reqrefresh = await fetch("/login/refreshgoogle", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: login.access_token,
                    refresh_token: login.refresh_token,
                }),
            });

            const resrefresh: login = await reqrefresh.json();
            console.log(resrefresh);

            if (!reqrefresh.ok) {
                return;
                // refresh_token이 만료되거나 갱신 불가
                // localStorage.removeItem("login");
                // window.location.href = "/login";
                // return;
            }

            // 갱신한 토큰 localStorage 에 저장
            localStorage.setItem("login", JSON.stringify(resrefresh));

            // localStorage 갱신
            login = JSON.parse(localStorage?.getItem("login") as string);
        }
    };
    google().then(() => {
        if (expired_time) {
            // 만료시간을 즉각적으로 바꾸기 위한 코드
            expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
                (login.expires_in - Date.now()) / 60000
            )}분`;
        }
    });
}

// 네이버
if (login.type === "naver") {
    // 화면 닉네임 표시 (응답 속도로 인해 미리 로드)
    const text = document.getElementById("name");
    const expired_time = document.getElementById("ann");

    if (text && expired_time) {
        text.innerHTML = `${login.data.name}님 환영합니다`;
        expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
            (login.expires_in - Date.now()) / 60000
        )}분`;
    }

    const naver = async () => {
        // 토큰 유효성 검사 (토큰 만료는 1시간)
        const user = await fetch("login/naververify", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                access_token: login.access_token,
            }),
        });

        // 토큰 만료시
        if (!user.ok) {
            const reqrefresh = await fetch("/login/refreshnaver", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token: login.access_token,
                    refresh_token: login.refresh_token,
                }),
            });

            const resrefresh: login = await reqrefresh.json();
            console.log(resrefresh);

            if (!reqrefresh.ok) {
                return;
                // refresh_token이 만료되거나 갱신 불가
                // localStorage.removeItem("login");
                // window.location.href = "/login";
                // return;
            }

            // 갱신한 토큰 localStorage 에 저장
            localStorage.setItem("login", JSON.stringify(resrefresh));

            // localStorage 갱신
            login = JSON.parse(localStorage?.getItem("login") as string);
        }
    };
    naver().then(() => {
        if (expired_time) {
            // 만료시간을 즉각적으로 바꾸기 위한 코드
            expired_time.innerHTML = `access_token 만료까지 남은시간: ${Math.round(
                (login.expires_in - Date.now()) / 60000
            )}분`;
        }
    });
}

//로그아웃 버튼
const logout = document.getElementById("logout") as HTMLButtonElement;
logout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("login");
    window.location.href = "/login";
});
