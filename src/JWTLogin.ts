import express = require("express");
import jwttoken = require("jsonwebtoken");
import { login, privatekey } from "./Server";
const jwt = express.Router();

// 로그인시 토큰 발급 타입
type loginbody = {
    id: string;
    passwd: string;
};

// jwt 디코딩 타입
type resjwt = {
    exp: number;
    iat: number;
    id: string;
    iss: string;
};

//리프레쉬 토큰 body 타입
type refreshbody = {
    access_token: string;
    refresh_token: string;
};

//리프레쉬 토큰 응답
type resrefresh = {
    login: login;
    userdata: resjwt;
} & {
    err: "refresh_fail";
};

jwt.post("/loginjwt", (req, res) => {
    const body: loginbody = req.body;
    console.log(body);

    const id = body.id;
    const key = privatekey.jwt_secret_key;

    const access_token = jwttoken.sign(
        {
            id: id,
        },
        key,
        {
            expiresIn: "10s",
            issuer: "server",
        }
    );

    const refresh_token = jwttoken.sign({}, key, {
        expiresIn: "30d",
        issuer: "server",
    });

    res.json({
        type: "jwt",
        access_token: access_token,
        refresh_token: refresh_token,
    } as login);
});

//토큰 검증
jwt.post("/verifyjwt", (req, res) => {
    const token: string = req.body.token;

    try {
        const userdata = jwttoken.verify(token, privatekey.jwt_secret_key);
        console.log(userdata);
        res.send(userdata);
    } catch (err: any) {
        res.status(500).json({
            err: err.message,
        });
    }
});

// 토큰 재발급
jwt.post("/refreshjwt", (req, res) => {
    const body: refreshbody = req.body;
    console.log("갱신 전 토큰: "+ body.access_token);
    
    //access_token 디코딩
    const userdata = jwttoken.decode(body.access_token) as resjwt;
    
    //access_token 토큰이 맞는토큰인지 확인
    if (!userdata) {
        res.status(500).json({
            err: "refresh_fail",
        });
    }
    try {
        // refresh_token 유효성 확인
        jwttoken.verify(body.refresh_token, privatekey.jwt_secret_key);

        const id = userdata.id;
        const key = privatekey.jwt_secret_key;

        // access_token 재발급
        const access_token = jwttoken.sign(
            {
                id: id,
            },
            key,
            {
                expiresIn: "10s",
                issuer: "server",
            }
        );
        console.log("갱신 후 토큰: "+ access_token);

        res.json({
            login: {
                type: "jwt",
                access_token: access_token,
                refresh_token: body.refresh_token,
            },
            userdata: jwttoken.decode(access_token),
        } as resrefresh);
    } catch (err: any) {
        // refresh 토큰 만료시
        res.status(500).json({
            err: "refresh_fail",
        });
    }
});

export default jwt;
