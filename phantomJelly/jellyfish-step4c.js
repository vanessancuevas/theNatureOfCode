// ── P3 palette ──────────────────────────────────────────────────────────────
const C = {
  cyanR:0,    cyanG:230,  cyanB:255,
  blueR:60,   blueG:100,  blueB:255,
  magR:255,   magG:20,    magB:210,
  gfnnR:255,  gfnnG:255,  gfnnB:255,
  plankR:0,   plankG:180, plankB:255,
};

new p5(function(sk) {

  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const isIPad   = /iPad/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

  const CFG = isMobile ? {
    rings:10, segments:20, tentacles:20, tentSeg:16,
    signals:70, particles:50, connDist:8000,
    pixDensity:1, fps:30,
  } : {
    rings:18, segments:36, tentacles:30, tentSeg:20,
    signals:150, particles:120, connDist:12000,
    pixDensity:Math.min(window.devicePixelRatio,2), fps:60,
  };

  // ── Core state ─────────────────────────────────────────────────────────
  let particles=[], signals=[], bellCache=[];
  let fpsBuffer=[], lastT=0;
  let grid={}, CELL=115;
  let gTime=0;

  // ── DNN ────────────────────────────────────────────────────────────────
  let chargeMap=[], memoryMap=[];
  const DIFFUSE=0.18, DECAY=0.91, MEM_GROW=0.009, MEM_DECAY=0.0003;
  let totalCharge=0;

  // ── GFNN ───────────────────────────────────────────────────────────────
  let gfnn = { active:false, phase:0, origin:0, refractory:0, contraction:0 };
  const GFNN_DURATION   = isMobile ? 18 : 28;
  const GFNN_REFRACTORY = isMobile ? 25 : 40;
  const GFNN_THRESHOLD  = 0.22;

  // ── 8 Rhopalia ─────────────────────────────────────────────────────────
  const N_RHOPALIA = 8;
  let rhopalia = Array.from({length:N_RHOPALIA}, (_,i) => ({
    u: i/N_RHOPALIA, charge: 0, fired: 0,
  }));

  // ── Swim state ─────────────────────────────────────────────────────────
  let swimPhase = 0;
  let contractPhase = 0;

  // ── World position + velocity ───────────────────────────────────────────
  let jelly = { wx: 0, wy: 0, vx: 0, vy: 0 };

  const JELLY_DRAG      = 0.92;
  const JELLY_SPEED_CAP = 4.0;
  const JELLY_SPRING_K  = 0.012;
  const JELLY_SAFE_FX   = 0.32;
  const JELLY_SAFE_FY   = 0.32;

  // ── Flee burst ─────────────────────────────────────────────────────────
  const FLEE_IMPULSE   = 14.0;
  const FLEE_CAP_DECAY = 0.88;
  let   jellyFleeCap   = JELLY_SPEED_CAP;

  // ── Proximity arousal ──────────────────────────────────────────────────
  //
  // Each frame, if the cursor is within APPROACH_RADIUS of the jelly's
  // screen-space centre, a small charge is injected on the face of the
  // bell nearest the cursor. This feeds the DNN, raises surface charge,
  // and slowly charges the rhopalia — all before any click.
  //
  // Injection anatomy:
  //   u  = angle from jelly centre to cursor (which face is stimulated)
  //   v  = 0.55  mid-bell wall (primary surface charge)
  //        0.85  bell margin   (closer to rhopalia → faster pacemaker rise)
  //
  // TUNING (adjust here, verify with D-key debug overlay):
  //   APPROACH_RADIUS   — larger = reacts from further away
  //   APPROACH_STRENGTH — higher = faster arousal; >0.06 feels too snappy
  //
  const APPROACH_RADIUS   = isMobile ? 180 : 260;
  const APPROACH_STRENGTH = 0.038;

  // Cursor position in screen px. Off-screen default prevents phantom
  // injection before the first mousemove event.
  let cursorX = -9999;
  let cursorY = -9999;
  let cursorActive = false;

  // ── stepProximityArousal ───────────────────────────────────────────────
  // Returns the current cursor→jelly distance for the debug overlay.
  function stepProximityArousal() {
    if (!cursorActive) return Infinity;

    let cx = sk.width  * 0.5;
    let cy = sk.height * 0.5;
    let jellyScreenX = cx + jelly.wx;
    let jellyScreenY = cy + jelly.wy - 50;

    let dist = Math.hypot(cursorX - jellyScreenX, cursorY - jellyScreenY);
    if (dist >= APPROACH_RADIUS) return dist;

    let proximity = 1 - dist / APPROACH_RADIUS;
    let strength  = APPROACH_STRENGTH * proximity * proximity; // quadratic falloff

    let angle = Math.atan2(cursorY - jellyScreenY, cursorX - jellyScreenX);
    let u = ((angle / sk.TWO_PI) + 1) % 1;

    injectCharge(u, 0.55, strength);
    injectCharge(u, 0.85, strength * 0.6);

    return dist;
  }

  // ── stepJellyPhysics ───────────────────────────────────────────────────
  function stepJellyPhysics() {
    let safeW = sk.width  * 0.5 * JELLY_SAFE_FX;
    let safeH = sk.height * 0.5 * JELLY_SAFE_FY;

    let fx = 0, fy = 0;
    if (jelly.wx >  safeW) fx = -(jelly.wx -  safeW) * JELLY_SPRING_K;
    if (jelly.wx < -safeW) fx = -(jelly.wx + safeW)  * JELLY_SPRING_K;
    if (jelly.wy >  safeH) fy = -(jelly.wy -  safeH) * JELLY_SPRING_K;
    if (jelly.wy < -safeH) fy = -(jelly.wy + safeH)  * JELLY_SPRING_K;

    jelly.vx += fx;
    jelly.vy += fy;
    jelly.vx *= JELLY_DRAG;
    jelly.vy *= JELLY_DRAG;

    jellyFleeCap = Math.max(JELLY_SPEED_CAP, jellyFleeCap * FLEE_CAP_DECAY);

    let spd = Math.hypot(jelly.vx, jelly.vy);
    if (spd > jellyFleeCap) {
      let inv = jellyFleeCap / spd;
      jelly.vx *= inv;
      jelly.vy *= inv;
    }

    jelly.wx += jelly.vx;
    jelly.wy += jelly.vy;
  }

  // ── applyRepulsionImpulse ──────────────────────────────────────────────
  function applyRepulsionImpulse(mx, my) {
    let cx = sk.width  * 0.5;
    let cy = sk.height * 0.5;
    let dx = jelly.wx       - (mx - cx);
    let dy = (jelly.wy - 50) - (my - cy);
    let dist = Math.hypot(dx, dy);
    if (dist < 1) { dx = 0; dy = -1; dist = 1; }
    let inv = FLEE_IMPULSE / dist;
    jelly.vx += dx * inv;
    jelly.vy += dy * inv;
    jellyFleeCap = FLEE_IMPULSE;
  }

  // ── nearestRhopaliuIdx ────────────────────────────────────────────────
  function nearestRhopaliuIdx(mx, my) {
    let cx = sk.width  * 0.5;
    let cy = sk.height * 0.5;
    let touchU = (Math.atan2(my - cy - (jelly.wy - 50), mx - cx - jelly.wx) / (2 * Math.PI) + 1) % 1;
    let best = 0, bestDist = 1;
    for (let i = 0; i < N_RHOPALIA; i++) {
      let d = Math.abs(rhopalia[i].u - touchU);
      if (d > 0.5) d = 1 - d;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // ── applyThreat ───────────────────────────────────────────────────────
  function applyThreat(mx, my) {
    document.getElementById('hint').style.opacity = '0';
    let uv = screenToUV(mx, my);
    injectCharge(uv.u, uv.v, 0.9);
    applyRepulsionImpulse(mx, my);
    gfnn.refractory = 0;
    fireGFNN(nearestRhopaliuIdx(mx, my));
  }

  // ── DNN ────────────────────────────────────────────────────────────────
  function initMaps(){
    for(let i=0;i<=CFG.rings;i++){
      chargeMap[i]=new Float32Array(CFG.segments+1);
      memoryMap[i]=new Float32Array(CFG.segments+1);
    }
  }

  function injectCharge(u,v,strength){
    let ri=Math.round(sk.constrain(v,0,1)*CFG.rings);
    let si=Math.round(u*CFG.segments)%CFG.segments;
    chargeMap[sk.constrain(ri,0,CFG.rings)][si]=
      Math.min(1.0,chargeMap[sk.constrain(ri,0,CFG.rings)][si]+strength);
  }

  function stepDNN(){
    let next=chargeMap.map(r=>new Float32Array(r));
    for(let i=1;i<CFG.rings;i++){
      for(let j=0;j<CFG.segments;j++){
        let jl=(j-1+CFG.segments)%CFG.segments, jr=(j+1)%CFG.segments;
        let nb=(chargeMap[i-1][j]+chargeMap[i+1][j]+chargeMap[i][jl]+chargeMap[i][jr])*0.25;
        next[i][j]=(chargeMap[i][j]+DIFFUSE*(nb-chargeMap[i][j]))*DECAY;
        memoryMap[i][j]=Math.max(0,Math.min(0.65,
          memoryMap[i][j]+(chargeMap[i][j]>0.12?MEM_GROW:-MEM_DECAY)
        ));
      }
    }
    chargeMap=next;
    totalCharge=0;
    for(let i=0;i<CFG.rings;i++) for(let j=0;j<CFG.segments;j++) totalCharge+=chargeMap[i][j];
    totalCharge/=(CFG.rings*CFG.segments);
  }

  function stepRhopalia(){
    if(gfnn.refractory>0){ gfnn.refractory--; return; }
    for(let rh of rhopalia){
      let si=Math.round(rh.u*CFG.segments)%CFG.segments;
      let ri=CFG.rings;
      let localCharge=0, count=0;
      for(let dr=-1;dr<=0;dr++){
        for(let ds=-1;ds<=1;ds++){
          let ri2=sk.constrain(ri+dr,0,CFG.rings);
          let si2=(si+ds+CFG.segments)%CFG.segments;
          localCharge+=chargeMap[ri2][si2];
          count++;
        }
      }
      localCharge/=count;
      rh.charge=Math.min(1.0, rh.charge*0.94 + localCharge*0.15);
      if(rh.fired>0) rh.fired--;
      if(rh.charge>GFNN_THRESHOLD && !gfnn.active && rh.fired===0){
        fireGFNN(rhopalia.indexOf(rh));
        rh.charge=0;
        rh.fired=GFNN_REFRACTORY;
      }
    }
    if(!gfnn.active && gfnn.refractory===0 && Math.random()<0.0008){
      fireGFNN(Math.floor(Math.random()*N_RHOPALIA));
    }
  }

  function fireGFNN(originIdx){
    gfnn.active=true;
    gfnn.phase=0;
    gfnn.origin=originIdx;
    gfnn.refractory=GFNN_REFRACTORY;
    contractPhase=1.0;
  }

  function stepGFNN(){
    if(gfnn.active){
      gfnn.phase+=1/GFNN_DURATION;
      if(gfnn.phase>=1){ gfnn.phase=1; gfnn.active=false; }
      contractPhase=Math.max(0, contractPhase-0.035);
    } else {
      contractPhase=Math.max(0, contractPhase-0.02);
    }
    swimPhase+=0.03;
  }

  function getBellVertex(u,v,t,contract){
    let theta=u*sk.TWO_PI, phi=v*sk.PI*0.65, r=130;
    let idlePulse=Math.sin(swimPhase - v*sk.PI)*8*v;
    let contractPull= -contract * 35 * Math.sin(v*sk.PI);
    r+=idlePulse+contractPull;
    if(v>0.7){
      r+=Math.sin(theta*24+t*4)*8*(v-0.7);
      r+=Math.pow(v-0.7,2)*250;
      r-=contract*30*(v-0.7);
    }
    let sp=Math.sin(phi), cp=Math.cos(phi);
    let yScale = v<0.2 ? 0.8 : 1.0;
    yScale -= contract*0.25*(1-v);
    return {
      x: r*sp*Math.cos(theta),
      y: -r*cp*yScale,
      z: r*sp*Math.sin(theta)
    };
  }

  function buildBellCache(t){
    for(let i=0;i<=CFG.rings;i++){
      if(!bellCache[i]) bellCache[i]=[];
      let v=i/CFG.rings;
      for(let j=0;j<=CFG.segments;j++)
        bellCache[i][j]=getBellVertex(j/CFG.segments, v, t, contractPhase);
    }
  }

  function gridKey(x,y,z){return `${Math.floor(x/CELL)},${Math.floor(y/CELL)},${Math.floor(z/CELL)}`;}
  function buildGrid(){
    grid={};
    for(let i=0;i<particles.length;i++){
      let p=particles[i],k=gridKey(p.x,p.y,p.z);
      if(!grid[k])grid[k]=[];
      grid[k].push(i);
    }
  }
  function getNeighbours(p){
    let cx=Math.floor(p.x/CELL),cy=Math.floor(p.y/CELL),cz=Math.floor(p.z/CELL),r=[];
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) for(let dz=-1;dz<=1;dz++){
      let k=`${cx+dx},${cy+dy},${cz+dz}`;
      if(grid[k])r.push(...grid[k]);
    }
    return r;
  }

  function screenToUV(mx,my){
    let cx=sk.width*0.5, cy=sk.height*0.5;
    let nx=(mx-cx)/(sk.width*0.25), ny=(my-cy)/(sk.height*0.25);
    let len=Math.sqrt(nx*nx+ny*ny);
    if(len>1){nx/=len;ny/=len;}
    return {u:(Math.atan2(ny,nx)/sk.TWO_PI+1)%1, v:Math.min(1.0,len*0.85)};
  }

  // ── Debug overlay ──────────────────────────────────────────────────────
  let debugMode = false;
  let lastProximityDist = Infinity;

  function updateDebugOverlay() {
    if (!debugMode) return;
    let maxRho = Math.max(...rhopalia.map(r => r.charge));
    let spd    = Math.hypot(jelly.vx, jelly.vy);
    let gfnnStr = gfnn.active
      ? `active  phase:${gfnn.phase.toFixed(2)}`
      : (gfnn.refractory > 0 ? `refract ${gfnn.refractory}f` : 'idle');
    let proxStr = lastProximityDist === Infinity
      ? 'off-screen'
      : (lastProximityDist < APPROACH_RADIUS
          ? `${Math.round(lastProximityDist)}px  *** IN ZONE`
          : `${Math.round(lastProximityDist)}px`);

    document.getElementById('debug').innerHTML =
      `proximity  ${proxStr}<br>` +
      `surface Σ  ${totalCharge.toFixed(4)}<br>` +
      `max rho    ${maxRho.toFixed(3)}  / ${GFNN_THRESHOLD}<br>` +
      `gfnn       ${gfnnStr}<br>` +
      `speed      ${spd.toFixed(2)}  cap:${jellyFleeCap.toFixed(1)}<br>` +
      `wx ${Math.round(jelly.wx)}  wy ${Math.round(jelly.wy)}<br>` +
      `<br>[D] hide`;
  }

  // ── Setup ──────────────────────────────────────────────────────────────
  sk.setup=function(){
    let cnv=sk.createCanvas(sk.windowWidth,sk.windowHeight,sk.WEBGL);
    cnv.elt.style.background='#000';
    sk.pixelDensity(CFG.pixDensity);
    sk.frameRate(CFG.fps);
    initMaps();
    let W=sk.width*1.5, H=sk.height*1.5;
    for(let i=0;i<CFG.particles;i++) particles.push({
      x:sk.random(-W,W),y:sk.random(-H,H),z:sk.random(-W,W),
      speed:sk.random(0.3,1.4),size:sk.random(1.5,3)
    });
    for(let k=0;k<CFG.signals;k++) signals.push({
      u:sk.random(1), v:sk.random(1),
      du:sk.random([-1,1])*sk.random(0.003,0.014),
      dv:sk.random([-1,1])*sk.random(0.003,0.014),
      type:sk.random()>0.5?'u':'v', cyan:sk.random()>0.3
    });
  };

  // ── Input ──────────────────────────────────────────────────────────────
  sk.mouseMoved = function() {
    cursorX = sk.mouseX;
    cursorY = sk.mouseY;
    cursorActive = true;
  };
  sk.mousePressed = function(){ applyThreat(sk.mouseX, sk.mouseY); };
  sk.mouseDragged = function(){
    cursorX = sk.mouseX;
    cursorY = sk.mouseY;
    cursorActive = true;
    document.getElementById('hint').style.opacity = '0';
    let uv = screenToUV(sk.mouseX, sk.mouseY);
    injectCharge(uv.u, uv.v, 0.3);
  };
  sk.touchStarted = function(){
    for(let t of sk.touches) applyThreat(t.x, t.y);
    return false;
  };
  sk.touchMoved = function(){
    document.getElementById('hint').style.opacity = '0';
    for(let t of sk.touches){
      let uv = screenToUV(t.x, t.y);
      injectCharge(uv.u, uv.v, 0.25);
    }
    return false;
  };
  sk.keyPressed = function(){
    if (sk.key === 'd' || sk.key === 'D'){
      debugMode = !debugMode;
      document.getElementById('debug').style.display = debugMode ? 'block' : 'none';
    }
  };

  // ── Draw ───────────────────────────────────────────────────────────────
  sk.draw=function(){
    let now=performance.now();
    fpsBuffer.push(1000/(now-lastT)); lastT=now;
    if(fpsBuffer.length>20)fpsBuffer.shift();
    document.getElementById('perf').textContent=
      'fps:'+Math.round(fpsBuffer.reduce((a,b)=>a+b,0)/fpsBuffer.length)
      +(isIPad?' · p3':'');

    sk.clear(); sk.background(0,0,0,255);
    sk.orbitControl(3,3,0.1);

    gTime=sk.millis()*0.001;

    lastProximityDist = stepProximityArousal();
    stepDNN();
    stepRhopalia();
    stepGFNN();
    stepJellyPhysics();

    sk.drawingContext.disable(sk.drawingContext.DEPTH_TEST);
    sk.blendMode(sk.ADD);

    buildGrid();
    let W=sk.width*1.5, H=sk.height*1.5;
    for(let i=0;i<particles.length;i++){
      let p1=particles[i];
      p1.y+=p1.speed; if(p1.y>H){p1.y=-H;p1.x=sk.random(-W,W);p1.z=sk.random(-W,W);}
      sk.strokeWeight(p1.size); sk.stroke(C.plankR,C.plankG,C.plankB,80); sk.point(p1.x,p1.y,p1.z);
      for(let j of getNeighbours(p1)){
        if(j<=i)continue;
        let p2=particles[j], dSq=(p1.x-p2.x)**2+(p1.y-p2.y)**2+(p1.z-p2.z)**2;
        if(dSq<CFG.connDist){
          sk.stroke(C.plankR,C.plankG,C.plankB,sk.map(dSq,0,CFG.connDist,60,0));
          sk.strokeWeight(0.6); sk.line(p1.x,p1.y,p1.z,p2.x,p2.y,p2.z);
        }
      }
    }

    sk.push();
    sk.rotateX(-0.2);
    sk.rotateY(gTime*0.18);
    let bobY = Math.sin(swimPhase)*12 - contractPhase*25;
    sk.translate(jelly.wx, jelly.wy + bobY - 50, 0);

    buildBellCache(gTime);
    drawBellMesh();
    drawRhopalia();
    drawGFNNSweep();
    drawAxonTentacles();
    drawDNNSignals();
    sk.pop();

    updateStateLabel();
    updateDebugOverlay();
  };

  function drawBellMesh(){
    let gfnnFlash = gfnn.active ? Math.sin(gfnn.phase*sk.PI)*0.9 : 0;
    for(let i=0;i<CFG.rings;i++){
      for(let j=0;j<CFG.segments;j++){
        let p=bellCache[i][j], pr=bellCache[i][j+1], pd=bellCache[i+1][j];
        let c=chargeMap[i][j], mem=memoryMap[i][j];
        let act=Math.min(1.0, c+mem*0.4+gfnnFlash);
        let lineR=sk.map(act,0,1,C.blueR, gfnn.active?200:C.cyanR);
        let lineG=sk.map(act,0,1,C.blueG, gfnn.active?220:C.cyanG);
        let lineB=sk.map(act,0,1,C.blueB, 255);
        let lineA=sk.map(act,0,1,130,240);
        sk.stroke(lineR,lineG,lineB,lineA);
        sk.strokeWeight(0.9);
        sk.line(p.x,p.y,p.z,pr.x,pr.y,pr.z);
        if(i<CFG.rings-1) sk.line(p.x,p.y,p.z,pd.x,pd.y,pd.z);
        let nodeW=sk.map(c+gfnnFlash,0,1,2.5,7);
        sk.stroke(
          sk.map(act,0,1,C.cyanR,200),
          sk.map(act,0,1,C.cyanG,255),
          255, sk.map(act,0,1,190,255)
        );
        sk.strokeWeight(nodeW);
        sk.point(p.x,p.y,p.z);
        if(mem>0.04){
          sk.stroke(C.magR, C.magG, C.magB, mem*150);
          sk.strokeWeight(2);
          sk.point(p.x,p.y,p.z);
        }
      }
    }
  }

  function drawRhopalia(){
    for(let rh of rhopalia){
      let si=Math.round(rh.u*CFG.segments)%CFG.segments;
      let p=bellCache[CFG.rings][si];
      let intensity=rh.charge/GFNN_THRESHOLD;
      let rSize=sk.map(intensity,0,1,4,11);
      let rAlpha=sk.map(intensity,0,1,180,255);
      let firedFlash=rh.fired>GFNN_REFRACTORY*0.8 ? 1 : 0;
      if(firedFlash){
        sk.stroke(255,255,255,255); sk.strokeWeight(14);
        sk.point(p.x,p.y,p.z);
      }
      sk.stroke(C.magR, sk.map(intensity,0,1,C.magG,180), C.magB, rAlpha);
      sk.strokeWeight(rSize);
      sk.point(p.x,p.y,p.z);
      if(intensity>0.6){
        sk.stroke(C.magR,C.magG,C.magB,sk.map(intensity,0.6,1,0,80));
        sk.strokeWeight(rSize*2.5);
        sk.point(p.x,p.y,p.z);
      }
    }
  }

  function drawGFNNSweep(){
    if(!gfnn.active && contractPhase<0.05) return;
    let phase = gfnn.active ? gfnn.phase : 1.0;
    let alpha  = gfnn.active ? Math.sin(phase*sk.PI)*220 : contractPhase*80;
    let sweepRi = sk.constrain(Math.round(phase*CFG.rings), 0, CFG.rings);
    sk.strokeWeight(5);
    for(let j=0;j<CFG.segments;j++){
      let p=bellCache[sweepRi][j];
      sk.stroke(C.gfnnR, C.gfnnG, C.gfnnB, alpha);
      sk.point(p.x,p.y,p.z);
    }
    if(sweepRi>1){
      sk.strokeWeight(3);
      for(let j=0;j<CFG.segments;j++){
        let p=bellCache[sweepRi-1][j];
        sk.stroke(C.gfnnR, C.gfnnG, C.gfnnB, alpha*0.4);
        sk.point(p.x,p.y,p.z);
      }
    }
  }

  function drawAxonTentacles(){
    let sparkSpeed=0.8+totalCharge*2.5;
    for(let i=0;i<CFG.tentacles;i++){
      let segIdx=Math.round((i/CFG.tentacles)*CFG.segments);
      let clampedSeg=Math.min(segIdx,CFG.segments-1);
      let startP=bellCache[CFG.rings][clampedSeg];
      let localC=chargeMap[CFG.rings-1][clampedSeg];
      let localMem=memoryMap[CFG.rings-1][clampedSeg];
      let localAct=Math.min(1.0,localC+localMem*0.4+contractPhase*0.3);
      let tentLen=300+localAct*80;
      let prevX=startP.x, prevY=startP.y, prevZ=startP.z;
      for(let j=1;j<=CFG.tentSeg;j++){
        let depth=j/CFG.tentSeg;
        let waveAmp=28+localAct*30;
        let wave =Math.sin(depth*sk.PI*4 - swimPhase*1.2 + i*0.7)*waveAmp*depth;
        let waveZ=Math.cos(depth*sk.PI*4 - swimPhase*1.2 + i*0.7)*waveAmp*depth;
        let x=startP.x+wave, y=startP.y+depth*tentLen+Math.sin(swimPhase)*18*depth, z=startP.z+waveZ;
        let fiberA=sk.map(localAct,0,1,150,220)*(1-depth);
        sk.stroke(C.blueR,C.blueG,C.blueB,fiberA);
        sk.strokeWeight(1.3);
        sk.line(prevX,prevY,prevZ,x,y,z);
        let nodeA=sk.map(localAct,0,1,160,220)*(1-depth);
        sk.stroke(C.cyanR,C.cyanG,C.cyanB,nodeA);
        sk.strokeWeight(sk.map(localAct,0,1,2.5,4.5));
        sk.point(x,y,z);
        if(gfnn.active){
          sk.stroke(255,255,255,contractPhase*180*(1-depth));
          sk.strokeWeight(3);
          sk.point(x,y,z);
        }
        prevX=x; prevY=y; prevZ=z;
      }
      let localSpeed=sparkSpeed+localAct*2;
      let sd=(gTime*localSpeed+i*0.3)%1.0;
      let sWave =Math.sin(sd*sk.PI*4 - swimPhase*1.2 + i*0.7)*28*sd;
      let sWaveZ=Math.cos(sd*sk.PI*4 - swimPhase*1.2 + i*0.7)*28*sd;
      let sparkBright=localAct>0.3?255:200;
      sk.stroke(sparkBright,sparkBright,255,230*(1-sd));
      sk.strokeWeight(sk.map(localAct,0,1,4,8));
      sk.point(startP.x+sWave, startP.y+sd*tentLen+Math.sin(swimPhase)*18*sd, startP.z+sWaveZ);
    }
  }

  function drawDNNSignals(){
    for(let s of signals){
      let ri=Math.round(sk.constrain(s.v,0,1)*CFG.rings);
      let si=Math.round(s.u*CFG.segments)%CFG.segments;
      ri=sk.constrain(ri,0,CFG.rings);
      let localC=chargeMap[ri][si], localM=memoryMap[ri][si];
      let speedMult=1+localC*4+localM*2+contractPhase*3;
      if(s.type==='u'){s.u+=s.du*speedMult;if(s.u<0)s.u+=1;if(s.u>1)s.u-=1;}
      else{s.v+=s.dv*speedMult;if(s.v<0){s.v=0;s.dv*=-1;}if(s.v>1){s.v=1;s.dv*=-1;}}
      let p=bellCache[ri][si];
      if(gfnn.active && gfnn.phase<0.3){
        sk.stroke(255,255,255,200*Math.sin(gfnn.phase/0.3*sk.PI));
        sk.strokeWeight(6); sk.point(p.x,p.y,p.z);
      }
      if(s.cyan){
        sk.stroke(C.cyanR+localC*60, C.cyanG, C.cyanB, 210+localC*45);
      } else {
        sk.stroke(C.magR, C.magG+Math.round(localM*80), C.magB, 210);
      }
      sk.strokeWeight(4+localC*4+contractPhase*3);
      sk.point(p.x,p.y,p.z);
    }
  }

  function updateStateLabel(){
    let label, color;
    if(gfnn.active){
      label='resonant'; color='rgba(255,255,255,0.5)';
    } else if(gfnn.refractory>GFNN_REFRACTORY*0.5){
      label='refractory'; color='rgba(255,20,210,0.35)';
    } else if(totalCharge>0.08){
      label='aware'; color='rgba(0,230,255,0.4)';
    } else if(totalCharge>0.02){
      label='stirring'; color='rgba(60,100,255,0.35)';
    } else {
      label='dormant'; color='rgba(0,200,255,0.2)';
    }
    let el=document.getElementById('state');
    el.textContent=label;
    el.style.color=color;
  }

  sk.windowResized=function(){sk.resizeCanvas(sk.windowWidth,sk.windowHeight);};
});
