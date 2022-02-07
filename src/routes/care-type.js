import { Router } from "express";
import {
  createCareType,
  getCareTypes,
  getCareType,
  updateCareType,
  deleteCareType,
} from "../controllers/care-type.controller.js";
import { checkAuthentication } from '../middlewares/check-authentication.js';

const router = Router();

router.post("/", checkAuthentication, createCareType);

router.get("/", checkAuthentication, getCareTypes);

router.get("/:id", checkAuthentication, getCareType);

router.put("/:id", checkAuthentication, updateCareType);

router.delete("/:id", checkAuthentication, deleteCareType);

export default router;
