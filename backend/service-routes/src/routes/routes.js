const express = require("express");
const router = express.Router();
const controller = require("../controllers/routesController");

router.post("/", controller.createRoute);
router.get("/", controller.getRoutes);
router.get("/:id", controller.getRoute);
router.put("/:id", controller.updateRoute);
router.delete("/:id", controller.deleteRoute);
router.post("/:id/optimize", controller.optimizeRoute);

router.put("/:id/assign", controller.assignAgent);
router.get("/agent/:agentId", controller.getAgentRoutes);

module.exports = router;