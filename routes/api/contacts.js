const express = require("express");
const router = express.Router();

const index = require("../../model/index");
const { json } = require("express/lib/response");

const {
  list,
  get,
  remove,
  add,
  update,
  updateFavorite,
} = require("../../controllers/controllers");

router.get("/", list);

router.get("/:contactId", get);

router.post("/", add);

router.delete("/:contactId", remove);

router.put("/:contactId", update);

router.patch("/:contactId/favorite", updateFavorite);

module.exports = router;
