import React, {Component} from "react";
import Grid from "@material-ui/core/Grid"
import Chip from "@material-ui/core/Grid"
import Link from "@material-ui/core/Link"
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close"
import Draggable from "react-draggable";
import Paper from "@material-ui/core/Paper";

function PaperComponent(props) {
    return (
      <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
          <Paper {...props}/>
      </Draggable>
    );
}

class ListingInfo extends Component {
    constructor(props) {
        super(props);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClickOpen() {
        const {center, toggleListingInfo} = this.props;
        toggleListingInfo(center.lat, center.lng);
    }

    handleClose() {
        const {center, toggleListingInfo} = this.props;
        toggleListingInfo(center.lat, center.lng);
    }

    render() {
        const {listing_info_opened} = this.props;
        if (listing_info_opened){
            return(
                <div>
                    <Dialog id="listing-info" open={listing_info_opened} onClose={this.handleClose} aria-labelledby="form-dialog-title" maxWidth="xs" fullWidth="true" PaperComponent={PaperComponent} >
                        <DialogTitle id="form-dialog-title">Listing Information</DialogTitle>
                        <DialogContent>
                            <Grid display="flex">
                                <Grid item xs={8}>
                                    <TextField
                                        value={"Foo"}
                                        disabled
                                        margin="dense"
                                        id="name"
                                        label="Foo"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        value={"Foo"}
                                        disabled
                                        margin="dense"
                                        id="name"
                                        label="Foo"
                                    />
                                    <Chip label="Foo"/>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        value={"Foo"}
                                        disabled
                                        margin="dense"
                                        id="name"
                                        label="Foo"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        value={"Foo"}
                                        disabled
                                        margin="dense"
                                        id="name"
                                        label="Foo"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Link to=''>
                                <IconButton aria-label="close" onClick={this.handleClose}>
                                    <CloseIcon />
                                </IconButton>
                            </Link>
                        </DialogActions>
                    </Dialog>


                </div>
            )
        } else {
            return (<div/>);
        }
    }
}

export default ListingInfo;