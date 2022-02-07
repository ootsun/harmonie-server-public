import {Router} from "express";
import { checkAuthentication } from '../middlewares/check-authentication.js';
import {exportVat, getVats} from "../controllers/vat.controller.js";

const vatRoute = Router();

vatRoute.get("/", checkAuthentication, getVats);
vatRoute.post("/export", checkAuthentication, exportVat);

export default vatRoute;
