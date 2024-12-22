export function putColor(fromArray,toArray){
 const topColor = fromArray[fromArray.length-1];
 while(fromArray.length>0 && toArray.length<4 && fromArray[fromArray.length-1]===topColor){
   toArray.push(fromArray.pop());
 }
}