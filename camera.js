export class CameraController{
  constructor(video){this.video=video;this.stream=null;}
  async listDevices(){if(!navigator.mediaDevices?.enumerateDevices)return [];return (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');}
  async start(deviceId){if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera API unavailable. Open this app on HTTPS or localhost.');this.stop();const video={width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30,max:30}};if(deviceId)video.deviceId={exact:deviceId};this.stream=await navigator.mediaDevices.getUserMedia({audio:false,video});this.video.srcObject=this.stream;await this.video.play();return this.stream;}
  stop(){if(this.stream)this.stream.getTracks().forEach(track=>track.stop());this.stream=null;this.video.srcObject=null;}
  get active(){return !!this.stream;}
}
