const bcrypt = require('bcrypt');

const hashBcrypt = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
};

module.exports = hashBcrypt;