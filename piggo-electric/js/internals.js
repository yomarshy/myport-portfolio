/* Illustrative internal components. The source model is a closed shell, so these are
   modelled proxies placed where each unit normally sits on an electric scooter. */
const box=(T,mat,w,h,d,x,y,z,o={})=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);Object.assign(m.userData,o);return m;};
const cyl=(T,mat,r,l,x,y,z,axis='x',o={},seg=36)=>{const g=new T.CylinderGeometry(r,r,l,seg);if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);const m=new T.Mesh(g,mat);m.position.set(x,y,z);Object.assign(m.userData,o);return m;};
const tube=(T,mat,pts,r,o={})=>{const c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(c,48,r,8,false),mat);Object.assign(m.userData,o);return m;};

export const INTERNALS=[
 {id:'battery',color:0x1c2a44,metal:.4,rough:.5,emissive:0xff8a00,ei:.35,anchor:[0,.74,-.5],explode:[0,1.25,0],
  build:(T,m)=>{const a=[box(T,m,.38,.34,.82,0,.72,-.5)];for(let i=0;i<8;i++)a.push(box(T,m,.34,.04,.7,0,.58+i*.04+.02+0,-.5,{color:0x2e4670,emissive:0xff7a00}));a.push(box(T,m,.1,.05,.1,0,.92,-.2,{color:0x111111}));return a.slice(0,1).concat(a.slice(1).map(x=>{x.position.y=.58+((x.position.y-.58)/.04|0)*.04+0.0;return x}));}},
 {id:'bms',color:0x0f3b2e,metal:.2,rough:.6,emissive:0x22ff99,ei:.4,anchor:[0,.74,.02],explode:[.95,.85,0],
  build:(T,m)=>[box(T,m,.2,.14,.07,0,.74,.02),box(T,m,.14,.02,.05,0,.82,.02,{color:0xc9a227,emissive:0x000000})]},
 {id:'motor',color:0x8a919c,metal:.9,rough:.3,emissive:0xff7a00,ei:.25,anchor:[0,.33,-1.06],explode:[.95,0,0],
  build:(T,m)=>[cyl(T,m,.2,.17,0,.33,-1.06),cyl(T,m,.045,.42,0,.33,-1.06,'x',{color:0x555b66}),
    ...[-1,1].map(s=>{const t=new T.Mesh(new T.TorusGeometry(.14,.032,12,36),m);t.rotation.y=Math.PI/2;t.position.set(s*.105,.33,-1.06);t.userData.color=0xd2813a;t.userData.emissive=0x663300;return t;})]},
 {id:'controller',color:0x20242c,metal:.7,rough:.35,emissive:0xff6a00,ei:.35,anchor:[0,.95,.62],explode:[0,.75,.55],
  build:(T,m)=>{const a=[box(T,m,.24,.22,.13,0,.95,.62)];for(let i=0;i<5;i++)a.push(box(T,m,.26,.012,.1,0,.86+i*.04,.62,{color:0x6b727e}));return a;}},
 {id:'port',color:0x2b2f38,metal:.6,rough:.4,emissive:0x44aaff,ei:.5,anchor:[0,.93,-1.43],explode:[0,.7,-.85],
  build:(T,m)=>[cyl(T,m,.065,.1,0,.93,-1.43,'z'),cyl(T,m,.035,.12,0,.93,-1.43,'z',{color:0x0a0a0a,emissive:0x2266aa})]},
 {id:'brakes',color:0xb9bfc9,metal:.9,rough:.3,emissive:0xff3b1f,ei:.3,anchor:[.11,.55,1.58],explode:[.95,.25,0],
  build:(T,m)=>[box(T,m,.06,.09,.13,.12,.5,1.6,{color:0xc9482a}),box(T,m,.06,.09,.13,.12,.5,-1.24,{color:0xc9482a}),
    tube(T,m,[[.3,1.48,.9],[.2,1.1,.95],[.14,.8,1.45],[.12,.56,1.6]],.012,{color:0x222222}),
    tube(T,m,[[.3,1.48,.9],[.24,1.0,.4],[.14,.5,-.2],[.12,.52,-1.0],[.12,.54,-1.24]],.012,{color:0x222222})]},
 {id:'harness',color:0xd2813a,metal:.2,rough:.6,emissive:0x331a00,ei:.2,anchor:[.1,.5,-.3],explode:[-.95,.3,0],
  build:(T,m)=>[tube(T,m,[[.06,.95,.62],[.14,.6,.3],[.15,.48,-.1],[.15,.45,-.9],[.1,.33,-1.04]],.018,{color:0xd2813a}),
    tube(T,m,[[.06,.95,.62],[.1,1.3,.75],[.08,1.5,.85]],.012,{color:0x3b82f6}),
    tube(T,m,[[.15,.5,-.3],[.14,.8,-.9],[.05,.95,-1.4]],.012,{color:0xe5e7eb})]},
];
export const EXPLODE={body:[0,0,0],fork:[0,.2,.85],fwheel:[0,0,1.45],bars:[0,.9,.5],rsus:[0,.1,-.7],rwheel:[0,0,-1.35]};
