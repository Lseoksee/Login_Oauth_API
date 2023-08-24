import express = require("express");
import jwttoken = require("jsonwebtoken");
import { privatekey } from "./Server";
const jwt = express.Router();

jwt.get("/jwt", (req, res) => {
    const key = privatekey.jwt_secret_key;

    const id = "seoksee";
    const passwd = "seoksee";

    const token = jwttoken.sign({
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

export default jwt