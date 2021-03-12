/* eslint-disable */
import React from 'react';
import { FILE_SERVER_URL } from '../../globalConstants';

function MiddlemenIntro(props) {


    let IntroMainStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 3fr 3fr 1fr',
        gridTemplateAreas: `". ti im ."`,
        marginTop: '50px'
    };

    let IntroStyle = {
        minWidth: '50vh',
        gridArea: 'ti',
        marginLeft: '50px'
    };

    let ImgStyle = {
        maxWidth: '600px',
    };

    let urlImg = "/public/user_resources/pictures/social-media-1635576_1920.jpg";

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
                <section className="_lsTitleLarge" style={{textAlign: 'left'}}> You and your social network matters </section>
                <section className="_lsMediaMedium" style={{marginTop: '25px'}}> 
                    If you are not looking for a house/room or planning any vacation, why bother signing up this service then?
                    <br></br>
                    <br></br>
                    LinkedSpaces works through your social network. Your contributions will be closely monitored, and the credit will be properly accrued in the system.
                    <br></br>
                    <br></br>
                    Various contributions you can make:
                    <br></br>
                    <br></br>
                    <ul>
                        <li> Connect your friends who may have a house/room or looking for tenants</li>
                        <li> Share your local information if you happen to live in the destination your friend's heading to or land on</li>
                        <li> Social stamp for those looking for a house/room</li>
                    </ul>

                </section>
                <br></br>
                <section className="_lsClickForDetails" onClick={handleSignUp} style={{cursor: 'pointer'}}>
                    {`Sign up to and earn credit >`}
                </section>
            </div>
        </div>
    )
}

export default MiddlemenIntro;