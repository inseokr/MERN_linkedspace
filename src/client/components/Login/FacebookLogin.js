import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import '../../app.css';
import { GlobalContext } from '../../contexts/GlobalContext';


function FacebookLogin(props) {
  // const { setCurrentUser } = useContext(GlobalContext);
  const { match } = props;
  const { updateLoginStatus } = props;
  const {
    currentUser, setCurrentUser
  } = useContext(GlobalContext);

  const formData = new FormData();
  formData.append('username', match.params.id);

  if (currentUser == null) {
    fetch('/LS_API/auth/facebook/relogin', { method: 'POST', body: formData })
      .then(res => res.json())
      .then((user) => {
        console.log(` received user = ${user}`);
        setCurrentUser(user);
        updateLoginStatus(user != null);
      });
  }

  return (
    <Redirect to="/" />
  );
}

export default FacebookLogin;
