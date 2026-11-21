import {ThreeEngine} from './threeEngine.js';
import {CameraController} from './camera.js';
import {HandTracker} from './handTracking.js';
import {recognizeGestures} from './gestureRecognition.js';
import {InteractionEngine} from './interactionEngine.js';
import {SettingsStore} from './settings.js';

const $=id=>document.getElementById(id),toast=msg=>{const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3000);};
const settings=new SettingsStore();let mode='free',tracker=null,tracking=false;
const viewport=$('threeViewport');let three;
try{three=new ThreeEngine(viewport,fps=>$('fpsLabel').textContent=fps+' FPS');$('loadingOverlay').classList.add('hide');}
catch(e){$('appStatus').textContent='WEBGL ERROR';toast('WebGL initialization failed. Try a modern browser.');console.error(e);}
const camera=new CameraController($('cameraVideo')),interaction=three?new InteractionEngine(three,()=>settings.get()):null;

function setEngineStatus(active,label){$('appDot').classList.toggle('muted',!active);$('appStatus').textContent=label;}
function updateObjectInfo(){if(!three?.object)return;const p=three.object.position;$('positionValue').textContent=`X ${p.x.toFixed(2)} · Y ${p.y.toFixed(2)} · Z ${p.z.toFixed(2)}`;$('selectedValue').textContent=three.objectName;$('objectLabel').textContent=three.objectName.toUpperCase();}
function drawLandmarks(hands){
 const canvas=$('landmarkCanvas'),ctx=canvas.getContext('2d'),video=$('cameraVideo');canvas.width=video.videoWidth||640;canvas.height=video.videoHeight||480;ctx.clearRect(0,0,canvas.width,canvas.height);
 if(!settings.get().landmarks||!hands?.length)return;
 const edges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
 for(const hand of hands){ctx.strokeStyle='#79dff5';ctx.lineWidth=2;for(const [a,b] of edges){ctx.beginPath();ctx.moveTo(hand[a].x*canvas.width,hand[a].y*canvas.height);ctx.lineTo(hand[b].x*canvas.width,hand[b].y*canvas.height);ctx.stroke();}for(const point of hand){ctx.beginPath();ctx.arc(point.x*canvas.width,point.y*canvas.height,3,0,Math.PI*2);ctx.fillStyle='#a8baff';ctx.fill();}}
}
function onResults(result){
 const hands=result.landmarks||[],state=recognizeGestures(hands);drawLandmarks(hands);
 $('handCount').textContent=state.hands+' HAND'+(state.hands===1?'':'S');$('confidenceValue').textContent=state.hands?Math.round(state.confidence*100)+'%':'—';
 $('trackingFps').textContent=(tracker?.fps||'--')+' FPS';$('trackingValue').textContent=state.hands?'ACTIVE':'SEARCHING';$('trackingHint').textContent=state.hands?'Hand landmarks detected':'Show one or both hands to camera';
 $('gestureValue').textContent=state.gesture==='NONE'?'—':state.gesture;$('gestureHint').textContent=state.hands?'Gesture input received':'No hand detected';
 if(state.hands)interaction?.update(state,mode);else interaction?.reset();updateObjectInfo();
}
async function refreshCameras(){
 try{const devices=await camera.listDevices(),select=$('cameraSelect'),previous=select.value;select.innerHTML='<option value="">Default camera</option>';devices.forEach((d,i)=>{const opt=document.createElement('option');opt.value=d.deviceId;opt.textContent=d.label||`Camera ${i+1}`;select.appendChild(opt);});if([...select.options].some(o=>o.value===previous))select.value=previous;}catch(e){console.warn(e);}
}
async function startCamera(){
 try{$('cameraBtn').disabled=true;$('cameraBtn').textContent='Starting…';await camera.start($('cameraSelect').value);$('cameraPlaceholder').style.display='none';$('cameraTag').textContent='LIVE CAMERA';$('cameraDot').classList.remove('muted');$('cameraStatus').textContent='CAMERA ON';$('trackingBtn').disabled=false;$('cameraBtn').textContent='Stop camera';$('cameraBtn').disabled=false;await refreshCameras();toast('Camera connected. Now enable tracking.');}
 catch(e){$('cameraBtn').disabled=false;$('cameraBtn').textContent='Start camera';const msg=e.name==='NotAllowedError'?'Camera permission denied. Allow camera access in browser settings.':e.name==='NotFoundError'?'No camera was found on this device.':e.message||'Unable to access camera.';toast(msg);console.error(e);}
}
function stopCamera(){
 tracker?.close();tracker=null;tracking=false;camera.stop();$('cameraPlaceholder').style.display='flex';$('cameraTag').textContent='NO SIGNAL';$('cameraDot').classList.add('muted');$('cameraStatus').textContent='CAMERA OFF';$('cameraBtn').textContent='Start camera';$('trackingBtn').textContent='Enable tracking';$('trackingBtn').disabled=true;$('cameraBtn').disabled=false;$('trackingValue').textContent='STANDBY';$('trackingHint').textContent='Waiting for camera';$('handCount').textContent='0 HANDS';$('gestureValue').textContent='—';$('landmarkCanvas').getContext('2d').clearRect(0,0,$('landmarkCanvas').width,$('landmarkCanvas').height);interaction?.reset();setEngineStatus(true,'ENGINE READY');toast('Camera stopped.');
}
$('cameraBtn').onclick=()=>camera.active?stopCamera():startCamera();
$('cameraSelect').onchange=async()=>{if(camera.active){const device=$('cameraSelect').value;stopCamera();await startCamera();$('cameraSelect').value=device;}};
$('trackingBtn').onclick=async()=>{
 if(tracking){tracker?.stop();tracking=false;$('trackingBtn').textContent='Enable tracking';$('trackingValue').textContent='PAUSED';$('trackingHint').textContent='Tracking paused';setEngineStatus(true,'TRACKING PAUSED');interaction?.reset();return;}
 try{$('trackingBtn').textContent='Loading AI…';tracker=new HandTracker($('cameraVideo'),onResults,Number(settings.get().trackingConfidence));await tracker.init();tracker.start();tracking=true;$('trackingBtn').textContent='Pause tracking';setEngineStatus(true,'AI TRACKING ACTIVE');toast('Hand tracking active. Raise your hand.');}
 catch(e){tracker?.close();tracker=null;$('trackingBtn').textContent='Retry tracking';toast('MediaPipe could not load. Check internet and retry.');console.error(e);}
};
document.querySelectorAll('[data-object]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-object]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');three?.createObject(btn.dataset.object);interaction?.reset();updateObjectInfo();});
document.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');mode=btn.dataset.mode;interaction?.reset();toast('Mode: '+mode);});
$('resetObjectBtn').onclick=()=>{three?.resetObject();interaction?.reset();updateObjectInfo();};$('resetCameraBtn').onclick=()=>three?.resetCamera();
$('fullscreenBtn').onclick=()=>!document.fullscreenElement?document.documentElement.requestFullscreen?.():document.exitFullscreen?.();
$('helpBtn').onclick=()=>$('helpModal').classList.remove('hidden');$('closeHelp').onclick=()=>$('helpModal').classList.add('hidden');
$('settingsBtn').onclick=()=>$('settingsModal').classList.remove('hidden');$('closeSettings').onclick=()=>$('settingsModal').classList.add('hidden');
$('colorPicker').oninput=e=>three?.setColor(e.target.value);$('scaleSlider').oninput=e=>three?.setScale(Number(e.target.value));
$('materialSelect').onchange=e=>three?.setMaterial(e.target.value);
$('sensitivitySlider').oninput=e=>settings.set('sensitivity',Number(e.target.value));
$('particlesToggle').onchange=e=>{three?.setParticles(e.target.checked);settings.set('particles',e.target.checked);};
$('mirrorToggle').onchange=e=>{settings.set('mirror',e.target.checked);$('cameraVideo').style.transform=e.target.checked?'scaleX(-1)':'none';$('landmarkCanvas').style.transform=e.target.checked?'scaleX(-1)':'none';};
$('landmarksToggle').onchange=e=>settings.set('landmarks',e.target.checked);
['rotationSpeed','movementSpeed','zoomSpeed','glassIntensity','trackingConfidence'].forEach(id=>$(id).oninput=e=>settings.set(id,Number(e.target.value)));
$('modelInput').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{await three.loadModel(file);updateObjectInfo();toast('3D model imported successfully.');}catch(err){toast('Invalid model. Prefer a .glb file.');console.error(err);}e.target.value='';};
window.addEventListener('beforeunload',()=>{tracker?.close();camera.stop();three?.dispose();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('helpModal').classList.add('hidden');$('settingsModal').classList.add('hidden');}});
$('cameraVideo').addEventListener('loadedmetadata',()=>{if(!settings.get().mirror){$('cameraVideo').style.transform='none';$('landmarkCanvas').style.transform='none';}});
const saved=settings.get();$('mirrorToggle').checked=saved.mirror;$('landmarksToggle').checked=saved.landmarks;$('particlesToggle').checked=saved.particles;$('sensitivitySlider').value=saved.sensitivity;
['rotationSpeed','movementSpeed','zoomSpeed','glassIntensity','trackingConfidence'].forEach(id=>{if($(id))$(id).value=saved[id]??$(id).value;});
$('cameraVideo').style.transform=saved.mirror?'scaleX(-1)':'none';$('landmarkCanvas').style.transform=saved.mirror?'scaleX(-1)':'none';
three?.setParticles(saved.particles);updateObjectInfo();
