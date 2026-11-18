/* 스페셜 상품 상자 스킨
   - 윗면: 상품 이미지를 비율 그대로(상자 윗면 크기에 맞춰) 크게 보여줘요
   - 옆면: 이미지를 상자 크기에 맞춰 늘려서(비율 무시) 입혀요 — 다른 농산물 상자와 같은 방식
   - 황금빛 아우라(후광)로 스페셜 상자임을 보여줘요
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
  SKIN.apply = function(mesh, s, w, d, h, keepOld){
    if (!keepOld) disposeMaterial(mesh.material);
    var side = sideTexture(s), top = topTexture(s, w, d);
    var mk = function(t){ return new THREE.MeshStandardMaterial({ map:t, roughness:0.7 }); };   // 다른 농산물 상자와 같은 재질·밝기 (발광 없음)
    var sm = mk(side);
    mesh.material = [sm, sm, mk(top), sm, sm, sm];   // +x, -x, 윗면, 바닥, +z, -z
  };
  SKIN.colorHex = function(s){ return new THREE.Color(s.bg).getHex(); };

  /* ----- 황금빛 아우라 (반짝이 없이 은은한 후광만) -----
     상자 '뒤쪽'에서 퍼지는 부드러운 황금빛 광채가 천천히 숨 쉬듯 밝아졌다 어두워져요. 상자 밝기는 그대로예요.
     SKIN.intensity 로 전체 세기를 조절해요 (기본 1, 0이면 꺼짐) */
  SKIN.intensity = 1;
  var GLOW_TEX = null;
  function glowTexture(){
    if (GLOW_TEX) return GLOW_TEX;
    // 캔버스 대신 값을 직접 계산: 색(R,G,B)은 항상 같은 노랑, 투명도(A)만 변함 → 휴대폰 GPU의 색 노이즈(초록 점) 방지
    var N = 128, data = new Uint8Array(N*N*4);
    var stops = [[0,0],[0.30,0.10],[0.52,0.80],[0.72,0.32],[1,0]];
    function alphaAt(r){ for (var s=1;s<stops.length;s++){ if (r<=stops[s][0]){ var a=stops[s-1],b=stops[s],u=(r-a[0])/(b[0]-a[0]); u=u*u*(3-2*u); return a[1]+(b[1]-a[1])*u; } } return 0; }
    for (var y=0;y<N;y++) for (var x=0;x<N;x++){
      var r = Math.sqrt((x-N/2+0.5)*(x-N/2+0.5)+(y-N/2+0.5)*(y-N/2+0.5))/(N/2);
      var o = (y*N+x)*4, al = r>=1 ? 0 : alphaAt(r);
      data[o]=255; data[o+1]=200; data[o+2]=40; data[o+3]=Math.round(al*255);
    }
    var t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
    t.premultiplyAlpha = false; t.needsUpdate = true;
    GLOW_TEX = t; return GLOW_TEX;
  }
  SKIN.addAura = function(mesh, w, h, d){
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTexture(), transparent:true, opacity:0.9, depthWrite:false }));
    mesh.add(sp);
    mesh.userData.aura = { sprite:sp, ph:Math.random()*6.28, base:1 };
    SKIN.updateAura(mesh, w, h, d);
  };
  SKIN.updateAura = function(mesh, w, h, d){
    var a = mesh.userData.aura; if (!a) return;
    a.w = w; a.d = d; a.h = h; a.base = Math.max(w, d) * 2.9;
    a.sprite.scale.set(a.base, a.base, 1);
  };
  var FWD = null;
  SKIN.tick = function(mesh, t, camera){
    var a = mesh.userData.aura; if (!a) return;
    if (camera){   // 후광을 카메라가 보는 방향 '뒤쪽'으로 밀어서, 상자 자체는 밝아지지 않고 바깥으로만 빛나게 함
      FWD = FWD || new THREE.Vector3(); camera.getWorldDirection(FWD);
      var dist = Math.max(a.w, a.d) * 1.1 + a.h;
      a.sprite.position.copy(FWD).multiplyScalar(dist);
    }
    var pulse = 0.5 + 0.5*Math.sin(t*2.4 + a.ph);          // 0~1
    var k = a.base * (0.97 + 0.06*pulse);
    a.sprite.scale.set(k, k, 1);
    a.sprite.material.opacity = Math.max(0, Math.min(1, (0.72 + 0.28*pulse) * SKIN.intensity));
  };
  window.NT_SKIN = SKIN;
})();
