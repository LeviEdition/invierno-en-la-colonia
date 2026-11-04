const positions={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};
export function dieFace(value){return {value,pips:positions[value]&&Number.isInteger(value)?positions[value]:null,label:String(value)};}
