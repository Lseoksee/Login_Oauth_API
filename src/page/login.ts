

// jwt 로그인시 이벤트 처리
const loginsubmit = document.getElementById("add") as HTMLInputElement;
loginsubmit.addEventListener("click", async (e) => {
    e.preventDefault();
    const id = document.getElementById("id") as HTMLInputElement;
    const passwd = document.getElementById("passwd") as HTMLInputElement;

    // 로그인 body 타입
    type loginbody = {
        id: string;
        passwd: string;
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
    const jwttoken = await reqjwt.json();
    
    localStorage.setItem("login", JSON.stringify(jwttoken));
    window.location.href = "/home";
});
