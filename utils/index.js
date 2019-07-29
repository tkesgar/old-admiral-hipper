function stringToArray(str) {
  return str.split(',')
    .map(s => s.trim())
    .filter(s => s)
}

exports.stringToArray = stringToArray

function arrayToString(arr) {
  return arr.filter(e => e).join(',')
}

exports.arrayToString = arrayToString
