const CACHE = 'mu-finance-v5';
const ASSETS = [
  'index.html',
  'manifest.json',
  'logo.webp',
  'icons/icon.svg',
  'icons/logo.svg',
  'icons/logo.png',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // HTML: network-first para sempre pegar versÃ£o nova
  if (request.mode === 'navigate' || (url.origin === location.origin && (url.pathname === '/' || url.pathname.endsWith('.html')))) {
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => caches.match(request).then(r => r || caches.match('index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then(res => res || fetch(request).then(netRes => {
      if (netRes && netRes.ok && (netRes.type === 'basic' || netRes.type === 'cors')) {
        const clone = netRes.clone();
        caches.open(CACHE).then(c => c.put(request, clone));
      }
      return netRes;
    }).catch(() => res))
  );
});
