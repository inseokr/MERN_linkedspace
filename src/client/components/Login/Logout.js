import React, { useContext } from 'react';
import '../../app.css';
import { Redirect } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function Logout() {
  const { setCurrentUser } = useContext(GlobalContext);
  const { deregisterSocket } = useContext(MessageContext);

  console.log('Logout called');

  fetch('/LS_API/logout')
    .then(res => res.json())
    .then((result) => {
      setCurrentUser(null);
      console.log(`result=${JSON.stringify(result)}`);
      deregisterSocket();
    });

  return (
    <div>
      <Redirect to="/" />
    </div>
  );
}

export default Logout;
