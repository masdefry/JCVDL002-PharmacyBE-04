const util = require('util');
const { db } = require('../Database/Connection');
const query = util.promisify(db.query).bind(db);

module.exports = {
    
}