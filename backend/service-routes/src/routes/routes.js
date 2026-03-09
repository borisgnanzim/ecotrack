const express = require("express");
const router = express.Router();
const controller = require("../controllers/routesController");

router.post("/routes", controller.createRoute);
router.get("/routes", controller.getRoutes);
router.get("/routes/:id", controller.getRoute);
router.put("/routes/:id", controller.updateRoute);
router.delete("/routes/:id", controller.deleteRoute);

router.put("/routes/:id/assign", controller.assignAgent);
router.get("/routes/agent/:agentId", controller.getAgentRoutes);

module.exports = router;