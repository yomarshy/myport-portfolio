import * as THREE from './three.module.js';
import { FBXLoader } from './FBXLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { RoomEnvironment } from './RoomEnvironment.js';

const ACCENT = new THREE.Color('#ff9a1f');
const PAINT  = new THREE.Color('#4d86d0');

/* mesh name -> part id */
const MESH_IDS = {
  'Piggo_LP':'body','FrontSuspensionFork':'fork','HandlesGood!':'bars',
  'Front_Wheel':'fwheel','Rear_Wheel':'rwheel','RearSuspension':'rsus'
};

export class PiggoScene {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.parts = {};        // id -> {id, mesh|group, kind:'real'|'internal', base:Vector3(world), anchor:Vector3}
    this.mode = 'solid';    // solid | xray | explode
    this.focusSet = null;
    this.hover = null;
    this.onPick = opts.onPick || (()=>{});
    this.onHover = opts.onHover || (()=>{});
    this.internalDefs = opts.internals; this.explodeOffsets = opts.explode||{}; this.onFrame = opts.onFrame||null;
    this.pickable = null;   // optional filter fn(id)
    this._xr = 0;           // 0..1 animated xray amount
    this._ex = 0;           // 0..1 animated explode amount
    this.autoRotate = true;
    this.clock = new THREE.Clock();

    const r = this.renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.setClearColor(0x000000, 0);

    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.9;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 80);
    this.camera.position.set(4.6, 1.9, 4.2);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 1.2; this.controls.maxDistance = 9;
    this.controls.maxPolarAngle = Math.PI*0.52;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0.95, 0.15);
    this.controls.addEventListener('start', ()=>{ this.autoRotate=false; this._camTween=null; });

    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3,5,4); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x9cc4ff, 1.6); rim.position.set(-4,2.5,-3); this.scene.add(rim);

    this.root = new THREE.Group(); this.scene.add(this.root);
    this._buildFloor();

    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2(); this._down=null;
    canvas.addEventListener('pointermove', e=>this._move(e));
    canvas.addEventListener('pointerdown', e=>{ this._down={x:e.clientX,y:e.clientY,t:performance.now()}; });
    canvas.addEventListener('pointerup', e=>this._up(e));
    canvas.addEventListener('pointerleave', ()=>this._setHover(null));

    this._ro = new ResizeObserver(()=>this.resize()); this._ro.observe(canvas.parentElement || canvas);
    this.resize();
    this.visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es=>{this.visible=es[0].isIntersecting}).observe(canvas);
    this._loop = this._loop.bind(this); requestAnimationFrame(this._loop);
  }

  _buildFloor(){
    const c = document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d');
    const gr = g.createRadialGradient(128,128,0,128,128,128);
    gr.addColorStop(0,'rgba(0,0,0,0.55)'); gr.addColorStop(0.5,'rgba(0,0,0,0.22)'); gr.addColorStop(1,'rgba(0,0,0,0)');
    g.fillStyle=gr; g.fillRect(0,0,256,256);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
    m.rotation.x = -Math.PI/2; m.position.y = -0.065; m.scale.set(2.2,4.6,1);
    this.shadow = m; this.scene.add(m);
    // ring grid (floor reference)
    const ring = new THREE.Group();
    for (const [rad,op] of [[2.6,.22],[3.6,.12],[4.8,.06]]) {
      const pts=[]; for(let i=0;i<=128;i++){const a=i/128*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*rad,0,Math.sin(a)*rad));}
      ring.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color:0x8aa4c8, transparent:true, opacity:op})));
    }
    ring.position.y=-0.066; this.scene.add(ring); this.ring=ring;
  }

  async load(url, texBase){
    const mgr = new THREE.LoadingManager(); mgr.setURLModifier(u=>/\.fbx$/i.test(u)?u:'data:image/gif;base64,R0lGODlhAQABAAAAACw=');
    let obj;
    if(typeof url==='string' && !/\.fbx$/i.test(url)){ const bin=atob(url), buf=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i); obj = new FBXLoader(mgr).parse(buf.buffer,''); }
    else obj = await new Promise((res,rej)=> new FBXLoader(mgr).load(url,res,undefined,rej));
    const tl = new THREE.TextureLoader();
    const T = (f,srgb=false)=>{ const t=tl.load(texBase+f); t.colorSpace = srgb?THREE.SRGBColorSpace:THREE.NoColorSpace; t.anisotropy=8; return t; };
    const P = { map:T('piggo_albedo.jpg',true), normalMap:T('piggo_normal.jpg'), aoMap:T('piggo_ao.jpg'), emissiveMap:T('piggo_emit.jpg',true), metalMap:T('piggo_metal.jpg'), roughMap:T('piggo_rough.jpg') };
    const W = { map:T('wheels_albedo.jpg',true), normalMap:T('wheels_normal.jpg'), metalMap:T('wheels_metal.jpg'), roughMap:T('wheels_rough.jpg') };
    const mk = (S,trans)=> new THREE.MeshStandardMaterial({
      map:S.map, normalMap:S.normalMap, aoMap:S.aoMap||null, emissiveMap:S.emissiveMap||null,
      emissive: S.emissiveMap? 0xffffff : 0x000000, emissiveIntensity: 1.2,
      metalnessMap:S.metalMap, metalness:1, roughnessMap:S.roughMap, roughness:1, transparent:trans, alphaTest:trans?0.05:0
    });
    this.root.add(obj);
    obj.updateMatrixWorld(true);
    obj.traverse(m=>{
      if(!m.isMesh) return;
      const id = MESH_IDS[m.name]; if(!id) return;
      const isWheel = /Wheel/.test(m.name);
      m.material = mk(isWheel?W:P, isWheel);
      m.userData.solidMat = m.material;
      m.userData.partId = id;
      m.geometry.computeBoundingBox();
      if(!m.geometry.attributes.uv1 && m.geometry.attributes.uv) m.geometry.setAttribute('uv1', m.geometry.attributes.uv);
      const wb = new THREE.Box3().setFromObject(m);
      // body bbox includes children; compute from geometry for body
      const gb = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
      const box = id==='body' ? gb : wb;
      const base = new THREE.Vector3(); m.getWorldPosition(base);
      this.parts[id] = { id, kind:'real', node:m, base, box, anchor: box.getCenter(new THREE.Vector3()) };
      // xray overlay
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 28), new THREE.LineBasicMaterial({color:0x9fd0ff, transparent:true, opacity:0, depthWrite:false}));
      m.add(edges); m.userData.edges = edges;
      m.userData.xray = new THREE.ShaderMaterial({
        transparent:true, depthWrite:false, side:THREE.DoubleSide,
        uniforms:{ uColor:{value:new THREE.Color('#7fb4ff')}, uAmt:{value:1}, uHi:{value:0} },
        vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,
        fragmentShader:`uniform vec3 uColor; uniform float uAmt; uniform float uHi; varying vec3 vN; varying vec3 vV;
          void main(){ float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2); vec3 c=mix(uColor, vec3(1.,.6,.12), uHi); float a=(f*.55+.035)*uAmt + uHi*(.18+f*.4); gl_FragColor=vec4(c,a); }`
      });
    });
    this.obj = obj;
    this._buildInternals();
    this._frame();
    this.setMode('solid', true);
    return this;
  }

  _frame(){ /* nothing yet */ }

  /* ---- internal components (illustrative proxies) ---- */
  _buildInternals(){
    const defs = this.internalDefs;
    if(!defs) return;
    const grp = this.internals = new THREE.Group(); this.root.add(grp);
    for (const d of defs){
      const g = new THREE.Group(); g.name = d.id;
      const mat = new THREE.MeshStandardMaterial({ color:d.color||0x2a2f38, metalness:d.metal??0.6, roughness:d.rough??0.45, emissive:new THREE.Color(d.emissive||0x000000), emissiveIntensity:d.ei??0.5, transparent:true, opacity:0 });
      const mats=[mat];
      const meshes = d.build(THREE, mat);
      meshes.forEach(m=>{ m.userData.partId=d.id; if(m.userData.color!==undefined){ const c=mat.clone(); c.color.set(m.userData.color); if(m.userData.emissive!==undefined) c.emissive.set(m.userData.emissive); m.material=c; mats.push(c);} g.add(m); });
      const wire = new THREE.LineBasicMaterial({color:ACCENT, transparent:true, opacity:0});
      g.traverse(m=>{ if(m.isMesh){ m.userData.partId=d.id; const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,35), wire.clone()); e.userData.isEdge=true; m.add(e);} });
      mats.forEach(c=>c.userData.ei=d.ei??0.5); g.userData.mats = mats;
      g.visible=false; grp.add(g);
      g.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g);
      this.parts[d.id] = { id:d.id, kind:'internal', node:g, base:g.position.clone(), box, anchor: d.anchor? new THREE.Vector3(...d.anchor): box.getCenter(new THREE.Vector3()), explode:d.explode||[0,-0.6,0] };
    }
  }

  setMode(mode, instant){
    this.mode = mode; this._modeSet = true;
    if(instant){ this._xr = mode==='xray'?1:0; this._ex = mode==='explode'?1:0; }
  }
  setFocus(ids){ this.focusSet = ids ? [].concat(ids) : null; }
  setHighlightSet(ids){ this.hiSet = ids; }

  flyTo(pos, target, ms=1100){
    this._camTween = { t0:performance.now(), ms, p0:this.camera.position.clone(), t0v:this.controls.target.clone(), p1:new THREE.Vector3(...pos), t1:new THREE.Vector3(...target) };
    this.autoRotate=false;
  }
  flyToPart(id){
    const p = this.parts[id]; if(!p) return;
    const c = p.anchor.clone().add(p.cur||new THREE.Vector3()), size = p.box.getSize(new THREE.Vector3()).length();
    const d = Math.max(2.1, size*1.55);
    const dir = new THREE.Vector3(0.92,0.32,0.55).normalize();
    this.flyTo([c.x+dir.x*d, c.y+dir.y*d, c.z+dir.z*d],[c.x,c.y,c.z]);
  }
  home(){ this.flyTo([4.6,1.9,4.2],[0,0.95,0.15]); }

  resize(){
    const el = this.canvas.parentElement||this.canvas; const w=el.clientWidth||300, h=el.clientHeight||300;
    this.renderer.setSize(w,h,false); this.camera.aspect=w/h;
    this.camera.fov = w/h < 0.9 ? 46 : 32;
    this._w=w; this._h=h; this._applyShift(true);
  }

  setShift(frac){ this.shiftTarget = frac; }
  _applyShift(force){
    const w=this._w||1,h=this._h||1; const want = (w/h<1.1)?0:(this.shiftTarget||0);
    if(!force && Math.abs((this.shift||0)-want)<0.0005) return;
    this.shift = force? want : (this.shift||0)+(want-(this.shift||0))*0.08;
    this.camera.setViewOffset(w,h,-this.shift*w,0,w,h); this.camera.updateProjectionMatrix();
  }

  /* ---- picking ---- */
  _pickables(){
    const out=[]; for(const p of Object.values(this.parts)){
      if(this.pickable && !this.pickable(p.id)) continue;
      if(p.kind==='internal' && this._xr<0.4 && this._ex<0.4) continue;
      p.node.traverse(m=>{ if(m.isMesh) out.push(m); });
    } return out;
  }
  _pick(e){
    const r=this.canvas.getBoundingClientRect(); this.ptr.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
    this.ray.setFromCamera(this.ptr,this.camera);
    const hits=this.ray.intersectObjects(this._pickables(),false);
    // prefer internal parts when xray (they sit inside the shell)
    let best=null;
    for(const h of hits){ const id=h.object.userData.partId; if(!id) continue; if(this.parts[id].kind==='internal' && this._xr>0.4){best=id;break;} if(!best) best=id; }
    return best;
  }
  _move(e){ if(e.pointerType==='touch') return; this._setHover(this._pick(e)); }
  _setHover(id){ if(id!==this.hover){ this.hover=id; this.canvas.style.cursor=id?'pointer':'grab'; this.onHover(id);} }
  _up(e){ if(!this._down) return; const d=Math.hypot(e.clientX-this._down.x,e.clientY-this._down.y); this._down=null; if(d<6){ const id=this._pick(e); this.onPick(id); } }

  /* world->screen for hotspots */
  project(id, off){
    const p=this.parts[id]; if(!p) return null;
    const v=p.anchor.clone(); if(p.node && p.cur) v.add(p.cur);
    const w=this.canvas.clientWidth, h=this.canvas.clientHeight;
    const n=v.clone().project(this.camera);
    return { x:(n.x*0.5+0.5)*w, y:(-n.y*0.5+0.5)*h, z:n.z, behind:n.z>1 };
  }

  _apply(dt, time){
    const k = 1-Math.pow(0.0015, dt);
    const txr = this.mode==='xray'?1:0, tex = this.mode==='explode'?1:0;
    this._xr += (txr-this._xr)*k; this._ex += (tex-this._ex)*k;
    const xr=this._xr, ex=this._ex, showInt = Math.max(xr,ex);
    const EX = this.explodeOffsets||{};
    for(const p of Object.values(this.parts)){
      const f = this.focusSet, isF = !!(f && f.includes(p.id)), isH = this.hover===p.id || (this.hiSet && this.hiSet.includes(p.id));
      const dim = (f && !isF) ? 0.14 : 1;
      // explode offset
      const off = new THREE.Vector3(...(p.kind==='real' ? (EX[p.id]||[0,0,0]) : p.explode)).multiplyScalar(ex);
      p.cur = p.cur||new THREE.Vector3(); p.cur.copy(off);
      if(p.kind==='real'){
        const m=p.node; const target = p.base.clone().add(off);
        m.parent.worldToLocal(target); m.position.copy(target);
        // material blend: solid <-> xray
        const solid=m.userData.solidMat, xm=m.userData.xray;
        if(xr>0.02){ m.material = xm; xm.uniforms.uAmt.value = xr*dim; xm.uniforms.uHi.value = isF?1:(isH?0.6:0); }
        else { m.material = solid; const wheel=solid.alphaTest>0; solid.transparent = wheel || dim<1; solid.depthWrite = dim>=1; solid.opacity = dim; }
        m.userData.edges.material.opacity = xr*0.42*(f && !isF? 0.3:1) + (isF?0.5*xr:0);
        m.userData.edges.material.color.set(isF?ACCENT:new THREE.Color(0x9fd0ff));
      } else {
        const g=p.node; g.visible = showInt>0.02;
        g.position.copy(p.base).add(off);
        const pulse = isF? 0.55+0.35*Math.sin(time*4):0;
        for(const mat of g.userData.mats){ mat.opacity = Math.min(1,showInt*1.4)*(f&&!isF?0.22:1); mat.emissiveIntensity = mat.userData.ei*0.45 + (isF?0.8:0) + (isH?0.5:0) + pulse*0.5; }
        g.traverse(m=>{ if(m.userData.isEdge) m.material.opacity = showInt*(isF||isH?0.9:0.35); });
      }
    }
    this.shadow.material.opacity = 1 - ex*0.6;
  }

  _loop(){
    requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 0.05), time=this.clock.elapsedTime;
    if(!this.visible || !this.obj) return;
    if(this._camTween){ const t=Math.min(1,(performance.now()-this._camTween.t0)/this._camTween.ms), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      this.camera.position.lerpVectors(this._camTween.p0,this._camTween.p1,e); this.controls.target.lerpVectors(this._camTween.t0v,this._camTween.t1,e); if(t>=1) this._camTween=null; }
    else if(this.autoRotate){ const off=this.camera.position.clone().sub(this.controls.target); off.applyAxisAngle(new THREE.Vector3(0,1,0), dt*0.22); this.camera.position.copy(this.controls.target).add(off); }
    this.controls.update();
    this._applyShift();
    this._apply(dt,time);
    this.ring.rotation.y += dt*0.02;
    if(this.onFrame) this.onFrame();
    this.renderer.render(this.scene,this.camera);
  }
}
