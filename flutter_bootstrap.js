// Custom Flutter web bootstrap.
//
// Flutter 3.4x ships only a self-unregistering legacy service worker, so this
// file boots the engine without registering that stub and registers the app's
// own offline worker (web/sw.js) once the page has loaded.
//
// It also owns the browser half of the in-app PWA experience. Two events have
// no Flutter binding: `beforeinstallprompt` (the install button) and a service
// worker that installed while a page was already open (the update banner).
// Both are exposed on `window.lagiButuhPwa` and announced with a
// `lagibutuh-pwa-state` event that lib/core/pwa listens to.
//
// It also owns browser notifications for the open tab. Supabase Realtime hands
// Dart the `notifications` row, and lib/core/notify asks this bridge to show
// it — so an active or backgrounded tab gets a system notification without a
// push server or a VAPID key. A click comes back as a
// `lagibutuh-notification-click` event carrying the same ids the FCM payload
// would.
//
// The two brace tokens below are replaced by the build and must keep their
// exact spelling — see
// https://docs.flutter.dev/platform-integration/web/initialization
(()=>{var T=()=>WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,95,1,120,0]))&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))&&!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),{builtins:["js-string"]})&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,13,1,11,0,2,64,31,64,1,2,0,11,11,11]));var _={blink:!0,gecko:!1,webkit:!1,unknown:!1},F=()=>navigator.vendor==="Google Inc."||navigator.userAgent.includes("Edg/")?"blink":navigator.vendor==="Apple Computer, Inc."?"webkit":navigator.vendor===""&&navigator.userAgent.includes("Firefox")?"gecko":"unknown",C=F(),K=()=>typeof ImageDecoder>"u"?!1:C==="blink",B=()=>typeof Intl.v8BreakIterator<"u"&&typeof Intl.Segmenter<"u",D=()=>typeof window.TextCluster<"u",$=()=>{let n=navigator.userAgent.match(/firefox\/(\d+)/i);return n?parseInt(n[1],10):-1},O=()=>C==="gecko"&&$()<147?!1:window._flutter?.supportsDart2Wasm??T(),M=()=>{let n=document.createElement("canvas");return n.width=1,n.height=1,n.getContext("webgl2")!=null?2:n.getContext("webgl")!=null?1:-1},H=()=>window.chrome&&chrome.runtime&&chrome.runtime.id,g={browserEngine:C,hasImageCodecs:K(),hasChromiumBreakIterators:B(),hasTextCluster:D(),get supportsDart2Wasm(){return O()},crossOriginIsolated:window.crossOriginIsolated,webGLVersion:M(),isChromeExtension:H()};function w(...n){return new URL(E(...n),document.baseURI).toString()}function E(...n){return n.filter(e=>!!e).map((e,s)=>s===0?I(e):z(I(e))).filter(e=>e.length).join("/")}function z(n){let e=0;for(;e<n.length&&n.charAt(e)==="/";)e++;return n.substring(e)}function I(n){let e=n.length;for(;e>0&&n.charAt(e-1)==="/";)e--;return n.substring(0,e)}function U(n,e){return n.canvasKitBaseUrl?n.canvasKitBaseUrl:e.engineRevision&&!e.useLocalCanvasKit?E("https://www.gstatic.com/flutter-canvaskit",e.engineRevision):"canvaskit"}var y=class{constructor(){this._scriptLoaded=!1}setTrustedTypesPolicy(e){this._ttPolicy=e}async loadEntrypoint(e){let{entrypointUrl:s=w("main.dart.js"),onEntrypointLoaded:r,nonce:t}=e||{};return this._loadJSEntrypoint(s,r,t)}async load(e,s,r,t,i){i??=d=>{d.initializeEngine(r).then(u=>u.runApp())};let{entrypointBaseUrl:a}=r,{entryPointBaseUrl:l}=r;if(!a&&l&&(console.warn("[deprecated] `entryPointBaseUrl` is deprecated and will be removed in a future release. Use `entrypointBaseUrl` instead."),a=l),e.compileTarget==="dart2wasm")return this._loadWasmEntrypoint(e,s,a,i,r?.wasmDeferredModulesLoader);{let d=e.mainJsPath??"main.dart.js",u=w(a,d);return this._loadJSEntrypoint(u,i,t)}}didCreateEngineInitializer(e){typeof this._didCreateEngineInitializerResolve=="function"&&(this._didCreateEngineInitializerResolve(e),this._didCreateEngineInitializerResolve=null,delete _flutter.loader.didCreateEngineInitializer),typeof this._onEntrypointLoaded=="function"&&this._onEntrypointLoaded(e)}_loadJSEntrypoint(e,s,r){let t=typeof s=="function";if(!this._scriptLoaded){this._scriptLoaded=!0;let i=this._createScriptTag(e,r);if(t)console.debug("Injecting <script> tag. Using callback."),this._onEntrypointLoaded=s,document.head.append(i);else return new Promise((a,l)=>{console.debug("Injecting <script> tag. Using Promises. Use the callback approach instead!"),this._didCreateEngineInitializerResolve=a,i.addEventListener("error",l),document.head.append(i)})}}async _loadWasmEntrypoint(e,s,r,t,i){if(!this._scriptLoaded){this._scriptLoaded=!0,this._onEntrypointLoaded=t;let{mainWasmPath:a,jsSupportRuntimePath:l}=e,d=w(r,a),u=w(r,l);this._ttPolicy!=null&&(u=this._ttPolicy.createScriptURL(u));let p=(await import(u)).compileStreaming(fetch(d)),o;e.renderer==="skwasm"?o=(async()=>{let h=await s.skwasm;return window._flutter_skwasmInstance=h,{skwasm:h.wasmExports,skwasmWrapper:h,ffi:{memory:h.wasmMemory}}})():o=Promise.resolve({});let f=await p,v=(h,R)=>Promise.all(h.map(L=>fetch(w(r,L)).then(j=>R(L,j))));await(await f.instantiate(await o,{loadDeferredModules:i||v})).invokeMain()}}_createScriptTag(e,s){let r=document.createElement("script");r.type="application/javascript",s&&(r.nonce=s);let t=e;return this._ttPolicy!=null&&(t=this._ttPolicy.createScriptURL(e)),r.src=t,r}};async function P(n,e,s){if(e<0)return n;let r,t=new Promise((i,a)=>{r=setTimeout(()=>{a(new Error(`${s} took more than ${e}ms to resolve. Moving on.`,{cause:P}))},e)});return Promise.race([n,t]).finally(()=>{clearTimeout(r)})}var b=class{setTrustedTypesPolicy(e){this._ttPolicy=e}loadServiceWorker(e){if(!e||!("serviceWorker"in navigator))return Promise.resolve();let s=()=>{console.warn(`Loading the service worker using Flutter bootstrap is deprecated and will stop working in a future release.
For more details, see: https://github.com/flutter/flutter/issues/156910`)},r=()=>{let{serviceWorkerVersion:t,serviceWorkerUrl:i=w(`flutter_service_worker.js?v=${t}`),timeoutMillis:a=4e3}=e,l=i;this._ttPolicy!=null&&(l=this._ttPolicy.createScriptURL(l));let d=navigator.serviceWorker.register(l).then(u=>this._getNewServiceWorker(u,t)).then(this._waitForServiceWorkerActivation);return P(d,a,"prepareServiceWorker")};return e.serviceWorkerUrl!=null?(s(),r()):navigator.serviceWorker.getRegistration().then(t=>t?r():Promise.resolve())}async _getNewServiceWorker(e,s){if(!e.active&&(e.installing||e.waiting))return console.debug("Installing/Activating first service worker."),e.installing||e.waiting;if(e.active.scriptURL.endsWith(s))return console.debug("Loading from existing service worker."),e.active;{let r=await e.update();return console.debug("Updating service worker."),r.installing||r.waiting||r.active}}async _waitForServiceWorkerActivation(e){if(!e||e.state==="activated")if(e){console.debug("Service worker already active.");return}else throw new Error("Cannot activate a null service worker!");return new Promise((s,r)=>{e.addEventListener("statechange",()=>{e.state==="activated"&&(console.debug("Activated new service worker."),s())})})}};var k=class{constructor(e,s="flutter-js"){let r=e||[/\.js$/,/\.mjs$/];window.trustedTypes&&(this.policy=trustedTypes.createPolicy(s,{createScriptURL:function(t){if(t.startsWith("blob:"))return t;let i=new URL(t,window.location),a=i.pathname.split("/").pop();if(r.some(d=>d.test(a)))return i.toString();console.error("URL rejected by TrustedTypes policy",s,":",t,"(download prevented)")}}))}};var S=(n,e)=>{let s=window._flutter?.buildConfig?.wasmHashes,r=s?.[e];if(!r&&e?.includes("/")){let c=e.split("/").pop();r=s?.[c]}let t=!!navigator.crossOriginStorage?.getFileHandle;t&&console.log("Cross-Origin Storage is supported. See https://wicg.github.io/cross-origin-storage/ for more details.");let i={headers:{"Content-Type":"application/wasm"}},a=async c=>{let p={algorithm:"SHA-256",value:c};try{let f=await(await navigator.crossOriginStorage.getFileHandle(p)).getFile();return new Response(f.stream(),i)}catch(o){o&&o.name!=="NotFoundError"&&o.name!=="NotAllowedError"&&console.warn("Unexpected error during retrieval of "+e+" (hash: "+c+").",o)}},l=(c,p)=>{let o={algorithm:"SHA-256",value:c};(async()=>{try{let v=await(await navigator.crossOriginStorage.getFileHandle(o,{create:!0,origins:"*"})).createWritable();await p.pipeTo(v)}catch(f){p.cancel().catch(()=>{}),console.warn(`Error storing ${e} (hash: ${c}):`,f)}})()},d=async()=>{if(t&&r){let p=await a(r);if(p)return p}let c=await fetch(n);if(t&&r&&c.ok&&c.body){let[p,o]=c.body.tee();return l(r,o),new Response(p,i)}return c},u=WebAssembly.compileStreaming(d());return(c,p)=>((async()=>{let o=await u,f=await WebAssembly.instantiate(o,c);p(f,o)})(),{})};var A=(n,e,s,r)=>(window.flutterCanvasKitLoaded=(async()=>{if(window.flutterCanvasKit)return window.flutterCanvasKit;let t=s.hasChromiumBreakIterators&&s.hasImageCodecs;if(!t&&e.canvasKitVariant=="chromium")throw"Chromium CanvasKit variant specifically requested, but unsupported in this browser";let i=t&&e.canvasKitVariant!=="full",a=i&&e.preferWebParagraph&&s.hasTextCluster,l=r;a?l=w(l,"webparagraph"):i&&(l=w(l,"chromium"));let d=w(l,"canvaskit.js");n.flutterTT.policy&&(d=n.flutterTT.policy.createScriptURL(d));let u="canvaskit.wasm";a?u="webparagraph/canvaskit.wasm":i&&(u="chromium/canvaskit.wasm");let c=S(w(l,"canvaskit.wasm"),u),p=await import(d);return window.flutterCanvasKit=await p.default({instantiateWasm:c}),window.flutterCanvasKit})(),window.flutterCanvasKitLoaded);var x=async(n,e,s,r)=>{let t=!s.hasImageCodecs||!s.hasChromiumBreakIterators;t&&e.enableWimp&&console.error("Flutter Web: wimp_heavy is required but it hasn't been implemented yet.");let i=t?"skwasm_heavy":e.enableWimp?"wimp":"skwasm",a=w(r,`${i}.js`),l=a;n.flutterTT.policy&&(l=n.flutterTT.policy.createScriptURL(l));let d=S(w(r,`${i}.wasm`),`${i}.wasm`),u=await import(l);return!s.crossOriginIsolated&&!e.forceSingleThreadedSkwasm&&!e.suppressMultithreadingWarning&&console.warn(`Flutter Web: Skwasm uses multi-threading and web workers for better performance, but your page needs to be cross-origin isolated to support multi-threading. Skwasm will run in single-threaded mode.
To enable multithreading, serve your app with these HTTP response headers:
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
See https://web.dev/articles/coop-coep for guidance.
To silence this warning, set \`suppressMultithreadingWarning: true\` in your Flutter configuration.`),await u.default({skwasmSingleThreaded:!s.crossOriginIsolated||s.isChromeExtension||e.forceSingleThreadedSkwasm,instantiateWasm:d,locateFile:(c,p)=>c.endsWith(".ww.js")?URL.createObjectURL(new Blob([`
"use strict";

let eventListener;
eventListener = (message) => {
    const pendingMessages = [];
    const data = message.data;
    data["instantiateWasm"] = (info,receiveInstance) => {
        const instance = new WebAssembly.Instance(data["wasm"], info);
        return receiveInstance(instance, data["wasm"])
    };
    import(data.js).then(async (skwasm) => {
        await skwasm.default(data);

        removeEventListener("message", eventListener);
        for (const message of pendingMessages) {
            dispatchEvent(message);
        }
    });
    removeEventListener("message", eventListener);
    eventListener = (message) => {

        pendingMessages.push(message);
    };

    addEventListener("message", eventListener);
};
addEventListener("message", eventListener);
`],{type:"application/javascript"})):w(r,c),mainScriptUrlOrBlob:a})};var W=class{async loadEntrypoint(e){let{serviceWorker:s,...r}=e||{},t=new k,i=new b;i.setTrustedTypesPolicy(t.policy),await i.loadServiceWorker(s).catch(l=>{console.warn("Exception while loading service worker:",l)});let a=new y;return a.setTrustedTypesPolicy(t.policy),this.didCreateEngineInitializer=a.didCreateEngineInitializer.bind(a),a.loadEntrypoint(r)}async load({serviceWorkerSettings:e,onEntrypointLoaded:s,nonce:r,config:t}={}){t??={};let i=_flutter.buildConfig;if(!i)throw"FlutterLoader.load requires _flutter.buildConfig to be set";let a=g.supportsDart2Wasm,l=t.wasmAllowList?.[g.browserEngine]??_[g.browserEngine],d=m=>{switch(m){case"skwasm":return a?g.webGLVersion>0?null:"Skwasm requires WebGL support; this browser does not provide it.":"Skwasm requires WebAssembly features (WasmGC, SIMD, js-string builtins, try_table) that this browser does not support.";default:return null}},u=m=>{if(m.compileTarget==="dart2wasm"){if(!a)return"dart2wasm requires WebAssembly features (WasmGC, SIMD, js-string builtins, try_table) that this browser does not support.";if(!l)return t.wasmAllowList?.[g.browserEngine]===!1?`WebAssembly is disabled by your wasmAllowList configuration for browser engine "${g.browserEngine}".`:`WebAssembly is disabled by default for browser engine "${g.browserEngine}".`}return t.renderer&&t.renderer!=m.renderer?`The application is configured to use the "${t.renderer}" renderer; this build targets "${m.renderer}".`:d(m.renderer)},c,p=[];for(let m of i.builds){let h=u(m);if(h===null){c=m;break}p.push({candidate:m,reason:h})}if(t.verboseBuildSelection)for(let m of p)console.warn(`Flutter Web: build ${m.candidate.compileTarget}/${m.candidate.renderer} was skipped: ${m.reason}`);if(!c)throw console.warn("Flutter Web: no compatible build found for this browser."+(t.verboseBuildSelection?"":" Set `verboseBuildSelection: true` in your Flutter configuration to see why each candidate was rejected.")),new Error("FlutterLoader could not find a build compatible with configuration and environment.");let o={};o.flutterTT=new k,e&&(o.serviceWorkerLoader=new b,o.serviceWorkerLoader.setTrustedTypesPolicy(o.flutterTT.policy),await o.serviceWorkerLoader.loadServiceWorker(e).catch(m=>{console.warn("Exception while loading service worker:",m)}));let f=U(t,i);c.renderer==="canvaskit"?o.canvasKit=A(o,t,g,f):c.renderer==="skwasm"&&(o.skwasm=x(o,t,g,f));let v=new y;return v.setTrustedTypesPolicy(o.flutterTT.policy),this.didCreateEngineInitializer=v.didCreateEngineInitializer.bind(v),v.load(c,o,t,r,s)}};window._flutter||(window._flutter={});window._flutter.loader||(window._flutter.loader=new W);})();
//# sourceMappingURL=flutter.js.map

if (!window._flutter) {
  window._flutter = {};
}
_flutter.buildConfig = {"engineRevision":"4d35714800b9266b6693a58e1225ecd7e9e45ed7","wasmHashes":{"webparagraph/canvaskit.wasm":"01f0337c620a2afe20b92578ab5ec8db8e5bb6eccdef751d30bac9d1d683988e","canvaskit.wasm":"f3c2ff164f324217ebe1d84900110e425c0195fc63f34e8b58de842a047e0c1c","wimp.wasm":"01d9aac38a88f55db167d4318932f568a421a1a402b13585789bedecf5f731fd","skwasm.wasm":"eee8d9962314004a929380cfcc44ccdec7319710647529265fb9abd3a05cc2a7","skwasm_heavy.wasm":"7f038b46cf04e0237a80a506cfab62af7195d487a4a00949c99274737a88373b","chromium/canvaskit.wasm":"e269e717aad848981ed07db8573b4f7923ccd557d2e696f2944f541f4ff3df9f","main.dart.14530737.wasm":"14530737c51a6853185b4b24b6c0c44f41b287feac8560d737df04e09825a565"},"builds":[{"compileTarget":"dart2wasm","renderer":"skwasm","mainWasmPath":"main.dart.14530737.wasm","jsSupportRuntimePath":"main.dart.ed31b2ab.mjs"},{"compileTarget":"dart2js","renderer":"canvaskit","mainJsPath":"main.dart.c708d230.js"}],"useLocalCanvasKit":true,"assetManifest":"AssetManifest.bin.94533135.json","fontManifest":"FontManifest.41f38bb5.json","extraAssets":{"NOTICES":"NOTICES.b0cc8864","fonts/MaterialIcons-Regular.otf":"fonts/MaterialIcons-Regular.78384fac.otf","fonts/fallback/Roboto-Regular.ttf":"fonts/fallback/Roboto-Regular.79e85140.ttf","shaders/ink_sparkle.frag":"shaders/ink_sparkle.2dca5ab9.frag","shaders/stretch_effect.frag":"shaders/stretch_effect.ab412f07.frag","FontManifest.json":"FontManifest.41f38bb5.json","AssetManifest.bin":"AssetManifest.62d70950.bin"}};
_flutter.supportsDart2Wasm = (WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,95,1,120,0]))&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))&&!WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,2,23,1,14,119,97,115,109,58,106,115,45,115,116,114,105,110,103,4,99,97,115,116,0,0]),{"builtins":["js-string"]})&&WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,13,1,11,0,2,64,31,64,1,2,0,11,11,11])));


const pwaState = {
  canInstall: false,
  updateAvailable: false,
  installed: false,
};

let installPrompt = null;
let workerRegistration = null;

function emitPwaState() {
  window.dispatchEvent(
    new CustomEvent('lagibutuh-pwa-state', { detail: { ...pwaState } }),
  );
}

window.addEventListener('beforeinstallprompt', (event) => {
  // Handling the event suppresses Chrome's own mini info bar: the install
  // button inside the app is the single entry point.
  event.preventDefault();
  installPrompt = event;
  pwaState.canInstall = true;
  emitPwaState();
});

window.addEventListener('appinstalled', () => {
  installPrompt = null;
  pwaState.canInstall = false;
  pwaState.installed = true;
  emitPwaState();
});

window.lagiButuhPwa = {
  get canInstall() {
    return pwaState.canInstall;
  },
  get updateAvailable() {
    return pwaState.updateAvailable;
  },
  get installed() {
    return pwaState.installed;
  },
  // Resolves to 'accepted', 'dismissed' or 'unavailable'.
  install: async function () {
    const prompt = installPrompt;
    if (!prompt) return 'unavailable';
    // The prompt is single-use; a dismissal cannot be replayed without a new
    // beforeinstallprompt, so the button hides until the browser fires one.
    installPrompt = null;
    pwaState.canInstall = false;
    emitPwaState();
    prompt.prompt();
    const choice = await prompt.userChoice;
    return choice.outcome;
  },
  applyUpdate: function () {
    const waiting = workerRegistration && workerRegistration.waiting;
    if (!waiting) return;
    // Reload only after the new worker controls the page; reloading first
    // would boot the same old assets again.
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      function () {
        window.location.reload();
      },
      { once: true },
    );
    waiting.postMessage({ type: 'SKIP_WAITING' });
  },
};

// ---------------------------------------------------------------------------
// Browser notifications
// ---------------------------------------------------------------------------

function parseNotificationData(raw) {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function notifyOptions(body, tag, data) {
  return {
    body: body,
    tag: tag,
    data: data,
    // The card artwork keeps the colour logo, but `badge` is the status-bar
    // slot: Android renders it as an alpha mask tinted by the system, so a
    // full-bleed colour image there paints a solid square instead of a
    // silhouette. badge-96.png is the monochrome bell for exactly that slot.
    icon: 'icons/Icon-192.png',
    badge: 'icons/badge-96.png',
  };
}

function emitNotificationClick(data) {
  window.dispatchEvent(
    new CustomEvent('lagibutuh-notification-click', { detail: data }),
  );
}

function notificationsSupported() {
  return typeof window.Notification !== 'undefined';
}

window.lagiButuhNotify = {
  get supported() {
    return notificationsSupported();
  },
  get permission() {
    return notificationsSupported() ? Notification.permission : 'unsupported';
  },
  // Resolves to the permission the browser reports afterwards, so a dismissal
  // and a refusal are both answers rather than errors.
  request: function () {
    if (!notificationsSupported()) return Promise.resolve('unsupported');
    if (Notification.permission !== 'default') {
      return Promise.resolve(Notification.permission);
    }
    try {
      return Notification.requestPermission();
    } catch (error) {
      return Promise.resolve(Notification.permission);
    }
  },
  show: function (title, body, tag, dataJson) {
    if (!notificationsSupported() || Notification.permission !== 'granted') {
      return;
    }
    const options = notifyOptions(body, tag, parseNotificationData(dataJson));
    try {
      // Desktop browsers let the page own the notification, which keeps the
      // click handler here and the tab's Flutter state intact.
      const note = new Notification(title, options);
      note.onclick = function () {
        window.focus();
        note.close();
        emitNotificationClick(options.data);
      };
      return;
    } catch (error) {
      // Mobile Chrome rejects `new Notification()`: a page must ask the
      // service worker to display it instead.
    }
    if (!navigator.serviceWorker) return;
    navigator.serviceWorker.ready
      .then(function (registration) {
        return registration.showNotification(title, options);
      })
      .catch(function () {});
  },
};

// A notification the service worker displayed is clicked there; sw.js focuses
// this tab and posts the payload back, so the Flutter side has one entry point
// regardless of who drew the notification.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function (event) {
    const message = event.data;
    if (!message || message.type !== 'notification-click') return;
    emitNotificationClick(message.data || {});
  });
}

function watchWorkerRegistration(registration) {
  function noteInstalled(worker) {
    if (worker.state !== 'installed') return;
    // The very first install has no controller, so there is nothing to update.
    if (!navigator.serviceWorker.controller) return;
    pwaState.updateAvailable = true;
    emitPwaState();
  }

  if (registration.waiting) noteInstalled(registration.waiting);
  registration.addEventListener('updatefound', function () {
    const installing = registration.installing;
    if (!installing) return;
    installing.addEventListener('statechange', function () {
      noteInstalled(installing);
    });
  });
}

function registerOfflineWorker() {
  // `updateViaCache: 'none'` keeps the HTTP cache from hiding a new sw.js, so
  // the byte change a deploy makes is always noticed.
  navigator.serviceWorker
    .register('sw.js', { updateViaCache: 'none' })
    .then(function (registration) {
      workerRegistration = registration;
      watchWorkerRegistration(registration);

      // A tab can stay open for days. Re-check when it becomes visible so a
      // deploy raises the update banner without a manual reload.
      let lastCheck = 0;
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') return;
        const now = Date.now();
        if (now - lastCheck < 60000) return;
        lastCheck = now;
        registration.update().catch(function () {});
      });
    })
    .catch(function (error) {
      console.warn('Service worker registration failed:', error);
    });
}

// The boot splash in index.html covers the engine download. Once the app has
// started it fades out and is removed, so a slow first load shows progress
// instead of an empty green page.
_flutter.loader.load({
  config: {
    // Flutter 3.50 runs the Wasm build on Safari 26.2+ and Firefox 147+
    // instead of falling back to JavaScript (Chromium already defaults to
    // Wasm). Older engines still take the JS fallback this build ships.
    wasmAllowList: {
      blink: true,
      webkit: true,
      gecko: true,
    },
  },
}).then(function () {
  const boot = document.getElementById('boot');
  if (boot) {
    boot.classList.add('boot-done');
    setTimeout(function () {
      boot.remove();
    }, 300);
  }
  warmEngineCache();
});

// Hands the engine files this page actually loaded to the service worker, which
// stores them in its build-versioned cache. The next visit then boots with no
// network: without this the worker only sees a request once it already controls
// the page, so the engine would be re-downloaded on every visit until a second
// load happened to fill the cache.
function warmEngineCache() {
  if (!('serviceWorker' in navigator)) return;
  // Entrypoints are content-hashed (`main.dart.<hash>.wasm`) since the
  // --web-content-hash build; the optional segment keeps older builds warm too.
  const pattern =
    /(?:^|\/)(?:flutter\.js|main\.dart\.(?:[0-9a-f]{8}\.)?(?:js|wasm|mjs)|canvaskit\/[^/]+)$/;
  const urls = performance
    .getEntriesByType('resource')
    .map(function (entry) {
      return entry.name;
    })
    .filter(function (url) {
      return pattern.test(new URL(url).pathname);
    });
  if (!urls.length) return;

  const send = function (worker) {
    if (worker) worker.postMessage({ type: 'warm-engine', urls: urls });
  };
  // On a first visit the worker installs and claims the page while the engine
  // is still loading, so it is often not the controller yet at this point.
  // Waiting for it to activate is what makes the *second* load fast.
  const controller = navigator.serviceWorker.controller;
  if (controller) {
    send(controller);
    return;
  }
  navigator.serviceWorker.ready.then(function (registration) {
    send(registration.active);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', registerOfflineWorker);
}
