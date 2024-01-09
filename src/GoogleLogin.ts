/* 구글 아이디 회원가입 구현 */
import express = require("express");
import { privatekey } from "./Server";
const google = express.Router();

const loginpage = "https://accounts.google.com/o/oauth2/v2/auth"; //로그인 페이지
const get_token_url = "https://oauth2.googleapis.com/token"; //access_token 발급 및 재발급 주소
const getuser_url = "https://www.googleapis.com/oauth2/v2/userinfo"; //access_token 으로 유저 정보 얻는 주소

// get_token 타입
type get_token = {
    access_token: string;
    expires_in: number; // 만료시간 (보통 1시간=3600)
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
};

// access_token 재발급 타입
type token_refresh = {
    access_token: string;
    expires_in: number; // 만료시간 (보통 1시간=3600)
    scope: string;
    token_type: string;
};

// 구글 유저정보 응답 타입
type googleuser = {
    email: string; //이메일
    family_name: string; //성
    given_name: string; //이름
    id: string;
    locale: string; //프사 경로
    name: string;
    picture: string;
};

google.get("/google", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?client_id=${privatekey.google_client_id}&redirect_uri=${privatekey.google_redirect_url}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    // refresh_token 얻으려면 access_type=offline&prompt=consent 이렇게 설정

    res.redirect(url);
});

// 계정 선택후 임시 페이지로 redirect (수정은 구글 클라우드로)
google.get("/googlepage", (req, res) => {
    res.sendFile(__dirname + "\\page\\google.html");
});

// access_token 발급
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
    data.append("redirect_uri", privatekey.google_redirect_url);
    data.append("grant_type", "authorization_code");

    // token 얻는 요청
    const get_token = await fetch(get_token_url, {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
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

    const userdata: googleuser = await user.json();
    console.log(userdata);

    // 요청 애러 발생시
    if (!user.ok) {
        res.status(500).json(restoken);
        return;
    }

    // 토큰이 만료되는 시간 구하기 (밀리초)
    const expires_in = Date.now() + restoken.expires_in * 1000;

    res.json({
        type: "google",
        access_token: restoken.access_token,
        refresh_token: restoken.refresh_token,
        expires_in: expires_in,
        data: userdata,
    } as login);
});

// access_token 재발급
google.post("/refreshgoogle", async (req, res) => {
    const body: {
        access_token: string;
        refresh_token: string;
    } = req.body;
    console.log("갱신 전 토큰: " + body.access_token);

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("client_id", privatekey.google_client_id);
    data.append("client_secret", privatekey.google_client_secret);
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
        /* getuser_url?Authorization=`Bearer ${restoken.access_token}`
        이렇게도 가능 */
        method: "get",
        headers: {
            Authorization: `Bearer ${restoken.access_token}`,
        },
    });

    const userdata: googleuser = await user.json();
    console.log(userdata);

    // 요청 애러 발생시
    if (!user.ok) {
        res.status(500).json(userdata);
        return;
    }

    // 토큰이 만료되는 시간 구하기 (밀리초)
    const expires_in = Date.now() + Math.floor(restoken.expires_in * 1000);

    res.json({
        type: "google",
        access_token: restoken.access_token,
        refresh_token: body.refresh_token,
        expires_in: expires_in,
        data: userdata,
    } as login);
});

export default google;
