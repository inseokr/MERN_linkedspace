/* eslint-disable */
import React from 'react';

export default function FormatListItems(list, numOfItemsInOneDivision) {
  const formattedOutput = [];

  function formatSingleDivision(list, index, length) {
    const items = [];
    let count = 0;

    for (let curIndex = index; curIndex < length && count < numOfItemsInOneDivision; curIndex++, count++) {
      items.push(<li key={list[curIndex]}>{list[curIndex]}</li>);
    }

    return (
      <div className="col-4" style={{ paddingTop: '8px' }} key={index}>
        <ul>
          {items}
        </ul>
      </div>
    );
  }

  for (let index = 0; index < list.length; index += numOfItemsInOneDivision) {
    formattedOutput.push(formatSingleDivision(list, index, list.length, numOfItemsInOneDivision));
  }

  return formattedOutput;
}
