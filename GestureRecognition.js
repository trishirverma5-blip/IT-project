const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function classify(points){
  const wrist=points[0],tipIds=[8,12,16,20],pipIds=[6,10,14,18];
  const extended=tipIds.map((id,i)=>distance(points[id],wrist)>distance(points[pipIds[i]],wrist)*1.10);
  const thumb=distance(points[4],points[5])>distance(points[3],points[5])*1.04;
  const count=extended.filter(Boolean).length+(thumb?1:0);
  const pinch=distance(points[4],points[8])<.060;
  const center={x:(points[0].x+points[5].x+points[9].x+points[13].x+points[17].x)/5,y:(points[0].y+points[5].y+points[9].y+points[13].y+points[17].y)/5};
  let gesture='OPEN PALM';
  if(pinch)gesture='PINCH';
  else if(count<=1)gesture='FIST';
  else if(extended[0]&&!extended[1]&&!extended[2]&&!extended[3])gesture='POINTING';
  return {gesture,pinch,open:count>=4,fist:count<=1,center,points};
}
export function recognizeGestures(landmarks){
  if(!landmarks?.length)return {gesture:'NONE',hands:0,confidence:0,center:null,pinch:false,open:false,fist:false,handDistance:null};
  const hands=landmarks.slice(0,2).map(classify);
  if(hands.length===2){
    const center={x:(hands[0].center.x+hands[1].center.x)/2,y:(hands[0].center.y+hands[1].center.y)/2};
    const bothPinch=hands.every(h=>h.pinch);
    return {gesture:bothPinch?'TWO-HAND GRAB':'TWO HANDS',hands:2,confidence:.9,center,pinch:hands.some(h=>h.pinch),bothPinch,open:hands.every(h=>h.open),fist:hands.every(h=>h.fist),handDistance:distance(hands[0].center,hands[1].center),handAngle:Math.atan2(hands[1].center.y-hands[0].center.y,hands[1].center.x-hands[0].center.x),handData:hands};
  }
  return {...hands[0],hands:1,confidence:.9,handDistance:null,handAngle:null,handData:hands};
}
