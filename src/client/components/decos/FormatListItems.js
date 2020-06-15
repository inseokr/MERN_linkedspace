import React from 'react';

export default function FormatListItems(list, numOfItemsInOneDivision)
{
  let formatedOutput = [];

  function formatSingleDivision(list, index, length)
  {
    let items = []
    let count = 0;

    for(let curIndex = index; curIndex < length && count < numOfItemsInOneDivision; curIndex++, count++)
    {
      items.push(<li>{list[curIndex]}</li>)
    }

    let singleDivisionFormatedOutput = <div className="col-4" style={{paddingTop:"8px"}}>
              <ul>
              {items}
              </ul>
             </div>
    return singleDivisionFormatedOutput 
  } 
 
  for (let index=0; index<list.length; index = (index + numOfItemsInOneDivision))
  {
    formatedOutput.push(formatSingleDivision(list, index, list.length, numOfItemsInOneDivision))
  }

  return formatedOutput
}



