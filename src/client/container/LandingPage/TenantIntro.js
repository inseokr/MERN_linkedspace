/* eslint-disable */
import React from 'react';
import { FILE_SERVER_URL } from '../../globalConstants';

function TenantIntro(props) {

    let TenantIntroMainStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 2fr 1fr',
        gridTemplateAreas: `". ti im ."`,
        marginTop: '50px'
    };

    let IntroStyle = {
        minWidth: '50vh',
        gridArea: 'ti'
    };

    let SocialNetworkImgStyle = {
        maxWidth: '600px',
        marginTop: '-30px'
    };

    let urlSocialNetworkImg = "/public/user_resources/pictures/networks-3017398_1920.jpg";

    function handleSignUp() {
        console.warn(`handleSignUp`);
        props.handleSignupClick();
    }

    return (
        <div style={TenantIntroMainStyle}> 
            <div style={IntroStyle}>
                <section className="_lsTitleLarge"> Find room/house through trusted social network  </section>
                <section className="_lsMediaMedium" style={{marginTop: '25px'}}> 
                    Credit score matters, but you feel more secure when the deal's through your trusted network.
                    <br></br>
                    <br></br>
                    For those who struggle due to lack of credit history, linkedSpaces will be the perfect solution,
                    and you will be offered affordable housing solutions through your social network.
                    <br></br>
                    <br></br>
                    Simply create your advertisement and share it through LinkedSpaces ecosystem.
                </section>
                <br></br>
                <section className="_lsClickForDetails" onClick={handleSignUp} style={{cursor: 'pointer'}}>
                    {`Sign up to post your advertisement >`}
                </section>
                
            </div>
            <div style={{gridArea: 'im'}}> 
                <img src={`${FILE_SERVER_URL}${urlSocialNetworkImg}`} style={SocialNetworkImgStyle}></img>
            </div>
        </div>
    )
}

export default TenantIntro;