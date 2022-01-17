const { db } = require("../Database/Connection");
const { API_URL } = require("../Supports/Constants/Constants");

const GetProduct = (req, res) => {
  let scriptQuery =
    "SELECT products.SKU, products.Category_ID, products.Name, products.Qty, products.Price, products.Image, products.Description, product_category.Name AS Category_Name FROM products INNER JOIN product_category ON products.Category_ID = product_category.ID";
  // "SELECT products.Category_ID, products.SKU, products.Name, products.Qty, products.Price, products.Image, products.Description, product_category.Name as Category from dbdesign.products JOIN dbdesign.product_category on  products.Category_ID = product_category.ID";

  db.query(scriptQuery, (err, result) => {
    let productData = result.map((val) => ({
      SKU: val.SKU,
      Category_ID: val.Category_Name,
      Name: val.Name,
      Price: val.Price,
      Qty: val.Qty,
      Image: `${API_URL}/${val.Image}`,
      Description: val.Description,
    }));
    res.status(200).send(productData);
  });
};

// const GetCart = (req, res) => {
//   let scriptQuery =
//     "SELECT user.ID, user.Name,  cart.Product_QTY FROM user INNER JOIN cart ON user.ID = cart.fk_cart_User_ID";
//   // "SELECT products.Category_ID, products.SKU, products.Name, products.Qty, products.Price, products.Image, products.Description, product_category.Name as Category from dbdesign.products JOIN dbdesign.product_category on  products.Category_ID = product_category.ID";

//   db.query(scriptQuery, (err, result) => {
//     let cartData = result.map((val) => ({
//       SKU: val.fk_product_SKU,
//       Id: val.fk_cart_User_ID,
//       Qty: val.Product_QTY,
//       Time: val.Created_At,
//     }));
//     res.status(200).send(cartData);
//   });
// };

module.exports = {
  GetProduct,
  // GetCart,
};
