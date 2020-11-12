import React, { useContext } from 'react';
import '../../app.css';
import { Redirect } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';

function Logout() {
  const { setCurrentUser } = useContext(GlobalContext);

  console.log('Logout called');

  fetch('/LS_API/logout')
    .then(res => res.json())
    .then((result) => {
      setCurrentUser(null);
      console.log(`result=${result}`);
    });

  return (
    <div>
      <Redirect to="/" />
    </div>
  );
}

export default Logout;
