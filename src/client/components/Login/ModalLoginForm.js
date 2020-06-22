
import React, { Component } from 'react';
import '../../app.css';

var modalContentStyle = {
	width: '300px !important'
};

var modalTitleStyle = {
	color: 'black'
};

var mdFormStyle = {
	margin: 'auto',
	marginTop: '20px',
	marginBottom: '10px !important'
};

var facebookImgStyle = {
	width: '270px',
	height: '45px'
};

var strikeThroughStyle = {
	color: 'LightGrey'
};

var mdFormBottom = {
	marginBottom: '10px !important'
};

var mdFormBackground = {
	backgroundColor: '#FFFFFF'
};

var marginBottom5x = {
	marginBottom: '5px !important'
};

export default class ModalLoginForm extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
    	<>
		<div className="modal fade" id="modalLoginForm" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel"aria-hidden="true">

		  <div className="modal-dialog" role="document">

		  	<div className="modal-content" style={modalContentStyle}>


			  <div className="modal-header text-center">
		        <h4 className="modal-title w-100 ariweight-bold" font-ss="close" data-dismiss="modal" style={modalTitleStyle}>LinkedSpaces</h4>
		      </div>

			  <div className="md-form mb-5 form-group" style={mdFormStyle}>
				<a href="/auth/facebook"><img src="/public/user_resources/pictures/facebook_login.png" style={facebookImgStyle} alt="Facebook"/></a>
			  </div>

			  <div className="modal-body text-center" style={{marginBottom: '0px !important'}}>
			  	<span className="strike-through" style={strikeThroughStyle}> or </span>
			  </div>

		      <form action="/login" method="POST" role="form">

		      	<div className="modal-body form-group">

			        <div className="md-form mb-5 form-group" style={mdFormBottom}>
			        	<div className="input-group">
			          		<input type="text" className="form-control validate" name="username"/>
			          		<div className="input-group-append">
    							<span className="input-group-text" style={{backgroundColor: '#FFFFFF'}}><i className="fa fa-user"></i></span>
  					  		</div>
  					  	</div>
  					  <label data-error="wrong" data-success="right" htmlFor="defaultForm-email" style={modalTitleStyle}>Your login name</label>
			        </div>

			        <div className="md-form mb-4 form-group" style={{backgroundColor: '#FFFFFF'}}>
			        	<div className="input-group">
				          <input type="password" id="defaultForm-pass" className="form-control validate" name="password"/>
				          <div className="input-group-append">
				          	<span className="input-group-text" style={mdFormBackground}><i className="fas fa-lock"></i></span>
				          </div>
				        </div>
			          <label data-error="wrong" data-success="right" htmlFor="defaultForm-pass" style={{backgroundColor: '#FFFFFF'}}>Your password</label>
			        </div>

			    </div>

			    <div className="modal-footer d-flex justify-content-center form-group">
			       <button className="btn btn-danger p-2 flex-grow-1">Login</button>
			    </div>

		        <div className="modal-footer d-flex justify-content-center">
		            <a href="/forgot"> Forgot Password </a>
		        </div>

			  </form>
		    </div>

		  </div>

		</div>
        </>
    );
  }
 }
