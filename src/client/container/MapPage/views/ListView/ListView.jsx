/* eslint-disable */
import React, { useContext } from 'react';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import ListingComponent from './ListingComponent';

function ListView(props) {
  const { listingsByBounds } = useContext(ListingsContext);
  const { toggle, mode } = props;

  return (
    <div>
      <Paper style={{ maxHeight: '100vh', overflow: 'auto' }}>
        <List>
          {listingsByBounds.length > 0 ? (
            <div>
              {listingsByBounds.map(function (listing) {
                return (
                  <div key={listing._id}>
                    <Divider variant={"middle"}/>
                    <ListingComponent listing={listing} toggle={toggle} mode={mode} childSupported="false"/>
                  </div>
                )
              })}
            </div>
          ) : (<div>No Listing(s) Found.</div>)}
        </List>
      </Paper>
    </div>
  );
}

export default ListView;
