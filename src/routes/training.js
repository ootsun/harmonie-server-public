import { Router } from "express";
import {
  createTraining,
  getTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
} from "../controllers/training.controller.js";
import { checkAuthentication } from '../middlewares/check-authentication.js';

const router = Router();

router.post("/", checkAuthentication, createTraining);

router.get("/", checkAuthentication, getTrainings);

router.get("/:id", checkAuthentication, getTraining);

router.put("/:id", checkAuthentication, updateTraining);

router.delete("/:id", checkAuthentication, deleteTraining);

export default router;
