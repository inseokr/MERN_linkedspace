import React, {useContext} from 'react' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'


// ISEO-TBD:
// It turned out that the GlobalContext is not being created yet?
function MyNetworkLeftPane()
{
	let numberOfFriends = 3;

	const img_style = {
		maxHeight: "70%", 
		marginTop: "10px"
	};

	return (
		<div class="d-flex justify-content-around connection_pannel wooden_background">
			<div class="connection_image">
				<div class="col">
					<div class="image1">
						<img class="img-responsive center rounded-circle" style={img_style} src="/public/user_resources/pictures/Peter.jpg"/>
					</div>
					<div class="image2">
						<img class="img-responsive center rounded-circle" style={img_style} src="/public/user_resources/pictures/Joongho.jpg"/>
					</div>
					<div class="image3">
						<img class="img-responsive center rounded-circle" style={img_style} src="/public/user_resources/pictures/Chinh - Vy.jpg"/>
					</div>
				</div>
			</div>
			<div class="connection_caption bold_fonts">
				<a href="#direct_friends"> Connections({numberOfFriends}) </a>
			</div>
		</div>
	);
}

export default MyNetworkLeftPane;