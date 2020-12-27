const async = require('async');

function checkDuplicate(list, id) {
  let bDuplicate = false;

  if (list === undefined) return false;

  if (list.length >= 1) {
    bDuplicate = list.some(
      _list => _list.equals(id)
    );
  }

  return bDuplicate;
}

// <note> list entry contains the object ID
function addUserToList(list, user_id) {
  // 1. check if there is any duplicate
  if (list === undefined || checkDuplicate(list, user_id) === true) return;

  list.push(user_id);

  console.warn(`addUserToList: length of list = ${list.length}`);
}

// <note> list entry contains the object ID
function removeUserFromList(list, user_id) {
  if (list === undefined) return;

  list = list.filter(_objId => _objId.equals(user_id) === false);

  console.warn(`removeUserFromList: length of list = ${list.length}`);
}

module.exports = {
  addUserToList,
  removeUserFromList
};
