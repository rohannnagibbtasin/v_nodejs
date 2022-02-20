// external imports
const express = require("express");
const { check } = require("express-validator");

// internal imports
const { getUsers, addUser } = require("../controller/usersController");
const decorateHtmlResponse = require("../midlewares/common/decorateHtmlResponse");
const avatarUpload = require("../midlewares/Users/avatarUpload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../midlewares/Users/userValidator");

const router = express.Router();

// users page
router.get("/", decorateHtmlResponse("Users"), getUsers);

// add user
router.post(
  "/",
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);

module.exports = router;
