import { crearApp } from './app.js';

const PUERTO = process.env.PORT ?? 3000;

crearApp().listen(PUERTO, () => {
  console.log(`API de ejemplo en http://localhost:${PUERTO}`);
  console.log(`  GET   /api/v1/ofertas`);
  console.log(`  POST  /api/v1/ofertas/of-1/pedidos`);
  console.log(`  PATCH /api/v1/pedidos/:codigo   (header x-negocio-id: neg-1)`);
});
