
import React, { Component } from 'react';
import '../../app.css';



export default class ModalLoginForm extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
    	<>
		<div class="modal fade" id="modalLoginForm" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"aria-hidden="true">

		  <div class="modal-dialog" role="document">

		  	<div class="modal-content" style={modalContentStyle}>
		  	</div>

			<div class="modal-header text-center">
		        <h4 class="modal-title w-100 ariweight-bold" font-ss="close" data-dismiss="modal" style={modalTitleStyle}>LinkedSpaces</h4>
		      </div>

			  <div class="md-form mb-5 form-group" style={mdFormStyle}>
				<a href="/auth/facebook"><img src="/public/user_resources/pictures/facebook_login.png" style={facebookImgStyle} alt="Facebook"/></a>
			  </div>

			  <div class="modal-body text-center" style={{marginBottom: '0px !important'}}>
			  	<span class="strike-through" style={strikeThroughStyle}> or </span>
			  </div>

		      <form action="/login" method="POST" role="form">

		      	<div class="modal-body form-group">

			        <div class="md-form mb-5 form-group" style={mdFormBottom}>
			        	<div class="input-group">
			          		<input type="text" class="form-control validate" name="username"/>
			          		<div class="input-group-append">
    							<span class="input-group-text" style={mdFormBackground}><i class="fa fa-user"></i></span>
  					  		</div>
  					  	</div>
  					  <label data-error="wrong" data-success="right" for="defaultForm-email" style={modalTitleStyle}>Your login name</label>
			        </div>

			        <div class="md-form mb-4 form-group" style={marginBottom5x}>
			        	<div class="input-group">
				          <input type="password" id="defaultForm-pass" class="form-control validate" name="password"/>
				          <div class="input-group-append">
				          	<span class="input-group-text" style={mdFormBackground}><i class="fas fa-lock"></i></span>
				          </div>
				        </div>
			          <label data-error="wrong" data-success="right" for="defaultForm-pass" style={mdFormBackground}>Your password</label>
			        </div>

			    </div>

			    <div class="modal-footer d-flex justify-content-center form-group">
			       <button class="btn btn-danger p-2 flex-grow-1">Login</button>
			    </div>

		        <div class="modal-footer d-flex justify-content-center">
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
