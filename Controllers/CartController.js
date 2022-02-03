const { db } = require("../Database/Connection");
const { API_URL } = require("../Supports/Constants/Constants");
const util = require("util");
let query = util.promisify(db.query).bind(db);

const GetCart = (req, res) => {
  let scriptQuery =
    "SELECT c.CART_ID, c.fk_Products_SKU, c.fk_cart_User_ID, c.Product_Qty, p.Name, p.Price, p.Image FROM cart c LEFT JOIN products p on c.fk_Products_SKU = p.SKU LEFT JOIN user u on c.fk_Cart_USER_ID = u.ID;";

  db.query(scriptQuery, (err, result) => {
    let cartData = result.map((val) => ({
      Cart_Id: val.CART_ID,
      SKU: val.fk_Products_SKU,
      User_Id: val.fk_cart_User_ID,
      Name: val.Name,
      Price: val.Price,
      Qty: val.Product_Qty,
      Image: `${API_URL}/${val.Image}`,
    }));
    res.status(200).send(cartData);
  });
};

const AddToCart = async (req, res) => {
  let { SKU, User_Id, Qty } = req.body;

  let scriptCheck = `SELECT CART_ID, Product_Qty FROM cart WHERE fk_Products_SKU = ${db.escape(
    SKU
  )} AND fk_cart_User_ID = ${db.escape(User_Id)}`;

  let insertQuery = `INSERT INTO cart values (null,${db.escape(
    SKU
  )}, ${db.escape(User_Id)}, ${db.escape(Qty)}, CURRENT_TIMESTAMP  )`;

  let updateQuery = `UPDATE cart set Product_Qty = ${db.escape(
    Qty
  )} where fk_cart_User_ID = ${db.escape(
    User_Id
  )} AND fk_Products_SKU = ${db.escape(SKU)}  `;

  db.query(scriptCheck, (err, results) => {
    if (results.length) {
      db.query(updateQuery, (err, res1) => {
        res.status(200).send(res1);
      });
    } else {
      db.query(insertQuery, (err, res2) => {
        res.status(200).send(res2);
      });
    }
  });
};

const DeleteCart = async (req, res) => {
  let deleteQuery = `DELETE FROM cart WHERE CART_ID = ${db.escape(
    req.params.Cart_Id
  )}`;

  db.query(deleteQuery, (err, results) => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).send(results);
  });
};

const getTransaction = async (req, res) => {
  let getQuery = "SELECT *  FROM transaction";

  db.query(getQuery, (err, results) => {
    let transactionData = results.map((val) => ({
      User_Id: val.User_Id,
      address: val.address,
      recipientName: val.recipientName,
      totalPrice: val.totalPrice,
      transactionItems: val.transactionItems,
    }));
    res.status(200).send(transactionData);
  });
};

const postTransaction = async (req, res) => {
  const { User_Id, address, recipientName, totalPrice, transactionItems } =
    req.body;

  let insertQuery = `INSERT INTO transaction values (null,${db.escape(
    User_Id
  )}, ${db.escape(address)}, ${db.escape(recipientName)}, ${db.escape(
    totalPrice
  )}, ${db.escape(transactionItems)} )`;

  db.query(insertQuery, (err, results) => {
    res.status(200).send(results);
  });
};

const afterTransaction = async (req, res) => {
  const { Qty, SKU } = req.body;
  let updateQuery = `UPDATE products set Qty = ${db.escape(
    Qty
  )} where SKU = ${db.escape(SKU)}`;

  db.query(updateQuery, (err, results) => {
    res.status(200).send(results);
  });
};

module.exports = {
  GetCart,
  AddToCart,
  DeleteCart,
  getTransaction,
  postTransaction,
  afterTransaction,
  // GetCart,
};
