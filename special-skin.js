/* 스페셜 상품 상자 스킨
   - 윗면: 상품 이미지를 비율 그대로(상자 윗면 크기에 맞춰) 크게 보여줘요
   - 옆면: 이미지를 상자 크기에 맞춰 늘려서(비율 무시) 입혀요 — 다른 농산물 상자와 같은 방식
   - 황금빛 아우라(후광) + 반짝이로 스페셜 상자임을 보여줘요
   필요: three.js, special-images.js */
(function(){
  var SPECIALS = [
    { id:'tea',   n:'발라먹차',      bg:'#fff9e6' },
    { id:'lemon', n:'레몬100',       bg:'#f2d600' },
    { id:'yang',  n:'골드키위 양갱', bg:'#fdfdf0' }
  ];
  var DATA = window.NT_SPECIAL_IMAGES || {};
  var SKIN = { SPECIALS: SPECIALS, onLoad: null };
  SPECIALS.forEach(function(s){
    s.loaded = false; s.img = new Image();
    s.img.onload = function(){ s.loaded = true; if (SKIN.onLoad) SKIN.onLoad(s); };
    s.img.src = DATA[s.id] || '';
  });
  var clamp = function(v,a,b){ return Math.max(a, Math.min(b, v)); };

  function topTexture(s, w, d){            // 윗면: 비율 유지(contain)
    var k = 200, cw = clamp(Math.round(w*k),64,512), ch = clamp(Math.round(d*k),64,512);
    var c = document.createElement('canvas'); c.width = cw; c.height = ch;
    var x = c.getContext('2d'); x.fillStyle = s.bg; x.fillRect(0,0,cw,ch);
    if (s.loaded){
      var sc = Math.min(cw/s.img.width, ch/s.img.height)*0.96, dw = s.img.width*sc, dh = s.img.height*sc;
      x.drawImage(s.img,(cw-dw)/2,(ch-dh)/2,dw,dh);
    }
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function sideTexture(s){                 // 옆면: 비율 무시하고 꽉 채움
    var c = document.createElement('canvas'); c.width = 256; c.height = 256;
    var x = c.getContext('2d'); x.fillStyle = s.bg; x.fillRect(0,0,256,256);
    if (s.loaded) x.drawImage(s.img,0,0,256,256);
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function disposeMaterial(m){
    (Array.isArray(m) ? m : [m]).forEach(function(mm){ if (!mm) return; if (mm.map) mm.map.dispose(); mm.dispose(); });
  }
  var GLOW = new THREE.Color(0x2e2000);
  SKIN.apply = function(mesh, s, w, d, h, keepOld){
    if (!keepOld) disposeMaterial(mesh.material);
    var side = sideTexture(s), top = topTexture(s, w, d);
    var mk = function(t){ return new THREE.MeshStandardMaterial({ map:t, roughness:0.7, emissive:GLOW }); };
    var sm = mk(side);
    mesh.material = [sm, sm, mk(top), sm, sm, sm];   // +x, -x, 윗면, 바닥, +z, -z
  };
  SKIN.colorHex = function(s){ return new THREE.Color(s.bg).getHex(); };

  /* ----- 황금빛 아우라 + 반짝이 ----- */
  var NSP = 16, DOT = null;
  function dotTexture(){
    if (DOT) return DOT;
    var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d');
    var g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,250,200,1)'); g.addColorStop(0.35,'rgba(255,214,64,0.85)'); g.addColorStop(1,'rgba(255,190,0,0)');
    x.fillStyle = g; x.fillRect(0,0,64,64); DOT = new THREE.CanvasTexture(c); return DOT;
  }
  SKIN.addAura = function(mesh, w, h, d){
    var halo = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
      new THREE.MeshBasicMaterial({ color:0xffc400, transparent:true, opacity:0.25, side:THREE.BackSide, depthWrite:false }));
    mesh.add(halo);
    var pos = new Float32Array(NSP*3), geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({ map:dotTexture(), color:0xffffff, size:22, sizeAttenuation:false, transparent:true, opacity:0.95, depthWrite:false, blending:THREE.AdditiveBlending }));
    pts.frustumCulled = false;
    mesh.add(pts);
    var seed = []; for (var i=0;i<NSP;i++) seed.push({ x:Math.random()-.5, z:Math.random()-.5, p:Math.random(), v:0.25+Math.random()*0.35 });
    mesh.userData.aura = { halo:halo, pts:pts, seed:seed, ph:Math.random()*6.28, w:w, h:h, d:d };
    SKIN.updateAura(mesh, w, h, d);
  };
  SKIN.updateAura = function(mesh, w, h, d){
    var a = mesh.userData.aura; if (!a) return;
    a.w = w; a.h = h; a.d = d; a.halo.scale.set(w*1.12, h*1.45, d*1.12);
  };
  SKIN.tick = function(mesh, t){
    var a = mesh.userData.aura; if (!a) return;
    a.halo.material.opacity = 0.24 + 0.1*Math.sin(t*4 + a.ph);
    var p = a.pts.geometry.attributes.position.array;
    for (var i=0;i<NSP;i++){
      var s = a.seed[i], f = (s.p + t*s.v) % 1;
      p[i*3]   = s.x*a.w*1.15;
      p[i*3+1] = -a.h/2 + f*a.h*2.4;
      p[i*3+2] = s.z*a.d*1.15;
    }
    a.pts.geometry.attributes.position.needsUpdate = true;
    a.pts.material.opacity = 0.7 + 0.3*Math.sin(t*6 + a.ph);
  };
  window.NT_SKIN = SKIN;
})();
