import React, { useContext } from 'react';
import '../../app.css';
import Search from "../../container/SearchPage/SearchPage";
import {Link, Redirect} from 'react-router-dom';
import {GlobalContext} from "../../contexts/GlobalContext";
import {MessageContext} from "../../contexts/MessageContext";


function Logout()
{
  const {setCurrentUser} = useContext(GlobalContext);
  const {checkIfAnyNewMsgArrived} = useContext(MessageContext);

  console.log("Logout called");

  fetch('/logout')
  .then(res => res.json())
  .then(result => {
    setCurrentUser(null);
  })

  return (
  	<div>
      <Redirect to='/' />
    </div>
  );
 }

 export default Logout;
