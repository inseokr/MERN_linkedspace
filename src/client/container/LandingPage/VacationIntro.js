/* eslint-disable */
import React from 'react';
import { FILE_SERVER_URL } from '../../globalConstants';

function VacationIntro(props) {

    let IntroMainStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 3fr 3fr 1fr',
        gridTemplateAreas: `". im ti ."`,
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

    let urlImg = "/public/user_resources/pictures/journey-1130732_1920.jpg";

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
                <section className="_lsTitleLarge" style={{textAlign: 'left'}}> Planning Vacation?  </section>
                <section className="_lsMediaMedium" style={{marginTop: '25px'}}> 
                    Vacation planning could be very painful process for many people, and getting the right accommodation satisfying the majority of people in the group will be always a challenging task.
                    <br></br>
                    <br></br>
                    LinkedSpace will turn this paintful process into a joyful one, and the best deal could be found very efficient way with minimum efforts.
                    <br></br>
                    <br></br>
                </section>
                <section className="_lsClickForDetails" onClick={handleSignUp} style={{cursor: 'pointer'}}>
                    {`Sign up if you are ready for vacation >`}
                </section>
            </div>
        </div>
    )
}

export default VacationIntro;