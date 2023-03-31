/// reference: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function rgb(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
  
/// reference: https://stackoverflow.com/questions/6367010/average-2-hex-colors-together-in-javascript 
export function blendColors(colorA, colorB, proportion) {
  const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
  const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
  const r = Math.round(rA + (rB - rA) * proportion).toString(16).padStart(2, '0');
  const g = Math.round(gA + (gB - gA) * proportion).toString(16).padStart(2, '0');
  const b = Math.round(bA + (bB - bA) * proportion).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}

export function twoLevelCopyArr(array) {
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
    newArray.push(array[i].slice());
  }
  return newArray;
}

export function arePointsEqual(pt1, pt2) {
  return pt1[0] === pt2[0] && pt1[1] == pt2[1];
}

/// reference: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
export function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/// reference: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers 
export function mapRange (number, inMin, inMax, outMin, outMax) {
  return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/// reference: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}