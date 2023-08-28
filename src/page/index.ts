// 로그인 타입
type login = {
    type: string;
    access_token: string;
    refresh_token: string | undefined; //jwt 로그인시
};
const login: login = JSON.parse(localStorage?.getItem("login") as string);

// 브라우저에서 로그인이 된 상태가 아닌경우
if (!login) {
    window.location.href = "/login";
}

//jwt
if (login.type === "jwt") {
    const res = async () => {
        const reqverify = await fetch("/login/verifyjwt", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: login.access_token,
            }),
        });

        // 정상 응답 타입
        type resjwt = {
            exp: number;
            iat: number;
            id: string;
            iss: string;
        } & {
            //오류 응답 타입
            err: string | undefined;
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
            type resrefresh = {
                login: login;
                userdata: resjwt;
            } & {
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
            localStorage.setItem("login", JSON.stringify(resrefresh.login));

            // 토큰 데이터 저장
            userdata = resrefresh.userdata;
        } else if (userdata.err) {
            // access_token 인증시 알 수 없는 오류 발생
            localStorage.removeItem("login");
            window.location.href = "/login";
            return;
        }

        // 화면 닉네임 표시
        const text = document.getElementById("name");
        const expired_time = document.getElementById("ann");

        if (text && expired_time) {
            text.innerHTML = `${userdata.id}님 환영합니다`;
            expired_time.innerHTML = `access_token 만료까지 남은시간 ${
                userdata.exp - Math.floor(Date.now() / 1000)
            }`;
        }
    };

    res();
}

//로그아웃 버튼
const logout = document.getElementById("logout") as HTMLButtonElement;
logout.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("login");
    window.location.href = "/login";
});
