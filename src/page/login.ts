// jwt 최초 로그인
const jwt = document.getElementById("add") as HTMLInputElement;
if (jwt) {
    jwt.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = document.getElementById("id") as HTMLInputElement;
        const passwd = document.getElementById("passwd") as HTMLInputElement;

        // 로그인 body 타입
        type loginbody = {
            id: string;
        };
        const reqjwt = await fetch("/login/loginjwt", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id.value,
                passwd: passwd.value,
            } as loginbody),
        });
        const jwttoken: login = await reqjwt.json();

        localStorage.setItem("login", JSON.stringify(jwttoken));
        window.location.href = "/home";
    });
}

//구글 최초 로그인
const google = document.getElementById("google_login");
if (google) {
    const google = async () => {
        const token = await fetch("/login/googlegettoken", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: window.location.search,
            }),
        });

        const googletoken: login = await token.json();

        if (token.ok) {
            localStorage.setItem("login", JSON.stringify(googletoken));
            window.location.href = "/home";
        } else {
            // 오류 발생시 /login 으로
            console.log(googletoken);
            window.location.href = "/login";
        }
    };
    google();
}

// 네이버 최초 로그인
const naver = document.getElementById("naver_login");
if (naver) {
    const naver = async () => {
        const token = await fetch("/login/navergettoken", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: window.location.search,
            }),
        });

        const navertoken: login = await token.json();

        if (token.ok) {
            localStorage.setItem("login", JSON.stringify(navertoken));
            window.location.href = "/home";
        } else {
            // 오류 발생시 /login 으로
            console.log(navertoken);
            window.location.href = "/login";
        }
    };
    naver();
}
