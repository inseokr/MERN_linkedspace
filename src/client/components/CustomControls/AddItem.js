/* eslint-disable */
import React from 'react';
import './AddItem.css';

export default function AddItem(props) {
  const addItemStyle = {
  	opacity: '1',
    fontSize: '10em',
    color: '#7e3f3f',
    position: 'relative',
    left: '35px',
    top: '-30px',
    zIndex: '1',
    border: 'none',
    backgroundColor: 'transparent'
  };

  const addItemCaptionStyle = {
  	opacity: '1',
    fontSize: '1em',
    color: '#7e3f3f',
    position: 'relative',
    left: '35px',
    top: '30px',
    zIndex: '1'
  };

  const {onClickHander, listingType} = props;

  return (
    <React.Fragment>
    	<form action="/LS_API/listing" method="POST">
	      <text style={addItemCaptionStyle}> Add new listing</text>
	      <button 
	      	type="submit" 
	      	id="addItemLabel" 
	      	onClick={(evt) => onClickHander(evt, listingType)} 
	      	style={addItemStyle}>+</button>
	      <input
            type="text"
            id="post_type"
            name="post_type"
            value={listingType}
            style={{position:'absolute', display: 'none'}}
          />
      </form>

    </React.Fragment>
  );
}
