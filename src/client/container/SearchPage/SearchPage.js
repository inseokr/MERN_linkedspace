import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { ListingsContext } from '../../contexts/ListingsContext';
import './SearchPage.css';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      EnterKeyPressed: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleInputChange = () => {
    this.setState({
      query: this.search.value
    });
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log(`Search value = ${this.search.value}`);
      // not sure why... but the enter key event is caught only by handleKeyDown, not keyPressed.
      this.setState({ EnterKeyPressed: true });
    }
  };

  static contextType = ListingsContext;

  // how to link only if input value it set or enterKey?
  // <note> we could link it to other route if the form is placed under Link
  // <note> history.push() works, but need to pass history data through withRouter package?
  // <note> this component doesn't work in the navbar/header portion
  render() {
    const { EnterKeyPressed, query } = this.state;

    if (EnterKeyPressed) {
      const { filterParams, setFilterParams } = this.context;
      const searchQuery = query.length > 0 ? query : 'Fremont, CA, USA';
      setFilterParams({ ...filterParams, search: searchQuery });
      return <Redirect to="/Map" />;
    }

    return (
      <div>
        <form className="btn btn-default btn-lg">
          <i className="fa fa-search searchIcon" />
          <input
            className="searchInput"
            placeholder="City, State, Country"
            ref={(input) => { this.search = input; }}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleInputChange}
          />
        </form>
      </div>
    );
  }
}
