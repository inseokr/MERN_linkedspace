import React, { Component, useEffect, createContext, useContext } from 'react';
import {Link} from 'react-router-dom';
import '../../app.css';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

function getListingContents(listingDB, listing_prefix)
{
    let listings = []

    function getCoverImg(listing_prefix, listing)
    {
        if(listing_prefix=="_3rdparty")
        {
            return (
                    <a href={listing.url}>
                        <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture}/>
                    </a>
                )
        }
        else
        {
            return (
                    <Link to={"/listing/"+listing_prefix+"/"+listing.id}>
                        <img className="img-responsive center" style={{maxHeight:"80%", maxWidth:"100%", marginTop:"10px"}} src={listing.picture}/>
                    </Link>
                )
        }
    }

    function getListingSourceInformation(listing_prefix, listing)
    {
        if(listing_prefix=="_3rdparty")
        {
            return (
                <span style={{textAlign: "center", color: "Purple"}}> <h5> {listing.source} </h5> </span>
            )
        }
        else
        {
            return null;
        }
    }

    for (let index=0; index<listingDB.length; index++)
    {
        let listing = 
            <div className="network_board">
                <div className="profile_picture">
                    {getCoverImg(listing_prefix, listingDB[index])}
                    {getListingSourceInformation(listing_prefix, listingDB[index])}
                </div>
                
                <div className="d-flex justify-content-between">
                    <form role="form" action={"/listing/"+listing_prefix+"/"+listingDB[index].id+"/edit"} method="post">
                        <div className="action">
                            <button className="btn btn-info">Edit</button>
                        </div>
                    </form>

                    <form role="form" action={"/listing/"+listing_prefix+"/"+listingDB[index].id+"?_method=DELETE"} method="post">
                        <div className="action">
                            <button className="btn btn-danger">Delete</button>
                        </div>
                    </form>
                </div>
            </div>

        listings.push(listing) 
    }

    return listings;
} 

function ShowActiveListingPage()
{
    const {listing_info, fetchListingInfo} = useContext(CurrentListingContext);

    if(listing_info==undefined)
    {
        fetchListingInfo();
        return (<> No listing available </>);
    }

    // ISEO-TBD: not sure how to match it?
    let footer = "";

    return (
        <>
            <div className="row">
                <div className="col-lg-3">
                </div>

                <div className="col-lg-6">
                    <div className="bottom-shadow">
                        <span style={{textAlign:"center"}}><h3> Looking for tenants/roommates   </h3></span>
                        <hr/>
                        <div className="d-flex justify-content-between flex-wrap">
                            {getListingContents(listing_info.landlord_listing, "landlord")}
                        </div>
                    </div>

                    <div className="bottom-shadow">
                        <span style={{textAlign:"center"}}><h3> Looking for rooms/house  </h3></span>
                        <hr/>
                        <div className="d-flex justify-content-between flex-wrap">
                            {getListingContents(listing_info.tenant_listing, "tenant")}
                        </div>
                    </div>
                    <div className="bottom-shadow">
                        <span style={{textAlign:"center"}}><h3> Listing from 3rd party  </h3></span>
                        <hr/>
                        <div className="d-flex justify-content-between flex-wrap">
                            {getListingContents(listing_info._3rdparty_listing, "_3rdparty")}
                        </div>
                    </div> 
                </div>

                <div className="col-lg-3">
                </div>                
            </div>
            {footer}
        </>
    );
}

export default ShowActiveListingPage