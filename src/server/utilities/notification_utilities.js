const nodemailer = require('nodemailer');

function sendEmailNotification(toEmailAddress, subject, body) {
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
      user: 'linkedspaces.seo@gmail.com',
      pass: '!taylormade0320'
    },
  });

  const mailOptions = {
    to: toEmailAddress,
    from: 'linkedspaces.seo@gmail.com',
    subject,
    text: body
  };

  smtpTransport.sendMail(mailOptions, (err) => {
    if (err) {
      console.warn(`sendMail error = ${err}`);
    } else {
      console.log(`mail sent to ${toEmailAddress}`);
    }
  });
}


module.exports = {
  sendEmailNotification
};
