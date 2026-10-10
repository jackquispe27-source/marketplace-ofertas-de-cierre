import { fechaCalendario } from './compartido/dominio/fechas.js';
import express from 'express';
import { RelojSistema } from './compartido/infraestructura/relojes.js';
import { UnidadDeTrabajoMemoria } from './compartido/infraestructura/unidad-de-trabajo-memoria.js';
import { ReglaNegocioError, OfertaAgotadaError, OfertaNoDisponibleError, NoEncontradoError } from './compartido/dominio/errores.js';
import { OfertaRepositoryMemoria } from './modulos/ofertas/infraestructura/oferta-repository-memoria.js';
import { Oferta } from './modulos/ofertas/dominio/oferta.js';
import { ListarOfertasVigentes } from './modulos/ofertas/aplicacion/listar-ofertas-vigentes.caso-uso.js';
import { crearApiOfertas } from './modulos/ofertas/index.js';
import { crearApiNegocios } from './modulos/negocios/index.js';
import { crearModuloPedidos } from './modulos/pedidos/pedidos.module.js';
import { crearRutasPedidos } from './modulos/pedidos/presentacion/pedidos.routes.js';

/** Construye la aplicación con datos de ejemplo (sin base de datos). */
export function crearApp() {
  const reloj = new RelojSistema();
  const unidadDeTrabajo = new UnidadDeTrabajoMemoria();

  // Módulo Negocios (mínimo)
  const apiNegocios = crearApiNegocios();
  apiNegocios.sembrar({ id: 'neg-1', nombre: 'Pollería El Dorado', whatsapp: '+51 966 123 456' });

  // Módulo Ofertas
  const ofertaRepository = new OfertaRepositoryMemoria();
  const ahora = reloj.ahora();
  ofertaRepository.sembrar(
    Oferta.publicar(
      {
        id: 'of-1',
        negocioId: 'neg-1',
        titulo: '1/4 de pollo a la brasa con papas',
        precioCarta: 18,
        precioOferta: 9,
        stock: 3,
        horaLimite: new Date(ahora.getTime() + 3 * 60 * 60_000),
        fechaVencimiento: fechaCalendario(ahora),
      },
      ahora,
    ),
  );
  const apiOfertas = crearApiOfertas(ofertaRepository);
  const listarOfertas = new ListarOfertasVigentes(ofertaRepository, reloj);

  // Módulo Pedidos
  const pedidos = crearModuloPedidos({ unidadDeTrabajo, reloj, apiOfertas, apiNegocios });

  // Tarea programada (ADR-005): en producción se usa node-cron; aquí, setInterval.
  const tarea = setInterval(() => pedidos.casosDeUso.expirarReservas.ejecutar().catch(console.error), 60_000);
  tarea.unref();

  const app = express();
  app.use(express.json());

  // Autenticación SIMULADA para el ejemplo: en el sistema real, un middleware valida
  // el JWT y obtiene negocioId del token (ADR-006).
  const requiereNegocio = (req, res, next) => {
    const negocioId = req.header('x-negocio-id');
    if (!negocioId) return res.status(401).json({ error: 'Se requiere sesión de negocio' });
    req.usuario = { negocioId };
    next();
  };

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/v1/ofertas', async (_req, res, next) => {
    try {
      res.json(await listarOfertas.ejecutar());
    } catch (e) {
      next(e);
    }
  });
  app.use('/api/v1', crearRutasPedidos(pedidos.controller, { requiereNegocio }));

  // Traducción de errores del dominio a HTTP (presentación).
  app.use((error, _req, res, _next) => {
    if (error instanceof OfertaAgotadaError) return res.status(409).json({ error: error.message });
    if (error instanceof OfertaNoDisponibleError) return res.status(409).json({ error: error.message });
    if (error instanceof NoEncontradoError) return res.status(404).json({ error: error.message });
    if (error instanceof ReglaNegocioError) return res.status(422).json({ error: error.message });
    console.error(error);
    res.status(500).json({ error: 'Error interno' });
  });

  return app;
}
