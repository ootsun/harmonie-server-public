import bcrypt from 'bcrypt';

import User from "../models/user.model.js";
import log from "../logger.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_VALIDITY_DURATION = process.env.JWT_VALIDITY_DURATION;
const FAILED_LOGIN_MAX_ATTEMPTS = process.env.FAILED_LOGIN_MAX_ATTEMPTS;

export async function login(req, res, next) {
    try {
        if (!req.body) {
            return res.status(400).send("Request body is missing");
        }
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            return res
                .status(404)
                .json({message: "No valid entry found for provided email"});
        }
        if (user.failedLoginAttempts >= FAILED_LOGIN_MAX_ATTEMPTS) {
            return res
                .status(403)
                .json({message: "Failed login maximum number of attempts reached"});
        }
        if (!await bcrypt.compare(req.body.password, user.password)) {
            user.failedLoginAttempts++;
            await user.save();
            return res
                .status(404)
                .json({message: "Provided email and password do not match"});
        }
        if (user.failedLoginAttempts !== 0) {
            user.failedLoginAttempts = 0;
            await user.save();
        }
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: JWT_VALIDITY_DURATION});
        res
            .status(200)
            .json({token: token});
    } catch (err) {
        log.debug(err);
        const error = new Error(err);
        next(error);
    }
}

export function refreshToken(req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.decode(token);
        const newToken = jwt.sign({userId: decodedToken.userId}, JWT_SECRET, {expiresIn: JWT_VALIDITY_DURATION});
        res
            .status(200)
            .json({token: newToken});
    } catch (err) {
        log.debug(err);
        const error = new Error(err);
        next(error);
    }
}
