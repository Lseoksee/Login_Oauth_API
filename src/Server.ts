import express = require("express");
import fs = require("fs");
import privatejson from "../PrivateKey.json";
import naver from "./NaverLogin";
import google from "./GoogleLogin";
import jwt from "./JWTLogin";
const server = express();

type privatejson = typeof privatejson;

// 로컬스토리지 로그인 타입
export type login = {
    type: string;
    access_token: string;
    refresh_token: string | undefined; //jwt 로그인시
};

server.get("/", (req, res) => {
    res.redirect("/home");
});

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(__dirname + "\\page"));

server.use("/login", naver);
server.use("/login", google);
server.use("/login", jwt);

const privatekey: privatejson = JSON.parse(
    fs.readFileSync("PrivateKey.json", "utf-8")
);

server.get("/home", (req, res) => {
    res.sendFile(__dirname + "\\page\\index.html");
});

server.get("/login", (req, res) => {
    res.sendFile(__dirname + "\\page\\login.html");
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});

export { privatekey };
