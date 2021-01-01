
import React, { useState } from 'react';
import axios from 'axios';
import '../../app.css';
import { sendEmailNotification } from '../../utils/notification_utilities';

const modalContentStyle = {
  marginTop: '70px',
  width: '300px'
};

const modalTitleStyle = {
  color: 'black'
};

const mdFormBottom = {
  marginBottom: '10px',
  marginLeft: '14px'
};

export default function ModalForgotPasswordForm(props) {
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const { display, clickHandler } = props;

  function handleEmailNameChange(event) {
    setRecoveryEmail(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const data = {
      email: recoveryEmail
    };

    await axios.post('/LS_API/forgot', data)
      .then(async (result) => {
        console.log(`res = ${JSON.stringify(result)}`);

        const messageBody = `${'You are receiving this because you have requested the reset of the password for your account.\n\n'
            + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
            + 'https://'}linkedspaces.herokuapp.com/LS_API/reset/${result.data.token}\n\n`
            + 'If you did not request this, please ignore this email and your password will remain unchanged.\n';

        const res = await sendEmailNotification(result.data.username, recoveryEmail, messageBody);
        if (res === 'success') {
          alert('Please check your email for the password reset process');
        } else {
          alert('Password Reset Failed');
        }

        clickHandler();
        // window.location = '/';
      })
      .catch(err => console.warn(err));
  }


  // console.log("rendering ModalLoginForm. display = " + this.props.display);
  const displayStyle = (display === true) ? { display: 'block', opacity: '1' } : { display: 'none' };

  // ISEO-TBD: This will re-direct the page to root always when URL is specificied explicitly in the browser like http://10.0.0.10/ActiveListing
  // Let's redirect it only if it's the first login....
  if (display === false) {
    return (
      <div />
    );
  }

  return (
    <div className="modal fade" style={displayStyle} id="modalLoginForm" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">

      <div className="modal-dialog" role="document">

        <div className="modal-content" style={modalContentStyle}>

          <div className="modal-header text-center">
            <h4 className="modal-title w-100 ariweight-bold" font-ss="close" data-dismiss="modal" style={modalTitleStyle}>Forgot Password</h4>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="modal-body form-group">

              <div className="md-form form-group" style={mdFormBottom}>
                <label data-error="wrong" data-success="right" htmlFor="defaultForm-email" style={modalTitleStyle}>
                  <div className="input-group">
                    <input type="text" className="form-control validate" name="email" onChange={handleEmailNameChange} />
                    <div className="input-group-append">
                      <span className="input-group-text" style={{ backgroundColor: '#FFFFFF' }}><i className="fas fa-envelope" /></span>
                    </div>
                  </div>
                  Your email
                </label>
              </div>

            </div>
            <div className="modal-footer d-flex justify-content-center form-group">
              <button type="submit" className="btn btn-danger p-2 flex-grow-1">Reset Password</button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
