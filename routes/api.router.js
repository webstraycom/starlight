const express = require("express");
const apiController = require("../controllers/api.controller.js");
const { renderImage } = require("../middleware/renderer.middleware.js");
const apiRouter = express.Router();
 
apiRouter.get('/starlight/user/:owner/repository/:repository', renderImage, apiController.sendImage);

module.exports = apiRouter;