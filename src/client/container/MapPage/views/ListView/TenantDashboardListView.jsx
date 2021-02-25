/*eslint-disable*/
import React, { useContext } from 'react';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import TenantListingComponent from './TenantListingComponent';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';
import { MessageContext, MSG_CHANNEL_TYPE_GENERAL, MSG_CHANNEL_TYPE_LISTING_PARENT } from '../../../../contexts/MessageContext';

function TenantDashboardListView(props) {
  const { currentListing } = useContext(CurrentListingContext);

  return (
    <div>
      <Paper style={{ maxHeight: '84.5vh', overflow: 'auto' }}>
        <List>
          <div>
            <Divider variant="middle" />
            <TenantListingComponent listing={currentListing} childSupported="true" />
          </div>
        </List>
      </Paper>
    </div>
  );
}

export default TenantDashboardListView;
