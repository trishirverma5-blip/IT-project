export class InteractionEngine{
  constructor(three,getSettings){this.three=three;this.getSettings=getSettings;this.reset();}
  reset(){this.prevCenter=null;this.prevDistance=null;this.prevAngle=null;this.grabAnchor=null;this.paused=false;}
  update(state,mode){
    const obj=this.three?.object;if(!obj||!state?.center||this.paused)return;
    const cfg=this.getSettings(),sens=Number(cfg.sensitivity??1),rot=Number(cfg.rotationSpeed??1),move=Number(cfg.movementSpeed??1),zoom=Number(cfg.zoomSpeed??1);
    if(state.fist){this.prevCenter=null;this.prevDistance=null;this.prevAngle=null;obj.userData.handControlled=false;return;}
    if(state.hands===2){
      const c=state.center,d=state.handDistance,a=state.handAngle;
      if(this.prevCenter){
        const dx=c.x-this.prevCenter.x,dy=c.y-this.prevCenter.y;
        if(state.bothPinch || mode==='grab'){obj.position.x-=dx*4.8*move*sens;obj.position.y-=dy*4.8*move*sens;}
        if(mode==='rotation'||mode==='free'){obj.rotation.y-=dx*4.2*rot;obj.rotation.x-=dy*4.2*rot;}
        if(mode==='zoom'||mode==='free'){if(this.prevDistance){const ratio=d/this.prevDistance;obj.scale.multiplyScalar(1+(ratio-1)*zoom*.75);obj.scale.clampScalar(.35,3.2);}}
        if(this.prevAngle!==null&&(mode==='free'||mode==='rotation')){let delta=a-this.prevAngle;if(delta>Math.PI)delta-=2*Math.PI;if(delta< -Math.PI)delta+=2*Math.PI;obj.rotation.z-=delta*rot;}
      }
      this.prevCenter=c;this.prevDistance=d;this.prevAngle=a;obj.userData.handControlled=true;return;
    }
    this.prevDistance=null;this.prevAngle=null;
    const c=state.center;
    if(state.pinch){
      if(this.prevCenter){const dx=c.x-this.prevCenter.x,dy=c.y-this.prevCenter.y;
        if(mode==='rotation'){obj.rotation.y-=dx*4.5*rot;obj.rotation.x-=dy*4.5*rot;}
        else{obj.position.x-=dx*4.8*move*sens;obj.position.y-=dy*4.8*move*sens;}
      }
      this.prevCenter=c;obj.userData.handControlled=true;return;
    }
    if(state.open||state.gesture==='POINTING'){
      if(this.prevCenter){const dx=c.x-this.prevCenter.x,dy=c.y-this.prevCenter.y;
        if(mode==='movement'){obj.position.x-=dx*4.8*move*sens;obj.position.y-=dy*4.8*move*sens;}
        else if(mode==='rotation'||mode==='free'){obj.rotation.y-=dx*4.5*rot;obj.rotation.x-=dy*4.5*rot;}
      }
      this.prevCenter=c;obj.userData.handControlled=true;
    }else{this.prevCenter=null;obj.userData.handControlled=false;}
  }
}
