import {Router} from "express";
import {login, refreshToken} from "../controllers/user.controller.js";
import { checkAuthentication } from '../middlewares/check-authentication.js';

const userRoute = Router();

userRoute.post("/login", login);
userRoute.get("/refresh-token", checkAuthentication, refreshToken);

export default userRoute;