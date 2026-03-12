const CACHE_NAME = 'mu-finance-v5-cache';
const ASSETS = [
    './',
    './index.html',
    // Adicione aqui outros arquivos locais como imagens ou ícones se houver
];

// Instalação e Cache de arquivos locais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Estratégia de Fetch com bloqueio de erro para CDNs externos
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // IGNORAR CDNs que causam erro de CORS no Service Worker
    if (url.includes('tailwindcss.com') || url.includes('gstatic.com') || url.includes('googleapis.com')) {
        return; // Deixa o navegador carregar normalmente sem passar pelo cache
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                console.log("Offline: Recurso não encontrado no cache.");
            });
        })
    );
});
