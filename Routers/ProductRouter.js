const express = require("express");
const ProductController = require("../Controllers/ProductController");
const routers = express.Router();

//////////
routers.get("/", ProductController.GetProduct);
// routers.get("/cart", ProductController.GetCart);

module.exports = routers;
