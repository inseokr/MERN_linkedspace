/* eslint-disable */

function preprocessUrlRequest(loginStatus, loginClickHandler, hideLoginModal)
{
  //console.warn("preprocessUrlRequest is called. LoginStatus = " + loginStatus);
  //console.warn("window.location.pathname = " + window.location.pathname);
  if(loginStatus === false)
  {
    if(sessionStorage.getItem('redirectUrlAfterLogin')===null && window.location.pathname!=="/")
    {
      //console.warn("Setting redirectURL");
      sessionStorage.setItem('redirectUrlAfterLogin', window.location.pathname);
      loginClickHandler();
    }
  }
  else
  {
    if(loginStatus===true) hideLoginModal(); 

    if(sessionStorage.getItem('redirectUrlAfterLogin')!==null)
    {
      sessionStorage.removeItem('redirectUrlAfterLogin');  
    }
  }
}

export {
  preprocessUrlRequest
};

