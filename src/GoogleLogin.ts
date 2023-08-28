/* 구글 아이디 회원가입 구현 */
import express = require("express");
import { privatekey } from "./Server";
const google = express.Router();

const loginpage = "https://accounts.google.com/o/oauth2/v2/auth"; //로그인 페이지
const redirect = "http://korseok.kro.kr/login/googlepage"; //리다이렉트 주소
const access_token_url = "https://oauth2.googleapis.com/token"; //access_token 얻는 주소

// access_token 타입
type access_token = {
    access_token: string;
    expires_in: number;
    id_token: string;
    scope: string;
    token_type: string;
}

google.get("/google", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?client_id=${privatekey.google_client_id}&redirect_uri=${redirect}&response_type=code&scope=email profile`;
    res.redirect(url);
});

google.get("/googlepage", (req, res) => {
    res.sendFile(__dirname + "\\page\\google.html");
});


// 계정 선택후 해당 url로 redirect (수정은 구글 클라우드에서)
google.post("/googlegettoken", async (req, res) => {

    //클라이언트에서 url 파라미터를 가져와서 URLSearchParams로 가져오기
    const resparams = req.body.url;
    const parmsMap = new URLSearchParams(resparams);

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("authuser", parmsMap.get("authuser") as string);
    data.append("code", parmsMap.get("code") as string);
    data.append("prompt", parmsMap.get("prompt") as string);
    data.append("scope", parmsMap.get("scope") as string);
    data.append("client_id", privatekey.google_client_id);
    data.append("client_secret", privatekey.google_client_secret);
    data.append("redirect_uri", redirect);
    data.append("grant_type", "authorization_code");

    // access_token url
    const access_token = await fetch(access_token_url, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: data,
    });

    const restoken: access_token = await access_token.json();
    console.log(restoken);
    
    res.json({
        type: "google",
        access_token: restoken.access_token,
    });
});

export default google;
