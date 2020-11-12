import React from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';

function SearchMessageBox() {
  return (
    <React.Fragment>
      <i className="fa fa-search searchIcon" />
      <div className="searchLabel"> Search messages </div>
    </React.Fragment>
  );
}

export default SearchMessageBox;
