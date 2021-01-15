/* eslint-disable */
import React, { Component } from 'react';
import '../../app.css';
import { FILE_SERVER_URL } from '../../globalConstants';

const modalContentStyle = {
  marginTop: '70px',
  width: '300px'
};

const modalTitleStyle = {
  color: 'black'
};

const mdFormStyle = {
  margin: 'auto',
  marginTop: '20px',
  marginBottom: '10px'
};

const facebookImgStyle = {
  width: '270px',
  height: '45px'
};

const strikeThroughStyle = {
  color: 'LightGrey'
};

const mdFormBottom = {
  marginBottom: '10px'
};

const mdFormBackground = {
  backgroundColor: '#FFFFFF'
};

export default class ModalLoginForm extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    const { display, forgotPasswordHandler, closeHandler } = this.props;
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
            <span className="fa fa-times" onClick={closeHandler} />
            <div className="modal-header text-center">
              <h4 className="modal-title w-100 ariweight-bold" font-ss="close" data-dismiss="modal" style={modalTitleStyle}>LinkedSpaces</h4>
            </div>

            <div className="md-form mb-5 form-group" style={mdFormStyle}>
              <a href="/LS_API/auth/facebook"><img src={`${FILE_SERVER_URL}/public/user_resources/pictures/facebook_login.png`} style={facebookImgStyle} alt="Facebook" /></a>
            </div>

            <div className="modal-body text-center" style={{ marginBottom: '0px !important' }}>
              <span className="strike-through" style={strikeThroughStyle}> or </span>
            </div>

            <form action="/LS_API/login" method="POST">

              <div className="modal-body form-group">

                <div className="md-form mb-5 form-group" style={mdFormBottom}>
                  <label data-error="wrong" data-success="right" htmlFor="defaultForm-email" style={modalTitleStyle}>
                    <div className="input-group">
                      <input type="text" className="form-control validate" name="username" />
                      <div className="input-group-append">
                        <span className="input-group-text" style={{ backgroundColor: '#FFFFFF' }}><i className="fa fa-user" /></span>
                      </div>
                    </div>
                    Your login name
                  </label>
                </div>

                <div className="md-form mb-4 form-group" style={{ backgroundColor: '#FFFFFF' }}>
                  <label data-error="wrong" data-success="right" htmlFor="defaultForm-pass" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="input-group">
                      <input type="password" id="defaultForm-pass" className="form-control validate" name="password" />
                      <div className="input-group-append">
                        <span className="input-group-text" style={mdFormBackground}><i className="fas fa-lock" /></span>
                      </div>
                    </div>
                    Your password
                  </label>
                </div>

              </div>

              <div className="modal-footer d-flex justify-content-center form-group">
                <button type="submit" className="btn btn-danger p-2 flex-grow-1">Login</button>
              </div>

              <div className="modal-footer d-flex justify-content-center">
                <button type="submit" style={{ border: 'none' }} onClick={forgotPasswordHandler}> Forgot Password </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    );
  }
}
