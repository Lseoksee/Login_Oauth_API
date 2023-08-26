import express = require("express");
import fs = require("fs");
import privatejson from "../PrivateKey.json";
import naver from "./NaverLogin";
import google from "./GoogleLogin";
import jwt from "./JWTLogin";
const server = express();

type privatejson = typeof privatejson;

server.get("/", (req, res) => {
    res.redirect("/login");
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
    const resdata = req.query;
    
    if (resdata.type == "google") {
        console.log(`${resdata.family_name}${resdata.given_name} 님 환영합니다`);   
    } else if (resdata.type == "naver") {
        console.log(`${resdata.name} 님 환영합니다`);  
    }

    res.send("ok");
});

server.get("/login", (req, res) => {
    res.sendFile(__dirname + "\\page\\login.html");
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});

export { privatekey };
