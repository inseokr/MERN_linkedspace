import React, { useContext, useEffect, useRef, useState } from 'react';
import { ListingsContext } from '../../../../contexts/ListingsContext';
import makeStyles from '@material-ui/core/styles/makeStyles';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Modal from '../../../../components/Modal';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing(3),
  },
  modalButton: {
    width: '50%',
    margin: '0 auto',
  }
}));

function PlaceFilter() {
  const {filterListings, places, price, date} = useContext(ListingsContext);
  const classes = useStyles();

  const [showModal, setShowModal] = useState(false);
  const [interimPlaces, setPlaces] = React.useState(places);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleChange = (event) => {
    setPlaces({...interimPlaces, [event.target.name]: event.target.checked});
  };

  const onSubmit = () => {
    if (interimPlaces !== places) {
      filterListings(interimPlaces, price, date);
    }
  };

  const onClear = () => {
    setPlaces({
      Entire: false,
      Private: false,
      Shared: false
    });
  };

  const { Entire, Private, Shared } = interimPlaces;

  return (
    <div className={`${showModal ? "blur" : undefined} modal-app`}>
      <button className="filter-button" onClick={toggleModal}>
        Type of place
      </button>
      {showModal && (
        <Modal toggleModal={toggleModal}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={Entire} onChange={handleChange} name="Entire" />}
                label={
                  <div>
                    <Typography>
                      Entire Place
                    </Typography>
                    <Typography variant="caption">
                      Have a place to yourself
                    </Typography>
                  </div>
                }
              />
              <FormControlLabel
                control={<Checkbox checked={Private} onChange={handleChange} name="Private" />}
                label={
                  <div>
                    <Typography>
                      Private Room
                    </Typography>
                    <Typography variant="caption">
                      Have your own room and share some common spaces
                    </Typography>
                  </div>
                }
              />
              <FormControlLabel
                control={<Checkbox checked={Shared} onChange={handleChange} name="Shared" />}
                label={
                  <div>
                    <Typography>
                      Shared Room
                    </Typography>
                    <Typography variant="caption">
                      Stay in a shared space, like a common room
                    </Typography>
                  </div>
                }
              />
            </FormGroup>
          </FormControl>
          <Grid container spacing={5}>
            <Grid item xs={6}>
              <div className={classes.modalButton}>
                <button className="filter-button" onClick={onClear}>
                  Clear
                </button>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={classes.modalButton}>
                <button className="filter-button" onClick={() => {toggleModal(); onSubmit();}}>
                  Submit
                </button>
              </div>
            </Grid>
          </Grid>
        </Modal>
      )}
    </div>
  );
}

export default PlaceFilter;