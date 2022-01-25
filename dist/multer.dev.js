"use strict";

var multer = require("multer");

var path = require("path");

var uploadDir = path.join(process.cwd(), "tmp");

var Jimp = require("jimp");

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function filename(req, file, cb) {
    cb(null, file.originalname);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
var upload = multer({
  storage: storage
});
module.exports = upload;