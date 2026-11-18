/* 스페셜 상품 상자 스킨: 상품 이미지를 상자 옆면 비율에 맞춰 잘라(cover) 입혀요.
   필요: three.js, special-images.js
   - fy : 세로로 잘릴 때 이미지의 어느 부분을 보여줄지 (0=위쪽, 1=아래쪽)
   - bg : 윗면·바닥·이미지 빈 곳 색 */
(function(){
  var SPECIALS = [
    { id:'tea',   n:'발라먹차',      bg:'#fff9e6', fy:0.62 },
    { id:'lemon', n:'레몬100',       bg:'#f2d600', fy:0.40 },
    { id:'yang',  n:'골드키위 양갱', bg:'#fdfdf0', fy:0.50 }
  ];
  var DATA = window.NT_SPECIAL_IMAGES || {};
  var SKIN = { SPECIALS: SPECIALS, onLoad: null, PER_UNIT: 200 };
  SPECIALS.forEach(function(s){
    s.loaded = false; s.img = new Image();
    s.img.onload = function(){ s.loaded = true; if (SKIN.onLoad) SKIN.onLoad(s); };
    s.img.src = DATA[s.id] || '';
  });

  function faceTexture(s, w, h){
    var k = SKIN.PER_UNIT;
    var cw = Math.max(32, Math.min(512, Math.round(w*k))), ch = Math.max(32, Math.min(512, Math.round(h*k)));
    var c = document.createElement('canvas'); c.width = cw; c.height = ch;
    var x = c.getContext('2d'); x.fillStyle = s.bg; x.fillRect(0,0,cw,ch);
    if (s.loaded){
      var sc = Math.max(cw/s.img.width, ch/s.img.height), dw = s.img.width*sc, dh = s.img.height*sc;
      x.drawImage(s.img, (cw-dw)/2, -(dh-ch)*s.fy, dw, dh);
    }
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function disposeMaterial(m){
    (Array.isArray(m) ? m : [m]).forEach(function(mm){ if (!mm) return; if (mm.map) mm.map.dispose(); mm.dispose(); });
  }
  /* mesh의 지오메트리가 (w, h, d)일 때 옆 4면에 이미지를 입힘 */
  SKIN.apply = function(mesh, s, w, d, h, keepOld){
    if (!keepOld) disposeMaterial(mesh.material);
    var tx = faceTexture(s, d, h), tz = faceTexture(s, w, h);
    var img = function(t){ return new THREE.MeshLambertMaterial({ map:t }); };
    var plain = function(){ return new THREE.MeshLambertMaterial({ color:new THREE.Color(s.bg) }); };
    mesh.material = [img(tx), img(tx), plain(), plain(), img(tz), img(tz)];   // +x, -x, 윗면, 바닥, +z, -z
  };
  SKIN.colorHex = function(s){ return new THREE.Color(s.bg).getHex(); };
  window.NT_SKIN = SKIN;
})();
