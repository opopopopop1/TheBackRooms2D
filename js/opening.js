/* 开屏动画 —— 金色离子化标题
   来源：作者自制 WebGL 开屏（逐段凝结 + 斜倒影 + bloom）
   集成改动：
     1) 去掉右下角"点击跳过 / 按 S 看性能"的提示
     2) 凝结完成后不再自动退出，字进入波浪扭动等待态
     3) 波浪态下方显示"点击任意区域开始游戏"
     4) 字身上叠加一道循环扫过的白色流光
     5) 点击后画面从中间分成上下两半，各自向外折叠，露出主菜单
*/
(function () {
'use strict';

// 主菜单交还：WebGL 不可用 / 折叠结束时都要走这里
function opDone(){
  window.__opFinished = true;
  var host = document.getElementById('opening');
  if (host) host.parentNode && host.parentNode.removeChild(host);
  var m = document.getElementById('menu');
  if (m) m.classList.remove('hidden');
  if (window.__opOnDone) { try { window.__opOnDone(); } catch(e){} }
}
window.__opFallback = opDone;
window.__opDone = opDone;

var _cv = document.getElementById('op-canvas');
if (!_cv){ opDone(); return; }

// 超时兜底：无论出什么岔子，20 秒后一定放行到主菜单，不让玩家卡在开屏
setTimeout(function(){ if (!window.__opFinished) opDone(); }, 26000);

try {

(() => {
'use strict';

/* ═══════════════════════════════════════════════════════════════
   0. 上下文 / 设备分级
   ═══════════════════════════════════════════════════════════════ */
const canvas = _cv;
// preserveDrawingBuffer 只为折叠截图服务，但它会强制 GPU 每帧保留缓冲，
// 手机上开销极大（部分驱动掉一半帧率甚至渲染异常）。
// 手机上关掉：折叠时改为"同一 tick 内先画一帧再立刻读像素"来拿截图。
const _isMobUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
const _PDB = !_isMobUA;          // 是否保留了绘制缓冲（决定截图要不要先补一帧）
const gl = canvas.getContext('webgl', {
  alpha:false, antialias:false, depth:false, stencil:false,
  premultipliedAlpha:false, powerPreference:'high-performance',
  preserveDrawingBuffer: _PDB        // 手机端关掉，见上
}) || canvas.getContext('experimental-webgl');

if (!gl){ if (window.__opFallback) window.__opFallback(); return; }

const isMobile = /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const mem      = navigator.deviceMemory || (isMobile ? 4 : 8);
const cores    = navigator.hardwareConcurrency || 4;
const strong   = mem >= 6 && cores >= 6;          // 中高端手机：允许更高的渲染档
const TIER     = (!isMobile && mem >= 8) ? 'high' : (isMobile ? (strong ? 'mid' : 'low') : 'mid');
const CFG = {
  high:{ part:170000, dpr:2.00, bloomLv:2, sceneScale:1.00 },
  mid :{ part: 88000, dpr:1.60, bloomLv:2, sceneScale:0.90 },
  low :{ part: 36000, dpr:1.25, bloomLv:1, sceneScale:0.78 },
}[TIER];
// 手机端：只压粒子数和 bloom 级数，不再压「分辨率」。
// 旧版把 dpr 锁死 1.0、场景 FBO 只有 78%，在 3x 屏上等于用物理像素的四分之一
// 渲染再拉满全屏 —— 字、扫描条、倒影边缘全是糊的。现在按设备像素比与
// 主 FBO 像素预算取一个尽量高的 dpr，并让场景缓冲贴近 1:1。
// 粒子数仍受控：低档机跑 3.6 万粒子 + 多级 bloom 会掉到触发 26 秒兜底。
if (isMobile) {
  const dprRaw = window.devicePixelRatio || 1;
  const cssPix = Math.max(1, innerWidth * innerHeight);
  const budget = strong ? 3.6e6 : 2.4e6;         // 主 FBO 像素预算，防 GPU 爆显存
  const capByBudget = Math.sqrt(budget / cssPix);
  CFG.dpr = Math.max(1.0, Math.min(dprRaw, strong ? 2.0 : 1.5, Math.max(1.0, capByBudget)));
  CFG.sceneScale = strong ? 1.00 : 0.92;
  CFG.part = strong ? 36000 : 22000;
  CFG.bloomLv = strong ? 2 : 1;
}

let PCOUNT = CFG.part, ACTIVE = CFG.part, BLOOM_LV = CFG.bloomLv;
let DPR = Math.min(window.devicePixelRatio || 1, CFG.dpr);

const SEG_N = 6;        // 文字从上往下切成的段数
                        // 注意：shader 里用 5 条 step 判定段归属，最多支持 6 段；
                        // 要更多段需在 segAt() 里补 step 行，并同步 uEdgeB 的 y/z/w
const HBASE = 0.34;     // 文字块半高（NDC）

// 倒影：镜像 + 剪切 + 压缩
// shear → 视觉倾角 tan = 2*shear（纹理是 2:1，u 方向 1 单位等于 v 方向 2 单位的屏幕位移）
// 0.92 → tan1.84 ≈ 61°，相当斜
const REF = { len:0.40, shear:0.92, squash:1.85, str:0.88, blur:0.032,
              ripple:0.0062 };                  // 水面波纹强度
// 水天线：字与影的分界（"像倒影在海面上"靠的就是这条线）
const HORIZON = { w:0.011, str:0.46, halfU:0.72 };
// 横向发光元素的收零边界（u 空间，相对文字中心；文字半宽 = 0.5）。
// 必须严格小于 quad 到文字中心的距离，否则又会被 quad 切出断头。
const LAT_EDGE = 0.78;
// ORIGIN 在 resize 里动态算：quad 相对文字块是"不对称向右下伸"的，
// 若固定偏移，窄屏下倒影右侧会顶出屏幕。这里按 quad 包围盒整体居中。
const ORIGIN = [0.0, 0.055];

/* ═══════════════════════════════════════════════════════════════
   1. GL 工具
   ═══════════════════════════════════════════════════════════════ */
// 片元着色器的精度兜底：不支持 highp 的 GPU 自动退到 mediump。
// 这是手机端开屏"渲染错误 / 完全不渲染"最主要的原因 —— 着色器编译失败会被
// 外层 try/catch 吞掉，表面看就是黑屏。
const FS_PREC_FALLBACK =
  '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
  'precision highp float;\n' +
  '#else\n' +
  'precision mediump float;\n' +
  '#endif';
function sh(type, src){
  const s = gl.createShader(type);
  if (type === gl.FRAGMENT_SHADER && /precision\s+highp\s+float\s*;/.test(src)) {
    src = src.replace(/precision\s+highp\s+float\s*;/, FS_PREC_FALLBACK);
  }
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function prog(vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  p.u = {}; p.a = {};
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++){ const n = gl.getActiveUniform(p,i).name.replace(/\[0\]$/,'');
    p.u[n] = gl.getUniformLocation(p, n); }
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++){ const n = gl.getActiveAttrib(p,i).name; p.a[n] = gl.getAttribLocation(p, n); }
  return p;
}

const NOISE = `
float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }
`;
const QUAD_VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }
`;

/* ═══════════════════════════════════════════════════════════════
   2. Pass A —— 暖金背景
   ═══════════════════════════════════════════════════════════════ */
const bgP = prog(QUAD_VS, `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uEnergy, uFade;
${NOISE}
void main(){
  vec2 p = (vUv-0.5)*vec2(uAspect,1.0);
  float r = length(p), a = atan(p.y,p.x);

  float core = exp(-r*r*2.4) * (0.11 + uEnergy*0.20);

  float ang = a/6.28318 + 0.5;
  float beams = fbm(vec2(ang*8.0, uTime*0.04)) * fbm(vec2(ang*19.0 - uTime*0.025, 3.7));
  beams = pow(beams, 2.7) * exp(-r*1.25) * (0.13 + uEnergy*0.26);

  float neb = fbm(p*2.2 + uTime*0.015);

  vec3 c1 = vec3(0.30,0.15,0.035);
  vec3 c2 = vec3(0.62,0.38,0.09);
  vec3 col = mix(c1, c2, smoothstep(0.0,1.0, beams*1.7 + neb*2.4)) * (core + beams);
  col += vec3(0.055,0.030,0.010) * neb * 1.6;

  gl_FragColor = vec4(col * (1.0-uFade), 1.0);
}
`);

/* ═══════════════════════════════════════════════════════════════
   3. Pass B —— 离子粒子（逐段凝结）
      交错缓冲 9 floats: [ox, oy, ux, uy, r0,r1,r2,r3, seg]
      ux/uy 为纹理归一化坐标 (-1..1)，shader 里再乘 uHalf 得 NDC
   ═══════════════════════════════════════════════════════════════ */
const partP = prog(`
precision highp float;
attribute vec2  aStart;
attribute vec2  aTarget;
attribute vec4  aRand;
attribute float aSeg;
uniform float uTime, uProgress, uSpan, uSegN, uFit, uPx, uFade, uSettle, uScatter;
uniform float uWave, uWaveT;
uniform vec2  uHalf, uOrigin, uShake;
varying vec3  vCol;
varying float vA;

vec2 flow(vec3 p){
  return vec2(
    sin(p.y*1.7 + p.z*0.9) + cos(p.z*1.31 + p.x*0.6),
    sin(p.z*1.9 + p.x*1.1) + cos(p.x*0.73 + p.y*1.4)
  );
}
void main(){
  // ── 分段错峰：第 i 段在 [i*step, i*step+span] 内完成凝结 ──
  float stepS = (1.0 - uSpan) / max(1.0, uSegN - 1.0);
  float lp = clamp((uProgress - aSeg*stepS) / uSpan, 0.0, 1.0);
  float e  = 1.0 - pow(1.0 - lp, 3.0);

  vec2 tgt = aTarget * uHalf * uFit;

  // 离子云：目标附近散开 → 收拢落位（"析出"而非"飞入"）
  vec2 pos = mix(tgt + aStart * uHalf.y, tgt, e);

  // 湍流：离子态强，落位后仅剩极轻呼吸
  float turb = 0.055*(1.0-e)*(1.0-e) + 0.0025;
  pos += flow(vec3(pos*3.4, uTime*0.55 + aRand.w*10.0)) * turb * uHalf.y;

  // 未凝结时整体偏上，凝结时下沉落位
  pos.y += (1.0 - e) * 0.030 * uHalf.y;

  // 落位后的微呼吸
  pos += vec2(sin(uTime*1.3 + aRand.z*6.283), cos(uTime*1.1 + aRand.y*6.283))
         * 0.0016 * e * uHalf.y;

  // 波浪扭动：与文字层同一个相位公式，粒子才不会和字脱节
  float wvx = tgt.x / max(1e-4, uHalf.x);
  float wv  = sin(wvx*2.75 + uWaveT*1.7)*0.020 + sin(wvx*5.5 - uWaveT*1.15)*0.009;
  pos.y += wv * uWave * uHalf.y;

  // 结尾：重新离子化消散
  if (uScatter > 0.0){
    vec2 dir = normalize(pos + vec2(1e-5, 0.0));
    pos += dir * uScatter * uHalf.y * (0.35 + aRand.y*1.3);
    pos.y += uScatter*uScatter*0.10*uHalf.y*(aRand.z-0.5);
  }

  // 粒子位置算在"文字局部空间"，最后统一平移 —— 必须与文字层的 uOrigin 一致，否则错位
  gl_Position = vec4(pos + uOrigin + uShake, 0.0, 1.0);

  float sz = mix(3.0, 1.35, e) * (0.5 + aRand.y*0.9);
  gl_PointSize = sz * uPx * (1.0 - uScatter*0.30);

  float fin   = smoothstep(0.0, 0.10, lp);
  float ember = mix(1.0, 0.18 + aRand.z*0.32, uSettle);   // 落定后仅留少量余烬
  vA = fin * ember * (1.0 - uScatter) * (1.0 - uFade);

  // 离子态闪烁 + 落位瞬间的火花
  float ion   = 1.0 - e;
  float flick = 1.0 + ion * 0.60 * sin(uTime*13.0 + aRand.x*55.0);
  float spark = exp(-pow((lp - 0.84)/0.15, 2.0));

  vec3 ionC = vec3(1.00,0.90,0.55);   // 离子：亮浅金
  vec3 setC = vec3(1.00,0.75,0.24);   // 落位：主金
  vec3 ambC = vec3(0.95,0.47,0.10);   // 琥珀（层次）
  vec3 hotC = vec3(1.00,0.97,0.87);   // 白金高光

  vCol = mix(ionC, setC, e);
  vCol = mix(vCol, ambC, smoothstep(0.58, 1.0, aRand.z) * 0.50);
  vCol = mix(vCol, hotC, smoothstep(0.82, 1.0, aRand.y) * 0.55 + spark*0.45);
  vCol *= flick;
  vCol += vec3(0.55,0.38,0.14) * spark;
}
`, `
precision highp float;
varying vec3 vCol;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;                       // 平方衰减 → 更像真实光点
  gl_FragColor = vec4(vCol * a * vA * 1.35, a * vA);
}
`);

/* ═══════════════════════════════════════════════════════════════
   4. Pass C —— 文字层
      逐段噪声溶解 + 投影(多次偏移采样) + sobel 法线浮雕 + 扫描亮线
   ═══════════════════════════════════════════════════════════════ */
const TEXT_VS = `
attribute vec2 aPos;
uniform vec2  uHalf, uShake, uOrigin;
uniform vec4  uRect;          // quad 覆盖的 (u,v) 范围：U0,U1,V0,V1
uniform float uFit;
varying vec2 vUv;
void main(){
  // quad 不再等于文字块：它要向右下多伸出一块，容纳斜倒影，否则倒影会被硬裁
  vec2 t = aPos*0.5 + 0.5;
  vUv = vec2(mix(uRect.x, uRect.y, t.x), mix(uRect.z, uRect.w, t.y));
  // u,v 是"相对文字块"的归一化坐标：u,v∈[0,1] 即文字本身，v<0 即文字下方
  vec2 p = vec2((vUv.x - 0.5)*2.0*uHalf.x,
                (vUv.y - 0.5)*2.0*uHalf.y) * uFit + uOrigin + uShake;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

const textP = prog(TEXT_VS, `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2  uTexel, uShadowOff, uBBox;
uniform vec4  uEdgeA, uEdgeB;      // 段边界（uEdgeA=1~4 段界，uEdgeB.x=第5段界）
uniform float uProgress, uSpan, uSegN, uScanY, uTime, uFade, uOut;
uniform float uWave, uWaveT, uStream;
uniform float uShadowStr, uBevel;
uniform float uRefLen, uShear, uSquash, uRefStr, uRefBlur;
uniform float uRipple, uHorizonW, uHorizonStr, uHorizonHalfU, uLatEdge;
${NOISE}

float segProg(float s){
  float st = (1.0 - uSpan) / max(1.0, uSegN - 1.0);
  return clamp((uProgress - s*st) / uSpan, 0.0, 1.0);
}
// 段归属：边界由 CPU 按粒子数等分算好后传来（避免行间空白产生空段）
// 用 step 累加代替数组索引 → 不需要循环，也不需要动态下标
float segAt(float v){
  float ty = 1.0 - v;                                        // 归一化纹理 y
  float u  = clamp((ty - uBBox.x) / max(1e-4, uBBox.y - uBBox.x), 0.0, 1.0);
  float s = 0.0;
  s += step(uEdgeA.x, u);
  s += step(uEdgeA.y, u);
  s += step(uEdgeA.z, u);
  s += step(uEdgeA.w, u);
  s += step(uEdgeB.x, u);
  return clamp(s, 0.0, uSegN - 1.0);
}

void main(){
  // ── 波浪扭动 ──
  // 两个不同频率叠加：低频给整体起伏，高频给细节抖动，x 上相位不同 → 像水面在扭
  float wv = sin(vUv.x*5.5 + uWaveT*1.70)*0.020 + sin(vUv.x*11.0 - uWaveT*1.15)*0.009;
  vec2 suv = vUv + vec2(0.0, wv*uWave);       // 之后所有采样都用 suv，字才会真的变形

  float lp  = segProg(segAt(vUv.y));

  // 横向坐标（以文字中心为轴）与统一收零包络。
  // 任何横向铺开的发光元素（扫描条、水天线）都必须乘 soft，
  // 否则会在 quad 边界被切成一条断头 —— 这是"那个条被突然截断"的根因。
  float cx   = suv.x - 0.5;
  float soft = 1.0 - smoothstep(uLatEdge*0.70, uLatEdge, abs(cx));

  // ── 溶解：噪声阈值推进，掺一点自上而下的方向性 ──
  float n = fbm(suv * vec2(9.0, 4.5));
  n = mix(n, 1.0 - suv.y, 0.30);
  float a = smoothstep(n - 0.13, n + 0.02, lp);

  // ── 投影：沿固定方向多次偏移采样，形成有方向感的软阴影 ──
  float sh = 0.0;
  for (int i = 0; i < 5; i++){
    sh += texture2D(uTex, suv - uShadowOff * (1.0 + float(i)*0.42)).a;
  }
  sh = pow(sh * 0.2, 1.35) * uShadowStr;
  sh *= segProg(segAt(clamp(suv.y - uShadowOff.y*3.0, 0.0, 1.0)));  // 阴影跟随所属段

  // ── 浮雕：sobel 求 alpha 梯度 → 法线 → 方向光 + 高光 ──
  float ax = texture2D(uTex, suv + vec2(uTexel.x, 0.0)).a
           - texture2D(uTex, suv - vec2(uTexel.x, 0.0)).a;
  float ay = texture2D(uTex, suv + vec2(0.0, uTexel.y)).a
           - texture2D(uTex, suv - vec2(0.0, uTexel.y)).a;
  vec3  nrm = normalize(vec3(-ax*uBevel, -ay*uBevel, 1.0));
  vec3  LD  = normalize(vec3(-0.45, 0.62, 0.65));
  float dif = clamp(dot(nrm, LD), 0.0, 1.0);
  float spc = pow(clamp(dot(reflect(-LD, nrm), vec3(0.0,0.0,1.0)), 0.0, 1.0), 22.0);

  vec3 goldD = vec3(0.52,0.27,0.03);
  vec3 gold  = vec3(1.00,0.75,0.24);
  vec3 specC = vec3(1.00,0.96,0.80);
  vec3 textC = mix(goldD, gold, 0.32 + 0.78*dif) + specC * spc * 1.05;

  // ── 字身自发光 ──
  // 浮雕只解决"金属感"，字要"发光"得靠 emissive：
  // 一层缓慢流过字身的金色光泽（噪声扰动相位，避免匀速扫描的机械感）
  // 叠一层基础自发光，交给后面的 bloom 放大成辉光。
  float sheen = fbm(vUv*vec2(3.4,1.7) + vec2(uTime*0.15, -uTime*0.05));
  float flow  = 0.5 + 0.5*sin(vUv.x*2.1 + vUv.y*1.1 - uTime*1.15 + sheen*2.6);
  textC += mix(gold, vec3(1.00,0.93,0.66), 0.40) * (0.15 + 0.46*pow(flow, 2.8));

  // ── 斜倒影 ──
  // 三件事缺一不可：镜像（向下取向上）、剪切（越深越往右偏 → 斜）、压缩（映进更多字身）
  float pivot = 1.0 - uBBox.y;         // 文字底边在 vUv.y 空间
  float d     = pivot - suv.y;         // >0 表示位于文字下方的倒影区
  float refl  = 0.0;
  if (d > 0.0 && d < uRefLen){
    float sy = pivot + d * uSquash;    // 镜像 + 压缩（uSquash>1 → 倒影被压扁）
    float su = suv.x - uShear * d;     // 剪切：越深越向右偏移 → 视觉上很斜

    // 水面波纹：越深晃动越强。没有它倒影是"复制一份"，有了才像映在水里
    float rip = sin(suv.x*24.0 + uTime*2.1) + 0.6*sin(suv.x*39.0 - uTime*1.4);
    su += rip * uRipple * d;
    sy += rip * uRipple * 0.30 * d;

    if (sy < 1.0){
      float br = uRefBlur * d;         // 越远越模糊
      float rm = texture2D(uTex, vec2(su, sy)).a;
      rm += texture2D(uTex, vec2(su, sy + br)).a;
      rm += texture2D(uTex, vec2(su, sy - br)).a;
      rm += texture2D(uTex, vec2(su + br*0.45, sy + br*0.5)).a;
      rm += texture2D(uTex, vec2(su - br*0.45, sy - br*0.5)).a;
      rm *= 0.2;
      // 深度衰减 + 倒影跟随它映出的那一段显现
      refl = rm * pow(1.0 - d/uRefLen, 1.7) * segProg(segAt(sy)) * uRefStr;
    }
  }
  // 倒影压暗、去饱和并掺一点冷环境色 —— 金色反光偏冷才显得"贵"
  vec3 refC = mix(vec3(0.30,0.16,0.04), gold, 0.45) * 0.52 + vec3(0.020,0.032,0.055);

  // ── 水天线：字底边处的水平光带，就是"字 / 影"的分界 ──
  // 倒影原先是从字底凭空长出来的，边界生硬；加了这条线才成立为"海面倒影"。
  float horizon = exp(-pow((suv.y - pivot)/uHorizonW, 2.0))
                * exp(-cx*cx / max(1e-4, uHorizonHalfU*uHorizonHalfU))
                * soft * uHorizonStr * segProg(segAt(pivot));

  // ── 溶解边缘发光（"正在被点亮的那一圈"）──
  float edge = 1.0 - smoothstep(0.0, 0.085, abs(n - lp));
  edge *= step(0.001, lp) * step(lp, 0.999);

  // ── 扫描亮线：跟随推进前沿，是"逐段"的视觉引导 ──
  // 关键修正：x 方向必须有包络。之前只在 y 方向做高斯、x 方向铺满整个 quad，
  // 两端于是被 quad 边界齐刷刷切断 —— 就是"那个条被突然截断"的来源。
  // 现在改成「亮核 + 左右拖出的光芒」，并用 soft 在 quad 边界之前严格收零。
  float lnY  = exp(-pow((suv.y - uScanY) * 26.0, 2.0));
  float core = exp(-cx*cx * 8.0);                    // 亮核：大致贴合文字宽度
  float wing = exp(-cx*cx * 1.15) * 0.45;            // 左右光芒：拉得宽而淡
  float line = lnY * (core + wing) * soft
             * step(0.001, uProgress) * step(uProgress, 0.999);

  float m  = texture2D(uTex, suv).a;
  float ta = clamp(a, 0.0, 1.0) * m;

  // over 合成（全程预乘 alpha）：阴影 → 倒影 → 文字，文字压在最上面
  vec3  shC = vec3(0.10,0.045,0.012);
  vec3  col = shC * sh;
  float al  = sh * 0.92;
  col = refC * refl + col * (1.0 - refl);
  al  = refl + al * (1.0 - refl);
  col = textC * ta + col * (1.0 - ta);
  al  = ta   + al  * (1.0 - ta);

  // 溶解边缘发光 / 扫描亮线 / 水天线：加性
  col += vec3(1.00,0.78,0.35) * edge * 1.55 * m;
  col += vec3(1.00,0.86,0.46) * line * 0.38;   // 系数已按 core+wing 的峰值 1.45 归一
  col += vec3(1.00,0.84,0.44) * horizon;

  // ── 白色流光：一条窄亮带沿 x 反复扫过字身（只在字上才亮）──
  float sp    = fract(uWaveT*0.26)*1.7 - 0.35;
  float sband = exp(-pow((suv.x - sp)/0.080, 2.0));
  float stream = sband * clamp(a,0.0,1.0) * m * uStream;
  col += vec3(1.00,0.99,0.96) * stream * 0.95;

  al   = max(al, max(line*0.22, horizon*0.42));
  al   = max(al, stream*0.55);

  float outF = (1.0 - uOut) * (1.0 - uFade);
  gl_FragColor = vec4(col * outF, al * outF);   // 预乘 alpha
}
`);

/* ═══════════════════════════════════════════════════════════════
   5. Pass D —— 后期：亮部提取 → 可分离高斯 → 合成
   ═══════════════════════════════════════════════════════════════ */
const brightP = prog(QUAD_VS, `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform float uThresh, uKnee;
void main(){
  vec3 c = texture2D(uScene, vUv).rgb;
  float l = dot(c, vec3(0.2126,0.7152,0.0722));
  float k = clamp((l - uThresh + uKnee) / (2.0*uKnee), 0.0, 1.0);   // soft knee
  float w = max(l - uThresh, uKnee*k) / max(l, 1e-4);
  gl_FragColor = vec4(c * w * k, 1.0);
}
`);
const blurP = prog(QUAD_VS, `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
void main(){
  float w0=0.227027, w1=0.194594, w2=0.121621, w3=0.054054, w4=0.016216;
  vec3 s = texture2D(uTex, vUv).rgb * w0;
  s += texture2D(uTex, vUv + uDir*1.0).rgb * w1;
  s += texture2D(uTex, vUv - uDir*1.0).rgb * w1;
  s += texture2D(uTex, vUv + uDir*2.0).rgb * w2;
  s += texture2D(uTex, vUv - uDir*2.0).rgb * w2;
  s += texture2D(uTex, vUv + uDir*3.0).rgb * w3;
  s += texture2D(uTex, vUv - uDir*3.0).rgb * w3;
  s += texture2D(uTex, vUv + uDir*4.0).rgb * w4;
  s += texture2D(uTex, vUv - uDir*4.0).rgb * w4;
  gl_FragColor = vec4(s, 1.0);
}
`);
const compP = prog(QUAD_VS, `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene, uB1, uB2;
uniform vec2  uRes, uShake;
uniform float uTime, uFlash, uGlitch, uShockR, uShockA, uAber, uFade, uBloom, uB2mix;
${NOISE}
void main(){
  vec2 uv = vUv + uShake;
  vec2 c  = uv - 0.5;
  float r = length(c);

  // 冲击波：环形折射 + 亮环（真扭曲 UV，不是贴扩散 PNG）
  float band = exp(-pow((r - uShockR)/0.055, 2.0)) * uShockA;
  uv -= normalize(c + vec2(1e-5)) * band * 0.045;
  float ring = band * 1.15;

  // 数字故障：按行随机错位
  if (uGlitch > 0.001){
    float row  = floor(uv.y * 46.0);
    float tick = floor(uTime * 22.0);
    float pick = hash21(vec2(row*1.7, tick));
    uv.x += (hash21(vec2(row*3.1, tick)) - 0.5) * 0.07 * uGlitch * step(0.70, pick);
  }

  // 色散：RGB 沿径向分离，边缘更明显
  float ab = uAber * (0.0018 + r*0.0075) + uGlitch*0.004;
  vec3 col;
  col.r = texture2D(uScene, uv + c*ab).r;
  col.g = texture2D(uScene, uv).g;
  col.b = texture2D(uScene, uv - c*ab).b;

  col += texture2D(uB1, uv).rgb * uBloom;
  col += texture2D(uB2, uv).rgb * uBloom * uB2mix;

  col += vec3(1.00,0.78,0.38) * ring;
  col += vec3(1.00,0.96,0.86) * uFlash;

  // ACES 近似 tonemap：加性混合极易过曝，必须压回来
  col *= 1.06;
  col = clamp((col*(2.51*col+0.03)) / (col*(2.43*col+0.59)+0.14), 0.0, 1.0);

  // 胶片颗粒：大面积渐变必出色带，噪声是最便宜的解法
  col += (hash21(uv*uRes + fract(uTime)*311.0) - 0.5) * 0.030;

  col *= mix(1.0, smoothstep(1.05, 0.22, r), 0.85);   // 暗角
  col *= (1.0 - uFade);
  gl_FragColor = vec4(col, 1.0);
}
`);

/* ═══════════════════════════════════════════════════════════════
   6. 文字纹理：Canvas2D 现画 → 同时用来生成粒子目标点
      换行内容：改 TXT 即可；换成图片素材则把 drawText() 换成 drawImage
   ═══════════════════════════════════════════════════════════════ */
const LW = 1400, LH = 700;   // 逻辑排版坐标：字体、行距、分隔线位置一律不变
// 渲染分辨率提上去之后，1400×700 的字模板会成为新的瓶颈（放大后字边缘发虚）。
// 把模板 canvas 整数倍放大并 scale 上下文，排版代码一个数字都不用改；
// 采样步长同步放大，粒子目标点的归一化坐标仍按 LW/LH 计算。
const TS = (DPR >= 1.5) ? 2 : 1;
const TW = LW * TS, TH = LH * TS;

function drawTracked(ctx, text, cx, y, spacing){
  const chars = [...text];
  const w = chars.map(ch => ctx.measureText(ch).width);
  const total = w.reduce((a,b) => a+b, 0) + spacing*(chars.length-1);
  let x = cx - total/2;
  chars.forEach((ch,i) => { ctx.fillText(ch, x, y); x += w[i] + spacing; });
  return total;
}

function buildText(){
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const x = cv.getContext('2d', { willReadFrequently:true });
  if (TS !== 1) x.scale(TS, TS);
  x.clearRect(0,0,LW,LH);
  const cx = LW/2;
  const CN = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","WenQuanYi Micro Hei",sans-serif';

  x.fillStyle = '#ffffff';
  x.textBaseline = 'alphabetic';

  // 顶部小字
  x.font = '720 100px "Helvetica Neue",Arial,sans-serif';
  drawTracked(x, 'BACKROOMS | 后室', cx, 150, 26);

  // 主标
  x.font = '900 168px ' + CN;
  drawTracked(x,'无人抵达', cx, 360, 34);

  // 分隔线：两端渐隐地"射"出去。
  // 原来两端是硬切的短横，看着像被截断；改成向左右拖出并淡出，
  // 与扫描条、水天线的横向光芒是同一套语言。
  x.lineWidth = 4;
  const gL = x.createLinearGradient(cx-320, 0, cx-40, 0);
  gL.addColorStop(0.00, 'rgba(255,255,255,0)');
  gL.addColorStop(0.55, 'rgba(255,255,255,0.55)');
  gL.addColorStop(1.00, 'rgba(255,255,255,1)');
  x.strokeStyle = gL;
  x.beginPath(); x.moveTo(cx-320, 412); x.lineTo(cx-40, 412); x.stroke();

  const gR = x.createLinearGradient(cx+40, 0, cx+320, 0);
  gR.addColorStop(0.00, 'rgba(255,255,255,1)');
  gR.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  gR.addColorStop(1.00, 'rgba(255,255,255,0)');
  x.strokeStyle = gR;
  x.beginPath(); x.moveTo(cx+40, 412); x.lineTo(cx+320, 412); x.stroke();

  x.save(); x.translate(cx, 412); x.rotate(Math.PI/4);
  x.fillStyle = '#ffffff'; x.fillRect(-11,-11,22,22); x.restore();

  // 副标
  x.font = '500 42px "Helvetica Neue",Arial,sans-serif';
  drawTracked(x, '作者:!?q0q?!', cx, 500, 18);

  return { canvas: cv, ctx: x };
}

const art = buildText();

const artTex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, artTex);
// 关键：WebGL 默认 UNPACK_FLIP_Y_WEBGL = false，此时 canvas 第 0 行（字的上方）
// 会被送到 v=0，而 v=0 对应画面下方 —— 纹理里的字是倒的，
// 与粒子（按 (0.5 - py/LH) 计算，字的上方在画面上方）正好互为镜像，
// 于是屏幕上出现"两份字"，其中一份是反的。
// 打开翻转后 v=1 对应 canvas 第 0 行，纹理与粒子、分段、倒影轴才统一。
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art.canvas);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// 采样不透明像素 → 粒子目标点（这就是"粒子怎么知道要拼成什么字"的答案）
// 同时记录文字的垂直包围盒：分段必须按包围盒均分，
// 否则按整张纹理均分会出现首尾空段（文字只占中间一部分）
const pix = art.ctx.getImageData(0,0,TW,TH).data;
const pts = [];
const STEP = 2 * TS;      // 采样密度与旧版一致，超采样不增加 CPU 负担
let minY = LH, maxY = 0;
for (let y = 0; y < TH; y += STEP)
  for (let x = 0; x < TW; x += STEP)
    if (pix[(y*TW + x)*4 + 3] > 150){
      const lx = x / TS, ly = y / TS;   // 回到逻辑坐标，BBOX / 粒子归一化不变
      pts.push(lx, ly);
      if (ly < minY) minY = ly;
      if (ly > maxY) maxY = ly;
    }
const PN = pts.length/2;
const BH = Math.max(1, maxY - minY);
const BBOX = [minY/LH, maxY/LH];        // 归一化纹理 y（0=顶部）

// 段边界：按"粒子数等分"而非几何等分。
// 几何等分会让落在行间空白里的那段一个粒子都没有（该段时间画面完全不动）。
// 等分位数保证每段都分到 PN/SEG_N 个粒子，且密集处段自动收窄。
const HB = 512;
const hist = new Int32Array(HB);
for (let i = 0; i < PN; i++){
  const b = Math.min(HB-1, Math.max(0, Math.floor((pts[i*2+1]-minY)/BH*HB)));
  hist[b]++;
}
const EDGE = new Float64Array(SEG_N - 1);      // 内部边界，归一化到 [0,1]
{
  let acc = 0, k = 0;
  const quota = PN / SEG_N;
  for (let b = 0; b < HB && k < SEG_N - 1; b++){
    acc += hist[b];
    while (k < SEG_N - 1 && acc >= quota*(k+1)){ EDGE[k] = (b+1)/HB; k++; }
  }
  for (; k < SEG_N - 1; k++) EDGE[k] = 1;
}
// 每个直方图 bin 属于哪一段（与 shader 的 step 累加保持完全一致）
const lut = new Uint8Array(HB);
for (let b = 0; b < HB; b++){
  const u = (b + 0.5)/HB;
  let s = 0;
  for (let k = 0; k < SEG_N - 1; k++) if (u >= EDGE[k]) s++;
  lut[b] = s;
}

/* ═══════════════════════════════════════════════════════════════
   7. 粒子缓冲（9 floats/particle，一次性建满）
   ═══════════════════════════════════════════════════════════════ */
const data = new Float32Array(PCOUNT * 9);
for (let i = 0; i < PCOUNT; i++){
  const o = i*9;
  // 离子云散开向量（相对目标位置，局部小范围 → "析出"感）
  const ang = Math.random()*Math.PI*2;
  const rad = 0.02 + Math.pow(Math.random(), 0.7)*0.13;
  data[o+0] = Math.cos(ang)*rad;
  data[o+1] = Math.sin(ang)*rad*0.55;

  // 目标：纹理归一化坐标 (-1..1)，y 已翻转为"上正"
  const k = (Math.random()*PN)|0;
  const px = pts[k*2]     + (Math.random()-0.5)*2.0;
  const py = pts[k*2 + 1] + (Math.random()-0.5)*2.0;
  data[o+2] = (px/LW - 0.5)*2;
  data[o+3] = (0.5 - py/LH)*2;

  data[o+4] = Math.random();
  data[o+5] = Math.random();
  data[o+6] = Math.random();
  data[o+7] = Math.random();

  // 所属段：查表（与 shader 一致）
  const b = Math.min(HB-1, Math.max(0, Math.floor((py - minY)/BH*HB)));
  data[o+8] = lut[b];
}
const pbuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

const qbuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, qbuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

/* ═══════════════════════════════════════════════════════════════
   8. FBO / 尺寸
   ═══════════════════════════════════════════════════════════════ */
function makeFBO(w,h){
  const fb = gl.createFramebuffer(), t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { fb, tex:t, w, h };
}
let scene,bA,bB,bC,bD, VW=0,VH=0, ASPECT=1, FIT=1, HALF=[0,0];
const RECT  = [0,1,0,1];          // quad 覆盖范围，随屏幕比例在 resize 里重算
const PIVOT = 1.0 - BBOX[1];      // 文字底边（vUv.y 空间）——倒影的镜像轴

function resize(){
  const w = Math.round(innerWidth*DPR), h = Math.round(innerHeight*DPR);
  if (w===VW && h===VH) return;
  VW=w; VH=h; ASPECT=w/h;
  canvas.width=w; canvas.height=h;
  canvas.style.width = innerWidth+'px';
  canvas.style.height = innerHeight+'px';

  // 文字块：屏幕像素上严格保持纹理的 2:1
  const HX = 2.0*HBASE/ASPECT, HY = HBASE;
  HALF = [HX, HY];

  // quad 必须覆盖"文字块 ∪ 斜倒影行程 ∪ 横向光芒"，否则会被硬裁出直边。
  // 倒影向右下延伸：横向多出 shear*len，纵向多出 len；
  // 扫描条和水天线还要向左右各拖出光芒，左侧必须留到 -LAT_EDGE 之外。
  RECT[0] = Math.min(-0.04, 0.5 - LAT_EDGE - 0.02);
  RECT[1] = Math.max(1.0 + REF.shear*REF.len + 0.04, 0.5 + LAT_EDGE + 0.02);
  RECT[2] = PIVOT - REF.len - 0.02;
  RECT[3] = 1.0;

  // 适配：按 quad 总尺寸（含倒影与光芒）收缩，而不是只按文字块
  const qu = RECT[1]-RECT[0], qv = RECT[3]-RECT[2];
  FIT = Math.min(1, 2.05/(qu*2*HX), 1.62/(qv*2*HY));

  // 把"文字块 + 倒影"这个整体居中：quad 中心对齐屏幕中心。
  // 固定偏移会在窄屏把倒影顶出屏幕（quad 是向右下不对称扩展的）。
  ORIGIN[0] = -(((RECT[0]+RECT[1])*0.5 - 0.5) * 2 * HX * FIT);
  ORIGIN[1] = -(((RECT[2]+RECT[3])*0.5 - 0.5) * 2 * HY * FIT);

  const s = CFG.sceneScale;
  const sw = Math.max(2, Math.round(w*s)), sh = Math.max(2, Math.round(h*s));
  [scene,bA,bB,bC,bD].forEach(f => { if(f){ gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); } });
  scene = makeFBO(sw,sh);
  bA = makeFBO(sw>>1, sh>>1); bB = makeFBO(sw>>1, sh>>1);
  bC = makeFBO(sw>>2, sh>>2); bD = makeFBO(sw>>2, sh>>2);
}
addEventListener('resize', resize);

function bindFBO(f){ gl.bindFramebuffer(gl.FRAMEBUFFER, f?f.fb:null);
                     gl.viewport(0,0, f?f.w:VW, f?f.h:VH); }
function tex(ch,t,loc){ gl.activeTexture(gl.TEXTURE0+ch); gl.bindTexture(gl.TEXTURE_2D,t);
                        gl.uniform1i(loc,ch); }
function quad(p){
  gl.bindBuffer(gl.ARRAY_BUFFER, qbuf);
  gl.enableVertexAttribArray(p.a.aPos);
  gl.vertexAttribPointer(p.a.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/* ═══════════════════════════════════════════════════════════════
   9. 时间轴 —— 所有参数是 t 的纯函数（可 seek / 可跳过）
   ═══════════════════════════════════════════════════════════════ */
const SPAN = 0.42;
const T_HOLD = 3.60;      // 凝结完成 —— 之后不再自动退出，等玩家点击
const c01 = v => v<0?0:v>1?1:v;
const easeOut = v => 1-Math.pow(1-v,3);
const easeIO  = v => v<0.5 ? 4*v*v*v : 1-Math.pow(-2*v+2,3)/2;
const pulse   = (t,at,w) => Math.exp(-Math.pow((t-at)/w,2));

function timeline(t){
  const progress = easeIO(c01((t - 0.22)/2.13));            // 0.22→2.35 逐段推进
  // 扫描线：沿真实段边界插值，才能与逐段推进严格同步（vUv.y：1 在顶部）
  const fi = c01(progress*1.05) * SEG_N;
  const i0 = Math.min(SEG_N-1, Math.floor(fi)), fr = fi - i0;
  const eY = (i0 === 0 ? 0 : EDGE[i0-1]) * (1-fr) + EDGE[i0] * fr;
  const scanY = 1.0 - (BBOX[0] + eY*(BBOX[1] - BBOX[0]));

  const flash  = pulse(t, 2.60, 0.085)*0.95;                // 冲击帧
  const amp    = pulse(t, 2.60, 0.22)*0.020;
  const shockR = (t - 2.60)*1.25;
  const shockA = (t>2.58 && t<3.40) ? (1 - (t-2.58)/0.82) : 0;

  const glitch = Math.min(1, pulse(t,3.05,0.075) + pulse(t,3.23,0.055)*0.75);
  const aber   = pulse(t,2.60,0.45)*1.5 + 0.24 + glitch*1.4;

  const settle  = c01((t - 2.30)/0.65);                     // 粒子沉降为余烬
  // 不再自动退出：文字留在屏幕上，等玩家点击
  const out     = 0;
  const scatter = 0;
  const fade    = 0;
  const energy  = c01(t/2.0)*0.9 + pulse(t,2.60,0.5)*0.5;
  // 波浪扭动：凝结完成后渐入；白色流光再晚一点起
  const wave    = c01((t - T_HOLD)/1.10);
  const stream  = c01((t - T_HOLD - 0.35)/0.85);

  return { progress, scanY, flash, amp, shockR, shockA, glitch, aber,
           settle, out, scatter, fade, energy, wave, stream };
}

/* ═══════════════════════════════════════════════════════════════
   10. 主循环
   ═══════════════════════════════════════════════════════════════ */
const statEl = { classList:{ contains: () => false, toggle: () => {} } };
const TEXEL = [1/TW, 1/TH];   // 一个物理纹素：模板超采样后偏移不能跟着加倍
// 渲染档位诊断（只读，不参与逻辑）：方便实机核对手机端到底用了几倍分辨率
try {
  window.__opDiag = {
    tier: TIER, dpr: +DPR.toFixed(2), sceneScale: CFG.sceneScale,
    particles: PCOUNT, bloom: BLOOM_LV, texScale: TS, texture: [TW, TH],
    render: [Math.round(innerWidth * DPR), Math.round(innerHeight * DPR)]
  };
} catch (e) { /* 忽略 */ }
const SHADOW_OFF = [-0.0050, -0.0100];    // 左下方向（纹理 2:1，u 偏移取半）
let t0 = performance.now(), done = false, S_ready = false;
let frames = 0, acc = 0, fps = 60, slow = 0, last = 0;

// 帧内异常兜底：出错就立刻放行，绝不让玩家卡在开屏
function frame(now){
  if (done) return;
  // 健康游戏忠告还盖在最上面：开场动画这一步先别走。
  // 忠告要占 6 秒，动画要是照跑，等它关掉玩家看到的就是中段，而且不会从头再来 ——
  // 所以这段时间把时间原点一直压在当前帧，忠告一关，t 自然就是从 0 开始。
  if (window.__healthOpen) {
    t0 = now; last = 0;
    requestAnimationFrame(frame);
    return;
  }
  try { frameBody(now); }
  catch (e){ console.warn('[opening] 渲染中断：', e); opDone(); }
}
function frameBody(now){
  if (done) return;
  const t = (now - t0)/1000;
  // 暴露动画进度，方便排查"开屏是不是从头开始播的"
  try { window.__opT = t; } catch (e) { /* 忽略 */ }
  const S = timeline(t);
  resize();

  // 自适应降级：连续掉帧 → 砍粒子 → 关二级 bloom → 降 DPR
  frames++; acc += now - (last||now); last = now;
  if (frames >= 20){
    fps = 1000/(acc/frames); frames = 0; acc = 0;
    if (fps < 42 && slow < 3){
      slow++;
      if (ACTIVE > 20000) ACTIVE = Math.round(ACTIVE*0.62);
      else if (BLOOM_LV > 1) BLOOM_LV = 1;
      if (DPR > 1){ DPR = Math.max(1, DPR-0.35); resize(); }
    }
    if (statEl.classList.contains('on'))
      statEl.innerHTML = `fps       ${fps.toFixed(1)}\nparticles ${ACTIVE.toLocaleString()} / ${PCOUNT.toLocaleString()}` +
        `\ndpr       ${DPR.toFixed(2)}\nbloom lv  ${BLOOM_LV}\ntier      ${TIER}` +
        `\nsegments  ${SEG_N}\nprogress  ${S.progress.toFixed(2)}  scan ${S.scanY.toFixed(2)}`;
  }

  const shakeX = (Math.random()-0.5)*S.amp;
  const shakeY = (Math.random()-0.5)*S.amp*0.8;

  /* ---- 场景 ---- */
  bindFBO(scene);
  gl.disable(gl.BLEND);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(bgP);
  gl.uniform1f(bgP.u.uTime, t);
  gl.uniform1f(bgP.u.uAspect, ASPECT);
  gl.uniform1f(bgP.u.uEnergy, S.energy);
  gl.uniform1f(bgP.u.uFade, S.fade);
  quad(bgP);

  // 离子粒子（加性）
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.useProgram(partP);
  gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
  const st = 9*4;
  gl.enableVertexAttribArray(partP.a.aStart);
  gl.vertexAttribPointer(partP.a.aStart , 2, gl.FLOAT, false, st, 0);
  gl.enableVertexAttribArray(partP.a.aTarget);
  gl.vertexAttribPointer(partP.a.aTarget, 2, gl.FLOAT, false, st, 8);
  gl.enableVertexAttribArray(partP.a.aRand);
  gl.vertexAttribPointer(partP.a.aRand  , 4, gl.FLOAT, false, st, 16);
  gl.enableVertexAttribArray(partP.a.aSeg);
  gl.vertexAttribPointer(partP.a.aSeg   , 1, gl.FLOAT, false, st, 32);
  gl.uniform1f(partP.u.uTime, t);
  gl.uniform1f(partP.u.uProgress, S.progress);
  gl.uniform1f(partP.u.uSpan, SPAN);
  gl.uniform1f(partP.u.uSegN, SEG_N);
  gl.uniform1f(partP.u.uFit, FIT);
  gl.uniform1f(partP.u.uPx, DPR);
  gl.uniform1f(partP.u.uFade, S.fade);
  gl.uniform1f(partP.u.uSettle, S.settle);
  gl.uniform1f(partP.u.uScatter, S.scatter);
  gl.uniform2f(partP.u.uHalf, HALF[0], HALF[1]);
  gl.uniform2f(partP.u.uOrigin, ORIGIN[0], ORIGIN[1]);
  gl.uniform2f(partP.u.uShake, shakeX, shakeY);
  gl.uniform1f(partP.u.uWave, S.wave);
  gl.uniform1f(partP.u.uWaveT, t);
  gl.drawArrays(gl.POINTS, 0, ACTIVE);

  // 文字层（预乘 alpha 正常混合 → 压住身后粒子，保证字口清晰）
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(textP);
  tex(0, artTex, textP.u.uTex);
  gl.uniform2f(textP.u.uTexel, TEXEL[0], TEXEL[1]);
  gl.uniform2f(textP.u.uShadowOff, SHADOW_OFF[0], SHADOW_OFF[1]);
  gl.uniform2f(textP.u.uBBox, BBOX[0], BBOX[1]);
  gl.uniform4f(textP.u.uEdgeA, EDGE[0], EDGE[1], EDGE[2], EDGE[3]);
  gl.uniform4f(textP.u.uEdgeB, EDGE[4], 9, 9, 9);
  gl.uniform2f(textP.u.uHalf, HALF[0], HALF[1]);
  gl.uniform2f(textP.u.uShake, shakeX, shakeY);
  gl.uniform2f(textP.u.uOrigin, ORIGIN[0], ORIGIN[1]);
  gl.uniform4f(textP.u.uRect, RECT[0], RECT[1], RECT[2], RECT[3]);
  gl.uniform1f(textP.u.uFit, FIT);
  gl.uniform1f(textP.u.uProgress, S.progress);
  gl.uniform1f(textP.u.uSpan, SPAN);
  gl.uniform1f(textP.u.uSegN, SEG_N);
  gl.uniform1f(textP.u.uScanY, S.scanY);
  gl.uniform1f(textP.u.uTime, t);
  gl.uniform1f(textP.u.uFade, S.fade);
  gl.uniform1f(textP.u.uOut, S.out);
  gl.uniform1f(textP.u.uShadowStr, 0.58);   // 倒影已承担下方视觉，阴影只留厚度
  gl.uniform1f(textP.u.uBevel, 26.0);
  gl.uniform1f(textP.u.uRefLen, REF.len);
  gl.uniform1f(textP.u.uShear, REF.shear);
  gl.uniform1f(textP.u.uSquash, REF.squash);
  gl.uniform1f(textP.u.uRefStr, REF.str);
  gl.uniform1f(textP.u.uRefBlur, REF.blur);
  gl.uniform1f(textP.u.uRipple, REF.ripple);
  gl.uniform1f(textP.u.uHorizonW, HORIZON.w);
  gl.uniform1f(textP.u.uHorizonStr, HORIZON.str);
  gl.uniform1f(textP.u.uHorizonHalfU, HORIZON.halfU);
  gl.uniform1f(textP.u.uLatEdge, LAT_EDGE);
  gl.uniform1f(textP.u.uWave, S.wave);
  gl.uniform1f(textP.u.uWaveT, t);
  gl.uniform1f(textP.u.uStream, S.stream);
  gl.bindBuffer(gl.ARRAY_BUFFER, qbuf);
  gl.enableVertexAttribArray(textP.a.aPos);
  gl.vertexAttribPointer(textP.a.aPos, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disable(gl.BLEND);

  /* ---- 后期 ---- */
  bindFBO(bA);
  gl.useProgram(brightP);
  tex(0, scene.tex, brightP.u.uScene);
  gl.uniform1f(brightP.u.uThresh, 0.52);
  gl.uniform1f(brightP.u.uKnee, 0.30);
  quad(brightP);

  gl.useProgram(blurP);
  bindFBO(bB); tex(0, bA.tex, blurP.u.uTex);
  gl.uniform2f(blurP.u.uDir, 1.35/bA.w, 0); quad(blurP);
  bindFBO(bA); tex(0, bB.tex, blurP.u.uTex);
  gl.uniform2f(blurP.u.uDir, 0, 1.35/bA.h); quad(blurP);

  if (BLOOM_LV > 1){
    bindFBO(bC); tex(0, bA.tex, blurP.u.uTex);
    gl.uniform2f(blurP.u.uDir, 2.6/bC.w, 0); quad(blurP);
    bindFBO(bD); tex(0, bC.tex, blurP.u.uTex);
    gl.uniform2f(blurP.u.uDir, 0, 2.6/bC.h); quad(blurP);
    bindFBO(bC); tex(0, bD.tex, blurP.u.uTex);
    gl.uniform2f(blurP.u.uDir, 0, 2.6/bC.h); quad(blurP);
  }

  bindFBO(null);
  gl.useProgram(compP);
  tex(0, scene.tex, compP.u.uScene);
  tex(1, bA.tex, compP.u.uB1);
  tex(2, (BLOOM_LV>1 ? bC : bA).tex, compP.u.uB2);
  gl.uniform2f(compP.u.uRes, VW, VH);
  gl.uniform2f(compP.u.uShake, shakeX*0.35, shakeY*0.35);
  gl.uniform1f(compP.u.uTime, t);
  gl.uniform1f(compP.u.uFlash, S.flash);
  gl.uniform1f(compP.u.uGlitch, S.glitch);
  gl.uniform1f(compP.u.uShockR, S.shockR);
  gl.uniform1f(compP.u.uShockA, S.shockA);
  gl.uniform1f(compP.u.uAber, S.aber);
  gl.uniform1f(compP.u.uFade, S.fade);
  gl.uniform1f(compP.u.uBloom, 1.00);
  gl.uniform1f(compP.u.uB2mix, BLOOM_LV>1 ? 0.80 : 0.0);
  quad(compP);

  // 波浪态到了就亮出提示，之后一直循环等玩家点击
  if (t >= T_HOLD) S_ready = true;
  if (S.wave >= 1 && tipEl && !tipOn){ tipOn = true; tipEl.classList.add('on'); }
  if (!done) requestAnimationFrame(frame);
}

const tipEl = document.getElementById('op-tip');
let tipOn = false;

// 从中间分开、上下折叠，露出下面的主菜单
function foldOpen(){
  if (done) return;
  // 手机上关掉了 preserveDrawingBuffer，缓冲在合成后就失效了 ——
  // 直接 toDataURL 拿到的会是全黑，折叠出来就是两片黑方块。
  // 所以这里先同步补画一帧，紧接着立刻截图（同一个 tick 内缓冲还在）。
  try { if (!_PDB) frameBody(performance.now()); } catch (e) { /* 忽略 */ }
  done = true;                                // 补完再停循环，画面定格
  const host = document.getElementById('opening');
  if (!host){ if (window.__opDone) window.__opDone(); return; }

  let url = '';
  try { url = canvas.toDataURL('image/png'); } catch (e) { url = ''; }

  if (url){
    const mk = (cls) => { const d = document.createElement('div');
      d.className = 'op-half ' + cls;
      const im = document.createElement('img'); im.src = url; d.appendChild(im);
      host.appendChild(d); return d; };
    mk('op-top'); mk('op-bot');
    canvas.style.display = 'none';
    if (tipEl) tipEl.style.display = 'none';
    // 强制回流，保证 transition 生效
    void host.offsetWidth;
    // 折叠过程中主菜单就已经在下面了 —— 分开时看见的才是它
    var m = document.getElementById('menu');
    if (m) m.classList.remove('hidden');
    host.classList.add('folding');
  }
  // 折叠一結束就交还控制权 —— 主菜单已经在下面等着了
  setTimeout(() => {
    host.classList.add('gone');
    // 折叠完之后把 WebGL 上下文彻底释放：这层全屏画布 + 几个 bloom 缓冲
    // 一直挂着会占着显存，进游戏头几秒就会掉帧。
    try {
      const lose = gl && gl.getExtension && gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) { /* 忽略 */ }
    try { if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); } catch (e) { /* 忽略 */ }
    if (window.__opDone) window.__opDone();
  }, url ? 820 : 0);
}

// 忠告画面还开着的时候，点屏幕是在关忠告 —— 不能顺手把开屏也折了
addEventListener('pointerdown', () => { if (S_ready && !window.__healthOpen) foldOpen(); });
addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' '){ if (S_ready && !window.__healthOpen) foldOpen(); }
});

// ---------- 上下文丢失兜底 ----------
// 手机上切后台、来电、内存吃紧都会丢 WebGL 上下文。默认情况下画布就此变黑
// 且不再恢复 —— 玩家只能干等 20 秒超时。丢了就直接放行到主菜单。
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  try { if (window.__opFallback) window.__opFallback(); } catch (err) { /* 忽略 */ }
}, false);

resize();
requestAnimationFrame(frame);
  })();
} catch (e) {
  // 初始化失败（着色器编译不过、显卡不支持等）→ 直接进主菜单，别卡住
  console.warn('[opening] 初始化失败，直接进入主菜单：', e);
  opDone();
}
})();
