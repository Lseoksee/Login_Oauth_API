/* 구글 아이디 회원가입 구현 */
import express = require("express");
import fs = require("fs");
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

const privatekey = JSON.parse(fs.readFileSync("PrivateKey.json", "utf-8")); 

const client_id = privatekey.google_client_id;
const client_secret = privatekey.google_client_secret;

const loginpage = "https://accounts.google.com/o/oauth2/v2/auth";   //로그인 페이지
const redirect = "http://korseok.kro.kr/login/resgoogle";   //리다이렉트 주소
const access_token_url = "https://oauth2.googleapis.com/token"; //access_token 얻는 주소
const getuser_url = "https://www.googleapis.com/oauth2/v2/userinfo"; //access_token 으로 정보 얻는 주소

server.get("/login/google", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?client_id=${client_id}&redirect_uri=${redirect}&response_type=code&scope=email profile`;
    res.redirect(url);
});

// 계정 선택후 해당 url로 redirect (수정은 구글 클라우드 에서)
server.get("/login/resgoogle", async (req, res) => {
    const parm = req.query;

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("authuser", parm.authuser as string);
    data.append("code", parm.code as string);
    data.append("prompt", parm.prompt as string);
    data.append("scope", parm.scope as string);
    data.append("client_id", client_id);
    data.append("client_secret", client_secret);
    data.append("redirect_uri", redirect);
    data.append("grant_type", "authorization_code");

    // access_token url
    const access_token = fetch(access_token_url, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: data,
    });
    const restoken = await (await access_token).json();

    // access_token 으로 유저 정보 가져오기
    const getid = fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${restoken.access_token}`,
        },
    });
    const resid = await (await getid).json();

    console.log(resid);
    res.send(resid);
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});
