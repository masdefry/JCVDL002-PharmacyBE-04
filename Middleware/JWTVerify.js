const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
    console.log('masuk jwtVerify');
    const token = req.headers.token;

    if (!token) return res.status(406).send({ error: true, message: 'Error Token', detail: `Can't find token!` });

    jwt.verify(token, process.env.JWT_SECRETKEY, (err, decode) => {
        try {
            if (err) throw err;
            req.dataToken = decode;
            next();
        } catch (error) {
            res.status(500).send({
                error: true,
                message: 'Error Token',
                detail: error.message
            });
        }
    });
};

module.exports = jwtVerify;