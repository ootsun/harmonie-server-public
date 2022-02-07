import pkg from "mongoose";
const { Types } = pkg;
import Training from "../models/training.model.js";
import log from "../logger.js";

export function createTraining(req, res, next) {
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }
  const training = new Training({
    _id: new Types.ObjectId(),
    title: req.body.title,
  });
  training
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Handling POST requests to /trainings",
        createdTraining: training,
      });
    })
    .catch((err) => {
      log.error(err);
      const error = new Error(err);
      next(error);
    });
}

export function getTrainings(req, res, next) {
  Training.find({archived: false})
    .exec()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      log.debug(err);
      const error = new Error(err);
      next(error);
    });
}

export function getTraining(req, res, next) {
  Training.findById(req.params.id)
    .exec()
    .then((doc) => {
      if (doc) {
        if(doc.archived) {
          res.status(404).message({message: "Training is archived"});
        } else {
          res.status(200).json(doc);
        }
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      log.debug(err);
      const error = new Error(err);
      next(error);
    });
}

export function updateTraining(req, res, next) {
  const id = req.params.id;
  Training.update({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
}

export function deleteTraining(req, res, next) {
  const id = req.params.id;
  req.body.archived = true;
  Training.update({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
}