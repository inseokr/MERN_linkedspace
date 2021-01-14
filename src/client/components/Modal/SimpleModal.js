/* eslint-disable */
import React from 'react';

import './SimpleModal.css';

function SimpleModal(props) {
  const showHideClassName = props.show == true ? 'simpleModal display-block' : 'simpleModal display-none';

  const additionalStyle = (props._width != undefined)
    ? { width: props._width, height: "auto" } : {};


  return (
    <div className={showHideClassName}>
      <section className="simpleModalMain" style={additionalStyle}>
        {props.children}
        <div className="flex-container" style={{ justifyContent: 'space-around' }}>
          <button className="btn btn-info" onClick={props.handle1} style={{ marginBottom: '5px' }}>{props.caption1!==undefined? props.caption1: "Close"}</button>
          {(props.handle2!==undefined)? 
            <button className="btn btn-danger" onClick={props.handle2} style={{ marginBottom: '5px' }}>{props.caption2!==undefined? props.caption2: "Cancel"}</button>
            : ""}
        </div>
      </section>
    </div>
  );
}

export default SimpleModal;
