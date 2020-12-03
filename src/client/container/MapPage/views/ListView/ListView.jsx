import React, { useContext } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListingComponent from './ListingComponent';

function ListView(props) {
    const {filteredListings} = useContext(ListingsContext);
    const {toggle, mode} = props;

    return (
        <div>
            <Paper style={{maxHeight: "100vh", overflow: "auto"}}>
                <List>
                    {filteredListings.length > 0 ? (
                        <div>
                            {filteredListings.map(function (listing) {
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
