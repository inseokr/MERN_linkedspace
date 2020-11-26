import React, { useState, useEffect } from 'react';

import Switch from 'react-switch';

import '../../app.css';

export default function ToggleSwitch(props) {
  const [checked, setChecked] = useState(false);
  const [leftStyle, setLeftStyle] = useState('SelectedCaption');
  const [rightStyle, setRightStyle] = useState('');

  function handleChange(_checked) {
    setChecked(_checked);
    props.clickHandler(false);

    console.log(`checked=${_checked}`);

    if (_checked === true) {
      setRightStyle('SelectedCaption');
      setLeftStyle('');
    } else {
      setLeftStyle('SelectedCaption');
      setRightStyle('');
    }
  }

  useEffect(() => {
  });

  const { leftCaption, rightCaption } = props;

  return (

    <div className="SlidingToggleSwitch">
      <span className={`ToggleLeft ToggleCaption${leftStyle}`}>
        {' '}
        {leftCaption}
        {' '}
      </span>
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
      <span className={`ToggleRight ToggleCaption${rightStyle}`}>
        {' '}
        {rightCaption}
        {' '}
      </span>
    </div>
  );
}
