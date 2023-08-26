import express = require("express");
import jwttoken = require("jsonwebtoken");
import { privatekey } from "./Server";
const jwt = express.Router();

type body = {
    id: string;
    passwd: string;
};
jwt.post("/jwt", (req, res) => {
    const body: body = req.body;
    console.log(body);

    const key = privatekey.jwt_secret_key;

    const id = body.id;

    const token = jwttoken.sign(
        {
            id: id
        },
        key,
        {
            expiresIn: "1h",
            issuer: "server",
        }
    );

    res.json({
        type: "jwt",
        token: token,
    });
});

export default jwt;
