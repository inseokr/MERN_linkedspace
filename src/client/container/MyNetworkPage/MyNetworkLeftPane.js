import React, {useContext} from 'react' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'


function MyNetworkLeftPane()
{
	const {network_info} = useContext(GlobalContext);


	if(network_info==null) return null;

	const img_style = {
		maxHeight: "70%", 
		marginTop: "10px"
	};

	function getFriendImages()
	{
		if(network_info==null)
		{ 
			return null;
		}

		let friendsImage = [];

		console.log("getFriendImages, length = " + network_info.direct_friends_list.length);

		for(var i = 0; i< network_info.direct_friends_list.length; i++)
		{
			friendsImage.push(
				<div class={"image"+(i+1)}>
						<img class="img-responsive center rounded-circle" style={img_style} src={network_info.direct_friends_list[i].profile_picture}/>
				</div>
			);
		}

		return friendsImage;
	}

	return (
		<div class="d-flex justify-content-around connection_pannel wooden_background">
			<div class="connection_image">
				<div class="col">
					{getFriendImages()}
				</div>
			</div>
			<div class="connection_caption bold_fonts">
				<a href="#direct_friends"> Connections({network_info.direct_friends_list.length}) </a>
			</div>
		</div>
	);
}

export default MyNetworkLeftPane;