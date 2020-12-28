import React, { useContext } from 'react';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import TenantListingComponent from './TenantListingComponent';
import { CurrentListingContext } from '../../../../contexts/CurrentListingContext';

function TenantDashboardListView(props) {
  const { currentListing } = useContext(CurrentListingContext);
  const { toggle, mode } = props;

  return (
    <div>
      <Paper style={{ maxHeight: '84.5vh', overflow: 'auto' }}>
        <List>
          <div>
            <Divider variant="middle" />
            <TenantListingComponent listing={currentListing} toggle={toggle} mode={mode} childSupported="true" />
          </div>
        </List>
      </Paper>
    </div>
  );
}

export default TenantDashboardListView;
