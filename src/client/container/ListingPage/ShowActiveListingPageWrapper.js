import React, { Component } from 'react';
import ShowActiveListingPage from "./ShowActiveListingPage";
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

export default class ShowActiveListingPageWrapper extends Component {
  
  static contextType = CurrentListingContext;

  constructor(props){
    super(props);

    this.state = {pageType: props.type};

    console.log("ShowActiveListingPageWrapper: constructor");
  }

  componentDidMount() {
    console.log("ShowActiveListingPageWrapper: componentDidMount");
    this.context.fetchListingInfo(this.props.type);
  }

  componentWillUnmount() {
    console.log("ShowActiveListingPageWrapper: componentWillUnmount");
    this.context.cleanupListingInfoType();
  }

  // This is the first method that is called when a component gets updated.
  static getDerivedStateFromProps(props, state) {
    return {pageType: props.type};
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {

    console.log("ShowActiveListingPageWrapper: getSnapshotBeforeUpdate");
    
    if(prevProps.type!=this.props.type)
    {
      this.setState({
        pageType: this.props.type
      });
      // fetching new data with new type
      this.context.fetchListingInfo(this.props.type);
    }

    return {pageType: this.props.type};
  }

  componentDidUpdate() {
  }


  render() {
    return (
      <>
      <ShowActiveListingPage type={this.props.type} listingControl={this.props.listingControl}/>
      </>
    );
  }
}