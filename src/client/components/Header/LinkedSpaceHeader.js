import React, { Component } from 'react';
import '../../app.css';

export default class LinkedSpaceHeader extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
    	<>
		<head>
          <title>LinkedSpaces</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
          <link href="https://use.fontawesome.com/releases/v5.0.7/css/all.css" rel="stylesheet"/>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
            <link rel="stylesheet" href="/stylesheets/main.css"/>
            <link rel="stylesheet" href="/stylesheets/bootstrap_switch.css"/>
            <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
        </head>
        </>
    );
  }
 }
