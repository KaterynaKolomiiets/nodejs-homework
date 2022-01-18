const express = require("express");
const router = express.Router();

const {
  list,
  get,
  remove,
  add,
  update,
  updateFavorite,
} = require("../../controllers/contacts_controllers");

router.get("/", list);

router.get("/:contactId", get);

router.post("/", add);

router.delete("/:contactId", remove);

router.put("/:contactId", update);

router.patch("/:contactId/favorite", updateFavorite);

module.exports = router;
