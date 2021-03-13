/* eslint-disable */
import React from 'react';
import { FILE_SERVER_URL } from '../../globalConstants';

function DashboardIntro(props) {

    let IntroMainStyle = {
        display: 'grid',
        gridTemplateColumns: '2fr 2fr 2fr 4fr 1fr ',
        gridTemplateAreas: `"im im im ti ."`,
        marginTop: '50px'
    };

    let IntroStyle = {
        minWidth: '50vh',
        gridArea: 'ti',
        marginLeft: '20px',
    };

    let ImgStyle = {
        maxWidth: '100vh',
        marginTop: '50px',
        marginLeft: '50px',
        borderRadius: '5%'
    };


    let urlImg = "/public/user_resources/pictures/LinkedSpaces_Dashboard1.jpg";

    function handleSignUp() {
        console.warn(`handleSignUp`);
        props.handleSignupClick();
    }

    return (
        <div style={IntroMainStyle}> 
            <div style={{gridArea: 'im'}}> 
                <img src={`${FILE_SERVER_URL}${urlImg}`} style={ImgStyle}></img>
            </div>
            <div style={IntroStyle}>
                <section className="_lsTitleLarge" style={{textAlign: 'center'}}> Amazing Collaboration Tool  </section>
                <section className="_lsMediaMedium" style={{marginTop: '25px'}}> 
                    Sick and tired of dealing with information spread over all different sites and services when you're looking for room/houses or tenants?
                    <br></br>
                    <br></br>
                    LinkedSpaces offers an efficent tool to keep all the information in one place and communication among friends has never been so easy and effective with this tool.
                    <br></br>
                    <br></br>
                    List of key features provided.
                    <br></br>
                    <br></br>
                    <ul>
                        <li> Integtrated Chatting Service                        
                        </li>
                        <li> Integrated Map Service
                        </li>
                        <li> Liking/Rating Service
                        </li>
                        <li> Sharing postings from other sources like AirBnB, Craigslist, etc
                        </li>
                        <li> Realtime dashboard shared with friends
                        </li>
                    </ul>

                </section>
                <br></br>
                <section className="_lsClickForDetails" onClick={handleSignUp} style={{cursor: 'pointer'}}>
                    {`Sign up to enjoy this >`}
                </section>
            </div>
        </div>
    )
}

export default DashboardIntro;