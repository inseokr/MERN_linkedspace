/* eslint-disable */
import emailjs from "emailjs-com";

async function sendEmailNotification(toUserName, toEmail, _message)
{
	return new Promise (async (resolve) => {
		// send test email from ReactJs
		var templateParams = {
		  to_email: toEmail,
		  to_name: toUserName,
		  message: _message
		};

		emailjs.send('service_0ie0oe5', 'template_faod4g8', templateParams, 'user_dvV4OqqT5zASBx61ZIPdf')
		.then(function(response) {
		   console.log('SUCCESS!', response.status, response.text);
		   resolve('success');
		}, function(error) {
		   console.log('FAILED...', error);
   		   resolve('failed');
		});

	});
/*
	// send test email from ReactJs
	var templateParams = {
	  to_email: toEmail,
	  to_name: toUserName,
	  message: _message
	};

	emailjs.send('service_0ie0oe5', 'template_faod4g8', templateParams, 'user_dvV4OqqT5zASBx61ZIPdf')
	.then(function(response) {
	   console.log('SUCCESS!', response.status, response.text);
	}, function(error) {
	   console.log('FAILED...', error);
	});*/

/*
   var templateParams = {
      to_email: 'inseo.kr@gmail.com',
      from_name: 'In Seo',
      to_name: 'In Seo',
      message: 'Invitation to a dashboard'
    };

    emailjs.send('service_0ie0oe5', 'template_r2bn5e6', templateParams, 'user_dvV4OqqT5zASBx61ZIPdf')
    .then(function(response) {
       console.log('SUCCESS!', response.status, response.text);
    }, function(error) {
       console.log('FAILED...', error);
    });*/

}
export {
  sendEmailNotification
};

