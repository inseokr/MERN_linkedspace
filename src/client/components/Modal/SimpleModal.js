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
          <button className="btn btn-info" onClick={props.handleClose} style={{ marginBottom: '5px' }}>{props.captionCloseButton}</button>
          {(props.handleCancel!==undefined)? 
            <button className="btn btn-warning" onClick={props.handleCancel} style={{ marginBottom: '5px' }}>Cancel</button>
            : ""}
        </div>
      </section>
    </div>
  );
}

export default SimpleModal;
