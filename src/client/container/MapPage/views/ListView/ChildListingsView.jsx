/* eslint-disable */
import React, { Component } from 'react';
import shortid from 'shortid';
import './ListingComponent.css';
import ListItem from '@material-ui/core/ListItem';
import { Paper, Grid, Typography } from '@material-ui/core';
import Carousel from 'react-bootstrap/Carousel';
import constructListingInformationBullets from '../../helper/helper';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import { MSG_CHANNEL_TYPE_LISTING_CHILD } from '../../../../contexts/MessageContext';
import ChildListing from './ChildListing';
import axios from 'axios';


/*
	Programming business logic
	1. construct ChildListing view using _3rd_party_listing array
	+ create or modify list of refs
	+ create or modify click states
	problem1> we should not update it all the time, otherwise it will lead to infinite rendering.
	So we have to make it sure that reconstruction happens only if needed.
	case1> new listing added
	case2> upon click event

	<note> hook can't be called inside hook function.

	Don’t call Hooks inside loops, conditions, or nested functions.
	Instead, always use Hooks at the top level of your React function.
	By following this rule, you ensure that Hooks are called in the same order each time a component renders.
	That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls.
	==> Better convert it into component.

*/

// how to make an action when it detects any change in the context?
export default class ChildListingsView extends Component {
  static contextType = CurrentListingContext;


  // ISEO-TBD: this function can't be called inside useEffect as it's calling another hook.
  buildChildListingViewsByHandleClick() {
    const _childListingViews = [];

    this.context.currentListing.child_listings.map(function (childListing, index) {
      // console.log("childListingsViews: index="+index);
      // console.log("childListingsViews: clickStates="+this.state.clickStates[index]);
      // console.log("childListingsViews: refs="+this.state.refs[index]);


      _childListingViews.push(
        <div key={shortid.generate()}>
          <ChildListing
            clickState={this.state.clickStates[index]}
            likedState={this.state.likedStates[index]}
            clickHandler={this.handleClickState}
            likeClickHandler={this.handleLikedState}
            handleSelect={this.props.handleSelect}
            listing={childListing}
            index={index}
            messageClickHandler={this.props.messageClickHandler}
            removeHandler={this.props.removeHandler}
            ref={this.state.refs[index]}
          />
        </div>);
    }, this);

    this.setState({ childListingsViews: _childListingViews });
  }

  handleClickState(index) {
    // update clickStates where the index is referring to
    const listClickStates = [...this.state.clickStates];

    // reset all others
    for (let i = 0; i < listClickStates.length; i++) {
      listClickStates[i] = 0;
    }

    listClickStates[index] = 1;

    this.setState({ clickStates: listClickStates, currentActiveIndex: index }, this.buildChildListingViewsByHandleClick);
  }


  async handleLikedState(index) {

    const listLikedStates = [...this.state.likedStates];
    // toggling the licked
    let command = 'add';

    if(listLikedStates[index]===0)
    {
      //console.warn("setLikeClicked to 1");
      listLikedStates[index] = 1;
      command = 'add';
    }
    else
    {
      //console.warn("setLikeClicked to 0");
      listLikedStates[index] = 0;
      command = 'remove'
    }

    this.setState({ likedStates: listLikedStates}, this.buildChildListingViewsByHandleClick);

    const post_url = `/LS_API/listing/${this.context.currentListing.listingType}/${this.context.currentListing._id}/${this.context.currentListing.child_listings[index].listing_id._id}/liked/${command}`;
    // empty data for now
    const data = {
    };

    const result = await axios.post(post_url, data)
      .then((result) => {
        // ID of chatting channel will be returned.
        // update dmChannelContexts
        console.log("add to liked list: result = " + result);
        //window.location.reload();
        this.context.fetchCurrentListing(this.context.currentListing._id, "tenant");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleClickFromMap(index) {
    //console.warn("handleClickFromMap: index="+index);
    //console.warn("currentActiveIndex="+this.state.currentActiveIndex);

    if (index != this.state.currentActiveIndex) {
      // Parent listing is clicked
      if(index===-1)
      {
        this.setState({ currentActiveIndex: index});
      }
      else
      {
        if (this.state.refs != null) {
          if (this.state.refs[index] != null) {
            if (this.state.refs[index].current != null) {
              // console.log("ISEO-TBD:calling focus!!");
              this.state.refs[index].current.click();
              this.state.refs[index].current.scrollIntoView();
              this.setState({ currentActiveIndex: index }, this.buildChildListingViewsByHandleClick);
            }
          }
        }
      }
    }
  }

  buildChildListingViews() {
    //console.warn("buildChildListingViews");
    // build it only if there is any change in the number of child listing
    const refArray = [];
    const _childListingViews = [];
    const listClickStates = [...this.state.clickStates];
    const listLikedStates = [...this.state.likedStates];
    const initialLength = listClickStates.length;

    this.context.currentListing.child_listings.map(function (childListing, index) {

      listClickStates[index] = 0;
      // check if current user is in the liked list
      // q1. we need current user information
      listLikedStates[index] = 0;

      if (Object.keys(childListing).includes("listOfLikedUser")) {
        for(let user_index=0; user_index < (childListing.listOfLikedUser.length); user_index++)
        {
          if(childListing.listOfLikedUser[user_index]===this.context.getCurrentUser()._id)
          {
            listLikedStates[index] = 1;
            //console.warn("Setting liked state of index = " + index);
          }
        }
      }

      const curRef = React.createRef();
      refArray.push(curRef);

      //console.warn(`likedState[${index}]=${listLikedStates[index]}`);

      _childListingViews.push(
        <div key={shortid.generate()}>
          <ChildListing
            clickState={listClickStates[index]}
            likedState={listLikedStates[index]}
            clickHandler={this.handleClickState}
            likeClickHandler={this.handleLikedState}
            handleSelect={this.props.handleSelect}
            listing={childListing}
            index={index}
            messageClickHandler={this.props.messageClickHandler}
            removeHandler={this.props.removeHandler}
            ref={curRef}
          />
        </div>);
    }, this);

    this.setState({
      childListingsViews: _childListingViews,
      clickStates: listClickStates,
      likedStates: listLikedStates,
      refs: refArray
    });
  }

  constructor(props) {
    super(props);

    this.state = {
      clickStates: [],
      likedStates: [],
      currentActiveIndex: -1,
      refs: [],
      childListingsViews: []
    };

    this.handleClickState = this.handleClickState.bind(this);
    this.handleLikedState = this.handleLikedState.bind(this);
    this.buildChildListingViews = this.buildChildListingViews.bind(this);
    this.buildChildListingViewsByHandleClick = this.buildChildListingViewsByHandleClick.bind(this);
    this.handleClickFromMap = this.handleClickFromMap.bind(this);
  }

  componentDidMount() {
    this.buildChildListingViews();
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return { oldValue: prevState.value };
  }

  componentDidUpdate(previousProps, previousState, snapshot) {
    // console.warn("componentDidUpdate="+JSON.stringify(this.props));
    this.handleClickFromMap(this.context.currentChildIndex);

    if (this.context.currentListing.child_listings.length != this.state.childListingsViews.length) {
      this.buildChildListingViews();
    }

    // clear click states if the chatting context is changed
    if ((this.props.chattingContextType != previousProps.chattingContextType)
      && 			(this.props.chattingContextType != MSG_CHANNEL_TYPE_LISTING_CHILD)) {
      this.buildChildListingViews();
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.childListingsViews}
      </React.Fragment>
    );
  }
}
