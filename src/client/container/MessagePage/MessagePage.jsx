import React, { Component } from 'react';
import '../../app.css';
import { renderToString } from 'react-dom/server';
import Home from '../HomePage/Home';
import Dashboard from '../DashboardPage/Dashboard';
import Map from '../MapPage/index';
import Search from '../SearchPage/SearchPage';
import MessageHeader from './MessageHeader';
import MessageSummaryPanel from './MessageSummaryPanel';


function MessagePage() {
  return (
    <div className="row">
      <div className="col-lg-3">
        <MessageHeader />
      </div>
      <div className="col-lg-6">
        <MessageSummaryPanel />
      </div>
      {renderData}
    </div>
  );
}

export default MessagePage;
