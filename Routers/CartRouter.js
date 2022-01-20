const express = require("express");
const CartController = require("../Controllers/cartController");
const routers = express.Router();

//////////
routers.get("/", CartController.GetCart);
routers.get("/transaction", CartController.getTransaction);
routers.post("/", CartController.AddToCart);
routers.post("/transaction", CartController.postTransaction);
routers.post("/aftertransaction", CartController.afterTransaction);
routers.delete("/:Cart_Id", CartController.DeleteCart);
// routers.get("/cart", ProductController.GetCart);

module.exports = routers;
