import { Router } from "express";
import {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
import { checkAuthentication } from '../middlewares/check-authentication.js';

const patientRoute = Router();

patientRoute.post("/", checkAuthentication, createPatient);

patientRoute.get("/", checkAuthentication, getPatients);

patientRoute.get("/:id", checkAuthentication, getPatient);

patientRoute.put("/:id", checkAuthentication, updatePatient);

patientRoute.delete("/:id", checkAuthentication, deletePatient);

export default patientRoute;
