const { db } = require('../Database/Connection');

module.exports = {
    get: (req, res) => {
        let scriptQuery = 'Select * FROM user';
        db.query(scriptQuery, (err, result) => {
            if (err) res.status(500).send(err);
            res.status(200).send(result);
        });
    }
};