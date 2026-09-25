/**
 * worker.js - geoportal economico
 *
 * Los archivos del repo (index.html, data/...) los sirve Cloudflare
 * directamente, sin pasar por aqui. Este script solo atiende la ruta
 * /foto360/: trae la foto 360 del servidor de Kasay y la entrega como
 * si fuera nuestra, porque el navegador no deja cargarla directo desde
 * el geoportal.
 *
 * Solo sirve para la carpeta de fotos 360 de Kasay: no se puede usar
 * para pedir ninguna otra direccion. Las fotos no se guardan en el
 * repo; Cloudflare las deja en cache un dia para no pedirlas a Kasay
 * cada vez.
 */

const ORIGEN_FOTOS = 'https://360-valledupar.kasay.com.co/proyecto_streetview/fotos-360/';
const PREFIJO = '/foto360/';
const CACHE_SEG = 86400;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith(PREFIJO)) {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Metodo no permitido', { status: 405 });
    }

    // solo nombres de foto dentro de la carpeta: letras, numeros, _ - /
    // y extension de imagen. Sin puntos intermedios: no se puede subir
    // de carpeta ni pedir otra cosa
    const resto = decodeURIComponent(url.pathname.slice(PREFIJO.length));
    if (!/^[\w\-\/]+\.(jpe?g|png|webp)$/i.test(resto)) {
      return new Response('No permitido', { status: 400 });
    }

    const r = await fetch(ORIGEN_FOTOS + resto, {
      cf: { cacheTtl: CACHE_SEG, cacheEverything: true }
    });
    if (!r.ok) {
      return new Response('Foto no disponible', { status: r.status });
    }

    const h = new Headers();
    h.set('Content-Type', r.headers.get('Content-Type') || 'image/jpeg');
    h.set('Cache-Control', 'public, max-age=' + CACHE_SEG);
    return new Response(r.body, { status: 200, headers: h });
  }
};
