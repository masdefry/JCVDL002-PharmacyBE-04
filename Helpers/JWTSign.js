const jwt = require('jsonwebtoken');

require('dotenv').config();

const jwtSign = (data) => {
    return jwt.sign({ id: data.id, role: data.role }, process.env.JWT_SECRETKEY, { expiresIn: '30d' });
};

module.exports = jwtSign;