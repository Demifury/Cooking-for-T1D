var MAGAZYN='kuchnia-t1d-e35bb109';
var PLIKI=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(MAGAZYN).then(function(c){return c.addAll(PLIKI);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==MAGAZYN;}).map(function(n){return caches.delete(n);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(function(o){
    return o||fetch(e.request).then(function(r){
      var kopia=r.clone();
      caches.open(MAGAZYN).then(function(c){try{c.put(e.request,kopia);}catch(x){}});
      return r;
    }).catch(function(){return caches.match('./index.html');});
  }));
});
