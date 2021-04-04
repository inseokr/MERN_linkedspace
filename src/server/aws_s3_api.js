const AWS = require('aws-sdk');
const fs = require('fs');

const BUCKET_NAME = 'linkedspaces.fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});

const fileUpload2Cloud = (serverPath, fileName) => {
  if (process.env.NODE_ENV == 'development') return;

  const fileContent = fs.readFileSync(serverPath + fileName);

  const adjustedFileName = fileName.substring(1);

  const params = {
    Bucket: BUCKET_NAME,
    Key: adjustedFileName,
    Body: fileContent,
    ACL: 'public-read'
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.warn(`fileUpload2Cloud: error = ${err}`);
    }
    else {
      console.log(`AWS S3:File uploaded successfully. ${data.Location}`);
    }
  });
};

const fileDeleteFromCloud = (fileName) => {
  if (process.env.NODE_ENV == 'development') return;

  const adjustedFileName = fileName.substring(1);

  const params = {
    Bucket: BUCKET_NAME,
    Key: adjustedFileName
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.warn(`fileDeleteFromCloud: error = ${err}`);
    }
    else {
      console.log('AWS S3:File deleted successfully.');
    }
  });
};

module.exports = { fileUpload2Cloud, fileDeleteFromCloud };
