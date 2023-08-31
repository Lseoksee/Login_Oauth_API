/* 네이버 아이디 회원가입 구현 */
import express = require("express");
import { privatekey } from "./Server";
const naver = express.Router();

const loginpage = "https://nid.naver.com/oauth2.0/authorize"; //로그인 페이지
const get_token_url = "https://nid.naver.com/oauth2.0/token"; //access_token 발급 및 재발급 주소
const getuser_url = "https://openapi.naver.com/v1/nid/me"; //access_token 으로 정보 얻는 주소
const state = Math.random().toString(16).substring(2); //랜덤 문자열

// get_token 타입
type get_token = {
    access_token: string;
    expires_in: number; // 만료시간 (보통 1시간=3600)
    refresh_token: string;
    token_type: string;
};

// access_token 재발급 타입
type token_refresh = {
    access_token: string;
    token_type: number;
    expires_in: number; // 만료시간 (보통 1시간=3600)
};

// 네이버 응답 타입
type naveruser = {
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
    const url = `${loginpage}?response_type=code&client_id=${privatekey.naver_client_id}&redirect_uri=${privatekey.naver_redirect_url}&state=${state}`;

    res.redirect(url);
});

// 계정 선택후 임시 페이지로 redirect  (수정은 네이버 클라우드에서)
naver.get("/naverpage", (req, res) => {
    res.sendFile(__dirname + "\\page\\naver.html");
});

// access_token 발급
naver.post("/navergettoken", async (req, res) => {
    //클라이언트에서 url 파라미터를 가져와서 URLSearchParams로 가져오기
    const resparams = req.body.url;
    const parmsMap = new URLSearchParams(resparams);

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("response_type", "code");
    data.append("client_id", privatekey.naver_client_id);
    data.append("client_secret", privatekey.naver_client_secret);
    data.append("redirect_uri", privatekey.naver_redirect_url);
    data.append("code", parmsMap.get("code") as string);
    data.append("state", state);

    // token 얻는 요청
    const get_token = await fetch(get_token_url, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "X-Naver-Client-Id": privatekey.naver_client_id,
            "X-Naver-Client-Secret": privatekey.naver_client_secret,
        },
        body: data,
    });

    const restoken: get_token = await get_token.json();
    console.log(restoken);

    // 요청 애러 발생시
    if (!get_token.ok) {
        res.status(500).json(restoken);
        return;
    }

    // 유저 정보 가져오기
    const user = await fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${restoken.access_token}`,
        },
    });

    const userdata: naveruser = await user.json();
    console.log(userdata);

    // 요청 애러 발생시
    if (!user.ok) {
        res.status(500).json(restoken);
        return;
    }

    // 토큰이 만료되는 시간 구하기 (밀리초)
    const expires_in = Date.now() + restoken.expires_in * 1000;

    res.json({
        type: "naver",
        access_token: restoken.access_token,
        refresh_token: restoken.refresh_token,
        expires_in: expires_in,
        data: userdata.response,
    } as login);
});

// access_token 재발급
naver.post("/refreshnaver", async (req, res) => {
    const body: {
        access_token: string;
        refresh_token: string;
    } = req.body;
    console.log("갱신 전 토큰: " + body.access_token);

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("client_id", privatekey.naver_client_id);
    data.append("client_secret", privatekey.naver_client_secret);
    data.append("refresh_token", body.refresh_token);
    data.append("grant_type", "refresh_token"); // 재발급시 grant_type=refresh_token

    // token 얻는 요청
    const get_token = await fetch(get_token_url, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: data,
    });

    const restoken: token_refresh = await get_token.json();
    console.log("갱신 후 토큰: " + restoken.access_token);

    // 요청 애러 발생시
    if (!get_token.ok) {
        res.status(500).json(restoken);
        return;
    }

    // 유저 정보 가져오기
    const user = await fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${restoken.access_token}`,
        },
    });

    const userdata: naveruser = await user.json();
    console.log(userdata);

    // 요청 애러 발생시
    if (!user.ok) {
        res.status(500).json(userdata);
        return;
    }

    // 토큰이 만료되는 시간 구하기 (밀리초)
    const expires_in = Date.now() + restoken.expires_in * 1000;

    res.json({
        type: "naver",
        access_token: restoken.access_token,
        refresh_token: body.refresh_token,
        expires_in: expires_in,
        data: userdata.response,
    } as login);
});

// 유저 정보 가져오기를 통한 토큰 유효성 검사
naver.post("/naververify", async (req, res) => {
    // 네이버에 경우 프론트에서 요청하면 CORS 애러가 남으로 백엔드 서버에서 요청 해야함
    const access_token = req.body.access_token;

    const user = await fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const user_data: naveruser = await user.json();

    // 요청 에러 발생시
    if (!user.ok) {
        console.log(user_data);
        res.status(500).json(user_data);
        return;
    }

    res.json(user_data);
});

export default naver;
