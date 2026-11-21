const defaults={sensitivity:1,rotationSpeed:1,movementSpeed:1,zoomSpeed:1,glassIntensity:.72,mirror:true,landmarks:true,particles:true,trackingConfidence:.55};
export class SettingsStore{
  constructor(){try{this.values={...defaults,...JSON.parse(localStorage.getItem('airGestureSettings')||'{}')};}catch{this.values={...defaults};}}
  get(){return this.values;}
  set(key,value){this.values[key]=value;try{localStorage.setItem('airGestureSettings',JSON.stringify(this.values));}catch(e){console.warn('Could not persist settings',e);}}
}
