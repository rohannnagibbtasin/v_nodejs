//external imports
const express = require("express");

//internal imports
const { getInbox } = require("../controller/inboxController");
const decorateHtmlResponse = require("../midlewares/common/decorateHtmlResponse");

const router = express.Router();

//Inbox page
router.get("/", decorateHtmlResponse("Inbox"), getInbox);

module.exports = router;
