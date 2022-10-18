const MyError = require('../exception/MyError');

const messageValidate = {
    validateImageWithBase64(fileInfo) {
        const { fileName, fileExtension, fileBase64 } = fileInfo;

        if (!fileName || !fileExtension || !fileBase64) {
            throw new MyError('Info image with base64 invalid');
        }
        if (
            fileExtension !== '.png' &&
            fileExtension !== '.jpg' &&
            fileExtension !== '.jpeg' &&
            fileExtension !== '.gif'
        ) {
            throw new MyError('Image extension invalid');
        }
    },
};

module.exports = messageValidate;
