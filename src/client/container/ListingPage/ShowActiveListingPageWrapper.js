/* eslint-disable */
import React, { Component } from 'react';
import ShowActiveListingPage from './ShowActiveListingPage';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

export default class ShowActiveListingPageWrapper extends Component {
    static contextType = CurrentListingContext;

    constructor(props) {
        super(props);

        this.state = { pageType: props.type };

        // console.log("ShowActiveListingPageWrapper: constructor");
    }

    componentDidMount() {
        //console.log("ShowActiveListingPageWrapper: componentDidMount");
        this.context.fetchListingInfo(this.props.type);
    }

    componentWillUnmount() {
        // console.log("ShowActiveListingPageWrapper: componentWillUnmount");
        this.context.cleanupListingInfoType();
    }

    // This is the first method that is called when a component gets updated.
    // ISEO-TBD: it will be the best if we could call fetListingInfo before rendering
    // but getDerivedStateFromProps can't access instance?
    static getDerivedStateFromProps(props, state) {
        // console.log("getDerivedStateFromProps: type=" + props.type);
        return { pageType: props.type };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        // note: this returned value will be snapshot parameter in the componentDidUpdate.
        // I don't think we need this API call.
        return { pageType: this.props.type };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdate');
        if (prevProps.type !== this.props.type) {
            this.setState({
                pageType: this.props.type
            });
            // fetching new data with new type
            this.context.fetchListingInfo(this.props.type);
        }
    }


    render() {
        return (
            <div>
                <ShowActiveListingPage type={this.props.type} listingControl={this.props.listingControl} />
            </div>
        );
    }
}
