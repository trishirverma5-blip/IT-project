import {FilesetResolver,HandLandmarker} from '@mediapipe/tasks-vision';
export class HandTracker{
  constructor(video,onResults,confidence=.55){this.video=video;this.onResults=onResults;this.confidence=confidence;this.landmarker=null;this.running=false;this.lastVideoTime=-1;this.frames=0;this.lastFps=performance.now();}
  async init(){
    const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    this.landmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:2,minHandDetectionConfidence:this.confidence,minHandPresenceConfidence:this.confidence,minTrackingConfidence:this.confidence});
  }
  start(){if(!this.landmarker)throw new Error('Hand tracking model is not initialized.');this.running=true;this.loop();}
  loop=()=>{if(!this.running)return;if(this.video.readyState>=2&&this.video.currentTime!==this.lastVideoTime){this.lastVideoTime=this.video.currentTime;try{const result=this.landmarker.detectForVideo(this.video,performance.now());this.onResults(result);}catch(error){console.warn('MediaPipe frame error',error);}this.frames++;const now=performance.now();if(now-this.lastFps>=1000){this.fps=Math.round(this.frames*1000/(now-this.lastFps));this.frames=0;this.lastFps=now;}}this.raf=requestAnimationFrame(this.loop);};
  stop(){this.running=false;cancelAnimationFrame(this.raf);}
  close(){this.stop();this.landmarker?.close();this.landmarker=null;}
}
