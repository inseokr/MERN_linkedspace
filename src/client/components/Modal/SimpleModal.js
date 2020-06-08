import React from "react"

import "./SimpleModal.css"

function SimpleModal(props)
{
  const showHideClassName = props.show==true ? "simpleModal display-block" : "simpleModal display-none";

  console.log("className = " + showHideClassName);
  console.log("children = " + props.children);

  return (
    <div className={showHideClassName}>
      <section className="simpleModalMain">
      	{props.children}
      	<div className="flex-container" style={{justifyContent:"center"}}> 
        	<button className="btn btn-info" onClick={props.handleClose}>Add selected listings</button>
        </div>
      </section>
    </div>
  );

}

export default SimpleModal;