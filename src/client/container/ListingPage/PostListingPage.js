/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import '../../app.css';

// https://github.com/inseokr/MERN_linkedspace/issues/360
function PostListingPage(props) {
  const history = useHistory();

  const [posting_type, setPostingType] = useState('landlord');
  const [redirectState, setRedirectState] = useState(false);

  function updatePortingType(evt) {
    setPostingType(evt.target.value);
  }

  function submitListingType(evt) {
    if (posting_type == '3rdParty') {
      evt.preventDefault();
      setRedirectState(true);
      history.push('/3rdParty');
    }
  }

  function postingItem(type, index, caption) {
    const margin = {
      marginTop: (index === 1) ? '40px' : '20px',
      marginBottom: '20px'
    };

    const idString = `radio${index}`;

    return (
      <div className="form-check" style={margin}>
        <label className="form-check-label" htmlFor={idString}>
          <input
            type="radio"
            className="form-check-input"
            id={idString}
            name="post_type"
            value={type}
            onChange={updatePortingType}
            checked={posting_type == type}
          />
          {caption}
        </label>
      </div>
    );
  }

  useEffect(() => {
    console.log('PostListingPage: useEffect');
  });

  return (
    <div>
      <div className="row">
        <div className="col-md-4" style={{ marginLeft: '20px' }}>
          <div style={{ marginTop: '20px' }}>
            <h1>Choose what to post</h1>
          </div>
          <form action="/LS_API/listing" method="POST">
            {postingItem('landlord', 1, 'Looking for tenant(s)')}
            <hr />
            {postingItem('tenant', 2, 'Looking for house/room')}
            <hr />
            {postingItem('3rdParty', 3, '3rd party listing, like craigslist or SF Korean etc')}

            <button type="submit" className="btn btn-primary float-left" onClick={submitListingType}>Next</button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PostListingPage;
