import express = require("express");
import fs = require("fs");
import privatejson from "../PrivateKey.json";

const server = express();
type privatejson = typeof privatejson;

const loginpage = "https://accounts.google.com/o/oauth2/v2/auth"; //로그인 페이지
const get_token_url = "https://oauth2.googleapis.com/token"; //access_token 발급 및 재발급 주소
const getuser_url = "https://www.googleapis.com/oauth2/v2/userinfo"; //access_token 으로 유저 정보 얻는 주소

const privatekey: privatejson = JSON.parse(
    fs.readFileSync("PrivateKey.json", "utf-8")
);

server.use(express.static(__dirname + "\\index.html"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/login/google", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?client_id=${privatekey.google_client_id}&redirect_uri=${privatekey.google_redirect_url}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    // refresh_token 얻으려면 access_type=offline&prompt=consent 이렇게 설정

    res.redirect(url);
});

// 계정 선택후 임시 페이지로 redirect (수정은 구글 클라우드로)
server.get("/login/googlepage", (req, res) => {
    res.sendFile(__dirname+"\\index.html");
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});
