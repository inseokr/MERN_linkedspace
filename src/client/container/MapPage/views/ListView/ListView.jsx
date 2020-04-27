import React, { Component } from 'react';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import ListingComponent from './ListingComponent';

class ListView extends Component {

  constructor() {
    super();
    this.state = {}
  }

  render() {
    const {data} = this.props;

    return (
      <div>
        <Paper style={{maxHeight: "100vh", overflow: "auto"}}>
          <List>
            {data.map(function (listing) {
              return (
                <div>
                  <Divider variant={"middle"}/>
                  <ListingComponent listing={listing}/>
                </div>
              )
            })}
          </List>
        </Paper>
      </div>
    );
  }
}

export default ListView;
