const path = require('path');
const multer = require('multer');
const fs = require('fs');

const randomName = (fileName) => {
    let result = '';
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charLength = char.length;
    for (let i = 0; i < 10; i++) {
        result += char.charAt(Math.floor(Math.random() * charLength));
    }
    result += (Date.now() + path.extname(fileName));
    return result;
};

let finalDestination = 'Public/ProfileImages';

module.exports = {
    singleUpload: multer({
        storage: multer.diskStorage({
            destination: finalDestination,
            filename: (req, file, cb) => {
                console.log(req.body);
                const fileName = randomName(file.originalname);
                const filePath = `/${fileName}`;

                req.body.storePicture = finalDestination + filePath;
                if (fs.existsSync(finalDestination)) {
                    return cb(null, filePath);
                }
                fs.mkdirSync(finalDestination);
                return cb(null, filePath);
            }
        })
    })
};