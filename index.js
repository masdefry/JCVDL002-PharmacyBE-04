const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const PORT = 2004;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('<h4>Integrated</h4>');
});

const { UserRouter } = require('./Routers/UserRouter');

app.use('/user', UserRouter);

app.listen(PORT, () => console.log('Api Running:', PORT));