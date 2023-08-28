/* 네이버 아이디 회원가입 구현 */
import express = require("express");
import url = require("url");
import { privatekey } from "./Server";
const naver = express.Router();

const loginpage = "https://nid.naver.com/oauth2.0/authorize"; //로그인 페이지
const redirect = "http://korseok.kro.kr/login/resnaver"; //리다이렉트 주소
const access_token_url = "https://nid.naver.com/oauth2.0/token"; //access_token 얻는 주소
const getuser_url = "https://openapi.naver.com/v1/nid/me"; //access_token 으로 정보 얻는 주소

const state = Math.random().toString(16).substring(2); //랜덤 문자열

naver.get("/naver", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?response_type=code&client_id=${privatekey.naver_client_id}&redirect_uri=${redirect}&state=${state}`;

    res.redirect(url);
});

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
// 계정 선택후 해당 url로 redirect (수정은 네이버 클라우드에서)
naver.get("/resnaver", async (req, res) => {
    const access_url = `${access_token_url}?grant_type=authorization_code&response_type=code&client_id=${privatekey.naver_client_id}&client_secret=${privatekey.naver_client_secret}&redirect_uri=${redirect}&code=${req.query.code}&state=${state}`;

    // access_token url
    const access_token = await fetch(access_url, {
        method: "post",
        headers: {
            "X-Naver-Client-Id": privatekey.naver_client_id,
            "X-Naver-Client-Secret": privatekey.naver_client_secret,
        },
    });

    const restoken = await access_token.json();

    // access_token 으로 유저 정보 가져오기
    const getid = await fetch(getuser_url, {
        method: "get",
        headers: {
            Authorization: `Bearer ${restoken.access_token}`,
        },
    });

    const resid: resnaver = await getid.json();

    console.log(resid);

    res.redirect(
        url.format({
            pathname: "/home",
            query: { type: "naver", ...resid.response },
        })
    );
});

export default naver;
