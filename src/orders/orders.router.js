const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router
    .route("/:orderId")
    .get(controller.read)
    .put(controller.update)
    .delete(controller.destroy)
    .all(methodNotAllowed)

router
    .route("/")
    .get(controller.list)
    .post(controller.post)
    .all(methodNotAllowed)

module.exports = router;
