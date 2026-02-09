import express from "express";
import multer from "multer";
import path from "path";
import { getStats } from "../controllers/container.controller.js";

// ...



import {
  createContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
  deleteContainer,
  getNearbyContainers,
  uploadPhoto,
  addFillHistory,
  getFillHistory,
} from "../controllers/container.controller.js";

const router = express.Router();

// Multer
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, `conteneur-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// CRUD
router.post("/", createContainer);
router.get("/", getAllContainers);
router.get("/nearby", getNearbyContainers);
router.get("/stats", getStats);
router.get("/:id", getContainerById);
router.put("/:id", updateContainer);
router.delete("/:id", deleteContainer);
router.post('/:id/fill-history', addFillHistory);
router.get('/:id/fill-history', getFillHistory);




// Photo
router.post("/:id/photo", upload.single("photo"), uploadPhoto);

export default router;
