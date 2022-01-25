"use strict";

var express = require("express");

var router = express.Router();

var passport = require("passport");

require("dotenv").config();

require("../../config/config-passport");

var multer = require("../../multer");

var _require = require("../../controllers/user_controllers"),
    signUp = _require.signUp,
    logIn = _require.logIn,
    logOut = _require.logOut,
    getCurrent = _require.getCurrent,
    changeSubscription = _require.changeSubscription,
    updateAvatar = _require.updateAvatar;

var auth = function auth(req, res, next) {
  passport.authenticate("jwt", {
    session: false
  }, function (err, user) {
    if (!user || err || req.headers.authorization !== "Bearer ".concat(user.token)) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", auth, logOut);
router.get("/current", auth, getCurrent);
router.patch("/", auth, changeSubscription);
router.patch("/avatars", auth, multer.single("picture"), updateAvatar);
module.exports = router;