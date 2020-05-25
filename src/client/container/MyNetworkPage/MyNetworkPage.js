import React, {Component, useContext} from 'react' 
import MyNetworkLeftPane   from './MyNetworkLeftPane'
import MyNetworkCenterPane from './MyNetworkCenterPane'
import { GlobalProvider , GlobalContext } from '../../contexts/GlobalContext'
import './mynetwork_style.css'

export default class MyNetworkPage extends Component {

static contextType = GlobalContext;

  constructor(props){
    super(props);
  }

  componentDidMount() {
    console.log("MyNetworkPage is being loaded");
  }

  componentWillMount() {
    console.log("MyNetworkPage WillMount called");
    this.context.loadSocialNetworkDb();
  }
	
  render() {

	return (
		<div class="row">
			<div class="col-lg-3">
				<MyNetworkLeftPane />
			</div>
			<div class="col-lg-6">
				<MyNetworkCenterPane />
			</div>
		</div>
	);
  }
}