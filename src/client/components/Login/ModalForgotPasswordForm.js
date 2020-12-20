
import React, { Component } from 'react';
import '../../app.css';

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

export default class ModalForgotPasswordForm extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    const { display } = this.props;
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

            <form action="/LS_API/forgot" method="POST">

              <div className="modal-body form-group">

                <div className="md-form form-group" style={mdFormBottom}>
                  <label data-error="wrong" data-success="right" htmlFor="defaultForm-email" style={modalTitleStyle}>
                    <div className="input-group">
                      <input type="text" className="form-control validate" name="email" />
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
}
