const AWS = require('aws-sdk');
const fs = require('fs');

const BUCKET_NAME = 'linkedspaces.fs';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});

const fileUpload2Cloud = (serverPath, fileName) => {
  const fileContent = fs.readFileSync(serverPath + fileName);

  const adjustedFileName = fileName.substring(1);

  const params = {
    Bucket: BUCKET_NAME,
    Key: adjustedFileName,
    Body: fileContent
  };

  s3.upload(params, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  });
};

module.exports = { fileUpload2Cloud };
