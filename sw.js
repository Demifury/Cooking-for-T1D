var MAGAZYN='kuchnia-t1d-903df6a1';
var PLIKI=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];

var KONIECZNE=['./','./index.html'];

// Pobieramy z pominieciem pamieci HTTP, zeby nie zapisac starej kopii.
// Bez strony nie ma aktualizacji; ikona czy manifest nie moga jej wstrzymac.
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(MAGAZYN).then(function(c){
    return Promise.all(PLIKI.map(function(u){
      var pobierz=fetch(new Request(u,{cache:'reload'})).then(function(r){
        if(!r||!r.ok)throw new Error('nie pobrano '+u);
        return c.put(u,r);
      });
      return KONIECZNE.indexOf(u)>-1?pobierz:pobierz.catch(function(){});
    }));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n.indexOf('kuchnia-t1d-')===0&&n!==MAGAZYN;}).map(function(n){return caches.delete(n);}));
  }).then(function(){return self.clients.claim();}));
});

// Strona: najpierw siec, zeby nowa wersja wchodzila od razu.
// Gdy siec milczy dluzej niz 2,5 s albo pada - kopia z pamieci.
function strona(req){
  return new Promise(function(gotowe){
    var oddane=false;
    function oddaj(r){ if(!oddane&&r){oddane=true;gotowe(r);} }
    var zegar=setTimeout(function(){
      caches.match('./index.html').then(oddaj);
    },2500);
    fetch(req).then(function(r){
      clearTimeout(zegar);
      if(r&&r.ok){
        var kopia=r.clone();
        caches.open(MAGAZYN).then(function(c){c.put('./index.html',kopia);});
        oddaj(r);
        return;
      }
      // serwer odpowiedzial bledem - kopia z pamieci jest lepsza niz strona bledu
      caches.match('./index.html').then(function(o){oddaj(o||r);});
    }).catch(function(){
      clearTimeout(zegar);
      caches.match('./index.html').then(function(o){
        oddaj(o||new Response('Brak polaczenia i brak kopii offline.',
          {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}));
      });
    });
  });
}

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'||(req.headers.get('accept')||'').indexOf('text/html')>-1){
    e.respondWith(strona(req));
    return;
  }
  e.respondWith(caches.match(req).then(function(o){
    return o||fetch(req).then(function(r){
      if(r&&r.ok){
        var kopia=r.clone();
        caches.open(MAGAZYN).then(function(c){try{c.put(req,kopia);}catch(x){}});
      }
      return r;
    });
  }));
});
