import React from "react"

import "./SimpleModal.css"

function SimpleModal(props)
{
  const showHideClassName = props.show==true ? "simpleModal display-block" : "simpleModal display-none";

  //console.log("className = " + showHideClassName);
  //console.log("children = " + props.children);

  let additionalStyle = (props._width!=undefined)? 
    { width: props._width} : {}; 

  return (
    <div className={showHideClassName}>
      <section className="simpleModalMain" style={additionalStyle}>
      	{props.children}
      	<div className="flex-container" style={{justifyContent:"center"}}> 
        	<button className="btn btn-info" onClick={props.handleClose} style={{marginBottom: "5px"}}>{props.captionCloseButton}</button>
        </div>
      </section>
    </div>
  );

}

export default SimpleModal;