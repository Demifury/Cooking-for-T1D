var MAGAZYN='kuchnia-t1d-bb7fc9e9';
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

// Po przejeciu kontroli odswiezamy otwarte okna, ale tylko gdy nowa wersja
// zastapila stara. Dziala tez dla okien ze starym kodem strony, ktory sam
// by sie nie przeladowal. Nawigacji nie czekamy - jej zadanie trafia do tego
// samego service workera i czekaloby na koniec aktywacji.
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    var stare=k.filter(function(n){return n.indexOf('kuchnia-t1d-')===0&&n!==MAGAZYN;});
    return Promise.all(stare.map(function(n){return caches.delete(n);})).then(function(){
      return self.clients.claim();
    }).then(function(){
      if(!stare.length)return;
      return self.clients.matchAll({type:'window'}).then(function(okna){
        okna.forEach(function(o){if(o.navigate)o.navigate(o.url).catch(function(){});});
      });
    });
  }));
});

function toStrona(url){
  var u=url.split('#')[0].split('?')[0],z=self.registration.scope;
  return u===z||u===z+'index.html';
}

function zPamieci(){return caches.match('./index.html');}

function bezKopii(){
  return new Response('Brak połączenia i brak kopii offline.',
    {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
}

// Strona: najpierw siec, zeby nowa wersja wchodzila od razu. Czekamy na CALA
// tresc, nie tylko na naglowki - inaczej przy slabym zasiegu strona moglaby
// zawisnac w polowie. Po 2,5 s ciszy, bez sieci albo przy zlej odpowiedzi
// idzie kopia z pamieci, a swieza i tak zapisze sie w tle.
function strona(e){
  var pobranie=fetch(e.request).then(function(r){
    if(!r||!r.ok||r.redirected)throw new Error('zla odpowiedz');
    var typ=r.headers.get('content-type')||'';
    if(typ.indexOf('text/html')!==0)throw new Error('to nie strona');
    return r.blob().then(function(b){return {b:b,typ:typ};});
  });
  e.waitUntil(pobranie.then(function(x){
    return caches.open(MAGAZYN).then(function(c){
      return c.put('./index.html',new Response(x.b,{headers:{'Content-Type':x.typ}}));
    });
  }).catch(function(){}));
  return new Promise(function(gotowe){
    var oddane=false;
    function oddaj(r){if(!oddane&&r){oddane=true;gotowe(r);}}
    var zegar=setTimeout(function(){zPamieci().then(oddaj,function(){});},2500);
    pobranie.then(function(x){
      clearTimeout(zegar);
      oddaj(new Response(x.b,{headers:{'Content-Type':x.typ}}));
    },function(){
      clearTimeout(zegar);
      zPamieci().then(function(o){oddaj(o||bezKopii());},function(){oddaj(bezKopii());});
    });
  });
}

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  if(req.mode==='navigate'){
    if(toStrona(req.url)){e.respondWith(strona(e));return;}
    // inna nawigacja w zakresie, np. sw.js otwarty w przegladarce:
    // z sieci i bez zapisu, zeby nie nadpisac kopii offline cudza trescia
    e.respondWith(fetch(req).catch(function(){
      return zPamieci().then(function(o){return o||bezKopii();});
    }));
    return;
  }
  e.respondWith(caches.match(req).then(function(o){
    if(o)return o;
    return fetch(req).then(function(r){
      if(r&&r.ok){
        var kopia=r.clone();
        var zapis=caches.open(MAGAZYN).then(function(c){return c.put(req,kopia);}).catch(function(){});
        try{e.waitUntil(zapis);}catch(x){}
      }
      return r;
    });
  }));
});
