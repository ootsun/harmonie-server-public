import jwt from 'jsonwebtoken';
import log from "../logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function checkAuthentication(req, res, next) {
    try {
        if(!req.headers.authorization) {
            log.debug("Missing authorization header");
            const error = new Error("Missing authorization header");
            next(error);
        } else {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_SECRET);
            next();
        }
    } catch (err) {
        log.debug(err);
        const error = new Error(err);
        next(error);
    }
}