/* 네이버 아이디 회원가입 구현 */
import express = require("express");
import { privatekey } from "./Server";
const naver = express.Router();

const loginpage = "https://nid.naver.com/oauth2.0/authorize"; //로그인 페이지
const redirect = "http://korseok.kro.kr/login/naverpage"; //리다이렉트 주소
const access_token_url = "https://nid.naver.com/oauth2.0/token"; //access_token 얻는 주소
const getuser_url = "https://openapi.naver.com/v1/nid/me"; //access_token 으로 정보 얻는 주소
const state = Math.random().toString(16).substring(2); //랜덤 문자열

// access_token 타입
type access_token = {
    access_token: string;
    expires_in: string;
    refresh_token: string;
    token_type: string;
};

// 네이버 응답 타입
type resnaver = {
    message: string; // success
    response: {
        birthyear: string;
        email: string;
        gender: string; // M, G
        id: string;
        mobile: string;
        mobile_e164: string;
        name: string;
    };
    resultcode: string;
};

naver.get("/naver", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?response_type=code&client_id=${privatekey.naver_client_id}&redirect_uri=${redirect}&state=${state}`;

    res.redirect(url);
});

// 계정 선택후 해당 url로 redirect (수정은 네이버 클라우드에서)
naver.get("/naverpage", (req, res) => {
    res.sendFile(__dirname + "\\page\\naver.html");
});

naver.post("/navergettoken", async (req, res) => {
    //클라이언트에서 url 파라미터를 가져와서 URLSearchParams로 가져오기
    const resparams = req.body.url;
    const parmsMap = new URLSearchParams(resparams);

    const access_url = `${access_token_url}?grant_type=authorization_code&response_type=code&client_id=${
        privatekey.naver_client_id
    }&client_secret=${
        privatekey.naver_client_secret
    }&redirect_uri=${redirect}&code=${parmsMap.get("code")}&state=${state}`;

    // access_token url
    const access_token = await fetch(access_url, {
        method: "post",
        headers: {
            "X-Naver-Client-Id": privatekey.naver_client_id,
            "X-Naver-Client-Secret": privatekey.naver_client_secret,
        },
    });

    const restoken: access_token = await access_token.json();
    console.log(restoken);

    res.json({
        type: "naver",
        access_token: restoken.access_token,
    });
});

// 토큰 유효성 검사 & 유저 정보 가져오기
naver.post("/naververify", async (req, res) => {
    // 네이버에 경우 프론트에서 요청하면 CORS 애러가 남으로 백엔드 서버에서 요청 해야함
    const access_token = req.body.access_token;

    const getid = await fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const resid: resnaver = await getid.json();
    console.log(resid);

    // response 정보만 보냄
    res.json(resid.response);
});

export default naver;
