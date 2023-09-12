import express = require("express");
import fs = require("fs");
import net = require("net");
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

// 앱 쪽 소켓 통신을 위한 함수
function connectSocket(data: string): void {
    const socket = new net.Socket();

    // 소켓 연결 후 데이터 보내기
    socket.connect(25565, "localhost", () => {
        console.log("연결됨");

        socket.write(data, (err: Error | undefined) => {
            if (err) {
                console.log(err.message);
            }
            socket.end();
        });
    });

    // 서버측 데이터 읽기
    socket.on("data", (data) => {
        console.log(data.toString());
        socket.end();
    });

    // 연결 종료
    socket.on("close", () => {
        console.log("연결종료");
    });

    // 애러 발생시
    socket.on("error", (err) => {
        console.log("애러발생: " + err.message);
    });
}

server.get("/login/google", (req, res) => {
    // 로그인 페이지 url
    const url = `${loginpage}?client_id=${privatekey.google_client_id}&redirect_uri=${privatekey.google_redirect_url}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    // refresh_token 얻으려면 access_type=offline&prompt=consent 이렇게 설정

    res.redirect(url);
});

// 계정 선택후 임시 페이지로 redirect (수정은 구글 클라우드로)
server.get("/login/googlepage", async (req, res) => {
    const urlparms = req.query as queryparms;

    // x-www-form-urlencoded 데이터 만들기
    const data = new URLSearchParams();
    data.append("authuser", urlparms.authuser);
    data.append("code", urlparms.code);
    data.append("prompt", urlparms.prompt);
    data.append("scope", urlparms.scope);
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

    // 요청 애러 발생시
    if (!get_token.ok) {
        console.log(restoken);
        res.status(500).send("구글 토큰 서버에서 오류가남");
        connectSocket(JSON.stringify({ err: "google_token_err" }));
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
        res.status(500).send("구글에서 유저 정보를 가져오지 못함");
        connectSocket(JSON.stringify({ err: "google_user_err" }));
        return;
    }

    connectSocket(JSON.stringify(userdata));
    res.sendFile(__dirname + "\\index.html");
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});

// get_token 타입
type get_token = {
    access_token: string;
    expires_in: number; // 만료시간 (보통 1시간=3600)
    id_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
};
// 쿼리 파라미터 타입
type queryparms = {
    code: string;
    scope: string;
    authuser: string;
    prompt: string;
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
