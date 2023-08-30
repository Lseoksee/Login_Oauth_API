import express = require("express");
import jwttoken = require("jsonwebtoken");
import { privatekey } from "./Server";
const jwt = express.Router();

// 로그인 토큰 발급 타입
type loginbody = {
    id: string;
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

// jwt 최초 로그인
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

    const data = jwttoken.decode(access_token) as resjwt;

    res.json({
        type: "jwt",
        access_token: access_token,
        refresh_token: refresh_token,
        expires_in: data.exp * 1000, // 토큰이 만료 되는 시간 (밀리초)
        data: data,
    } as login);
});

//토큰 검증
jwt.post("/verifyjwt", (req, res) => {
    const access_token: string = req.body.access_token;

    try {
        const userdata = jwttoken.verify(
            access_token,
            privatekey.jwt_secret_key
        );
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
    console.log("갱신 전 토큰: " + body.access_token);

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
        console.log("갱신 후 토큰: " + access_token);

        const data = jwttoken.decode(access_token) as resjwt;

        res.json({
            type: "jwt",
            access_token: access_token,
            refresh_token: body.refresh_token,
            expires_in: data.exp * 1000, // 토큰이 만료 되는 시간 (밀리초)
            data: data,
        } as login);
    } catch (err: any) {
        // refresh 토큰 만료시
        res.status(500).json({
            err: "refresh_fail",
        });
    }
});

export default jwt;
