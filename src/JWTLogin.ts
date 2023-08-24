import express = require("express");
import jwt = require("jsonwebtoken");
import fs = require("fs");
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

const privatekey = JSON.parse(fs.readFileSync("PrivateKey.json", "utf-8"));

server.get("/login/jwt", (req, res) => {
    const key = privatekey.jwt_secret_key;

    const id = "seoksee";
    const passwd = "seoksee";

    const token = jwt.sign({
        id: id,
        passwd: passwd
    }, 
    key,
    {
        expiresIn: "1h",
        issuer: "server"
    });

    res.json(token);
});

server.listen(80, () => {
    console.log(`서버가 80 포트로 열림`);
});
