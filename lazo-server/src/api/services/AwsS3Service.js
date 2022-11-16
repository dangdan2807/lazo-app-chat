const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const MyError = require('../exception/MyError');
const BucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});

const FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);

class AwsS3Service {
    uploadFile = async (file, bucketName = BucketName) => {
        const fileStream = fs.readFileSync(file.path);

        const uploadParams = {
            Bucket: bucketName,
            Body: fileStream,
            Key: `lazo-${Date.now()}-${file.originalname}`,
        };

        const { mimetype } = file;
        if (
            mimetype === 'image/jpeg' ||
            mimetype === 'image/png' ||
            mimetype === 'image/gif' ||
            mimetype === 'video/mp3' ||
            mimetype === 'video/mp4'
        ) {
            uploadParams.ContentType = mimetype;
        }

        try {
            const { Location } = await s3.upload(uploadParams).promise();

            return Location;
        } catch (err) {
            console.log('err: ', err);
            throw new MyError('Upload file Aws S3 failed');
        }
    };

    uploadWithBase64 = async (fileBase64, fileName, fileExtension) => {
        const fileBuffer = Buffer.from(fileBase64, 'base64');

        if (fileBuffer.length > FILE_SIZE) {
            throw new MyError('Size file < 20 MB');
        }

        const uploadParams = {
            Bucket: BucketName,
            Body: fileBuffer,
            Key: `lazo-${Date.now()}-${fileName}${fileExtension}`,
        };

        if (fileExtension === '.png') {
            uploadParams.ContentType = 'image/png';
        }
        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            uploadParams.ContentType = 'image/jpeg';
        }
        if (fileExtension === '.mp3') {
            uploadParams.ContentType = 'video/mp3';
        }
        if (fileExtension === '.mp4') {
            uploadParams.ContentType = 'video/mp4';
        }

        try {
            const { Location } = await s3.upload(uploadParams).promise();

            return Location;
        } catch {
            throw new MyError('Upload file Aws S3 failed');
        }
    };

    deleteFile = async (url, bucketName = BucketName) => {
        const urlSplit = url.split('/');
        const key = urlSplit[urlSplit.length - 1];

        const params = {
            Bucket: bucketName,
            Key: key,
        };
        try {
            await s3.deleteObject(params).promise();
            // s3.deleteObject(params, function (err, data) {
            //     if (err) {
            //         console.log(err, err.stack); // error
            //     } else {
            //         console.log(); // deleted
            //     }
            // });
        } catch (err) {
            throw new MyError('Delete file Aws S3 failed');
        }
    };
}

module.exports = new AwsS3Service();
