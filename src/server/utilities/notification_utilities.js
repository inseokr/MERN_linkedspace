const nodemailer = require('nodemailer');

function sendEmailNotification(toEmailAddress, subject, body) {
  const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'linkedspaces.seo@gmail.com',
      pass: '!taylormade0320'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    to: toEmailAddress,
    from: 'linkedspaces.seo@gmail.com',
    subject,
    text: body
  };

  smtpTransport.sendMail(mailOptions, (err) => {
    console.log(`mail sent to ${toEmailAddress}`);
    req.flash('success', `An e-mail has been sent to ${toEmailAddress} with further instructions.`);
    done(err, 'done');
  });
}


module.exports = {
  sendEmailNotification
};
