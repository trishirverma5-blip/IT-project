import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ThreeEngine {
  constructor(container,onFps){
    this.container=container;this.onFps=onFps;this.clock=new THREE.Clock();this.frames=0;this.lastFps=performance.now();this.materialPreset='metallic';
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.1,100);this.camera.position.set(0,0,6);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));this.renderer.setSize(container.clientWidth,container.clientHeight);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
    container.appendChild(this.renderer.domElement);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.07;
    this.scene.add(new THREE.HemisphereLight(0xc9dcff,0x17182e,2));
    const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(3,4,5);this.scene.add(key);
    const rim=new THREE.PointLight(0x638cff,22,12);rim.position.set(-3,1,2);this.scene.add(rim);
    const violet=new THREE.PointLight(0x8a5cff,16,10);violet.position.set(3,-2,-2);this.scene.add(violet);
    const grid=new THREE.GridHelper(14,28,0x34518b,0x1c2b4a);grid.position.y=-1.55;grid.material.transparent=true;grid.material.opacity=.24;this.scene.add(grid);
    this.particles=this.makeParticles();this.scene.add(this.particles);
    this.object=null;this.objectName='Metallic sphere';this.baseScale=1;this.createObject('sphere');
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.animate();
  }
  makeParticles(){const n=220,positions=new Float32Array(n*3);for(let i=0;i<n;i++){positions[i*3]=(Math.random()-.5)*12;positions[i*3+1]=(Math.random()-.5)*7;positions[i*3+2]=(Math.random()-.5)*7;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(positions,3));return new THREE.Points(g,new THREE.PointsMaterial({color:0x8baaff,size:.018,transparent:true,opacity:.45}));}
  makeMaterial(preset,color=0x6e9cff){
    if(preset==='glass')return new THREE.MeshPhysicalMaterial({color,metalness:.04,roughness:.06,transmission:.88,thickness:1.1,transparent:true,opacity:.96,ior:1.35,clearcoat:1});
    if(preset==='matte')return new THREE.MeshStandardMaterial({color,metalness:.08,roughness:.72});
    if(preset==='holographic')return new THREE.MeshPhysicalMaterial({color:0x91baff,metalness:.65,roughness:.18,iridescence:1,iridescenceIOR:1.4,clearcoat:1});
    return new THREE.MeshPhysicalMaterial({color,metalness:.88,roughness:.2,clearcoat:1,clearcoatRoughness:.12});
  }
  disposeObject(obj){obj?.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});}
  createObject(kind='sphere'){
    if(this.object){this.scene.remove(this.object);this.disposeObject(this.object);}
    let g;switch(kind){case'cube':g=new THREE.BoxGeometry(1.7,1.7,1.7,2,2,2);break;case'torus':g=new THREE.TorusGeometry(1,.38,32,100);break;case'knot':g=new THREE.TorusKnotGeometry(.9,.28,160,24);break;case'cylinder':g=new THREE.CylinderGeometry(.8,.8,1.8,64);break;case'cone':g=new THREE.ConeGeometry(1,1.9,64);break;case'icosahedron':g=new THREE.IcosahedronGeometry(1.25,1);break;case'dodecahedron':g=new THREE.DodecahedronGeometry(1.25,0);break;default:g=new THREE.SphereGeometry(1.2,64,64);}
    this.object=new THREE.Mesh(g,this.makeMaterial(kind==='glass'?'glass':this.materialPreset));this.object.castShadow=true;this.scene.add(this.object);
    this.objectName=kind==='glass'?'Glass sphere':kind.charAt(0).toUpperCase()+kind.slice(1);this.resetObject();
  }
  async loadModel(file){const url=URL.createObjectURL(file);try{const gltf=await new GLTFLoader().loadAsync(url);if(this.object){this.scene.remove(this.object);this.disposeObject(this.object);}this.object=gltf.scene;this.objectName=file.name;const box=new THREE.Box3().setFromObject(this.object);const size=box.getSize(new THREE.Vector3());const max=Math.max(size.x,size.y,size.z)||1;this.object.scale.setScalar(2.2/max);this.object.position.set(0,0,0);this.scene.add(this.object);this.baseScale=1;this.resetObject();}finally{URL.revokeObjectURL(url);}}
  setColor(color){this.object?.traverse(o=>{if(o.isMesh&&o.material&&o.material.color){o.material.color.set(color);o.material.needsUpdate=true;}});}
  setMaterial(preset){this.materialPreset=preset;this.object?.traverse(o=>{if(o.isMesh){const old=o.material;const color=old?.color?.clone()||new THREE.Color(0x6e9cff);o.material=this.makeMaterial(preset,color);if(old&&!Array.isArray(old))old.dispose();}});}
  setScale(s){if(this.object)this.object.scale.setScalar(s);}
  resetObject(){if(!this.object)return;this.object.position.set(0,0,0);this.object.rotation.set(.2,.35,0);this.object.scale.setScalar(1);this.baseScale=1;}
  resetCamera(){this.camera.position.set(0,0,6);this.controls.target.set(0,0,0);this.controls.update();}
  setParticles(on){this.particles.visible=on;}
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
  animate=()=>{this.raf=requestAnimationFrame(this.animate);const dt=Math.min(this.clock.getDelta(),.05);this.controls.update();if(this.object&&!this.object.userData.handControlled)this.object.rotation.y+=dt*.055;this.particles.rotation.y+=dt*.012;this.renderer.render(this.scene,this.camera);this.frames++;const now=performance.now();if(now-this.lastFps>1000){this.onFps?.(Math.round(this.frames*1000/(now-this.lastFps)));this.frames=0;this.lastFps=now;}};
  dispose(){cancelAnimationFrame(this.raf);this.resizeObserver?.disconnect();if(this.object)this.disposeObject(this.object);this.particles.geometry.dispose();this.particles.material.dispose();this.renderer.dispose();}
}
