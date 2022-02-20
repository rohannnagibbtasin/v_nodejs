//external imports
const express = require("express");

//internal imports
const { getLogin } = require("../controller/loginController");
const decorateHtmlResponse = require("../midlewares/common/decorateHtmlResponse");

const router = express.Router();

//login page
router.get("/", decorateHtmlResponse("Login"), getLogin);

module.exports = router;
