/* eslint-disable */
import React from 'react';

const emptyChildStyle = {
    height: '150px',
    marginLeft: '50px',
    width: '90%',
    border: '1px solid rgb(221, 221, 221)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'rgb(0 0 0 / 12%) 0px 6px 16px'
};

const addItemCaptionStyle = {
    position: 'relative',
    top: '30px',
    left: '20px',
  	opacity: '1',
    fontSize: '1.3em',
    color: '#7e3f3f',
    zIndex: '1',
    textAlign: 'center'
};

const addItemStyle = {
  opacity: '1',
  fontSize: '10em',
  color: '#7e3f3f',
  position: 'relative',
  left: '-10px',
  top: '-120px',
  zIndex: '1',
  border: 'none',
  backgroundColor: 'transparent'
};

function EmptyChildListing(props) {
  return (
    <div style={emptyChildStyle}>
        <section style={addItemCaptionStyle}><text> Please add listing(s) to be shared </text></section>
        <button 
        type="submit" 
        id="addItemLabel" 
        onClick={props.handleAttachListing} 
        style={addItemStyle}>+</button>
    </div>
  );
}

export default EmptyChildListing;
