import React, {useState, useEffect} from 'react';

import Switch from 'react-switch';

import '../../app.css';

export default function ToggleSwitch(props) {

  const [checked, setChecked] = useState(false);
  const [leftStyle, setLeftStyle] = useState("SelectedCaption");
  const [rightStyle, setRightStyle] = useState("");

  function handleChange(checked) {
    setChecked(checked);
    props.clickHandler();

    console.log("checked="+checked);

    if(checked===true) {
      setRightStyle("SelectedCaption");
      setLeftStyle("");
    } 
    else {
      setLeftStyle("SelectedCaption");
      setRightStyle("");
    }
  }

  useEffect(() => {
  });

  return (
    <div className="SlidingToggleSwitch">
      <span className={"ToggleLeft ToggleCaption"+leftStyle}> {props.leftCaption} </span>
        <Switch
          onChange={handleChange}
          checked={checked}
          className="react-switch"
          uncheckedIcon={false}
          checkedIcon={false}
          offColor="#17a2b8"
          onColor="#17a2b8"
          handleDiameter={25}
          height={30}
          width={55}
        />
      <span className={"ToggleRight ToggleCaption"+rightStyle}> {props.rightCaption} </span>
    </div>
  );
}
