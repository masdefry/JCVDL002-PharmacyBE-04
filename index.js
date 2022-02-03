const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const bearerToken = require('express-bearer-token');

const PORT = 2004;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('/Public'));
app.use('/Public', express.static('Public'));
// app.use(bearerToken);

app.get('/', (req, res) => {
    res.status(200).send('<h4>Integrated</h4>');
});

const UserRouter = require('./Routers/UserRouter');
const AdminRouter = require('./Routers/AdminRouter');
const ProductRouter = require("./Routers/ProductRouter");
const CartRouter = require('./Routers/CartRouter');

app.use('/user', UserRouter);
app.use('/admin', AdminRouter);
app.use("/products", ProductRouter);
app.use('/cart', CartRouter);

app.listen(PORT, () => console.log('Api Running:', PORT));