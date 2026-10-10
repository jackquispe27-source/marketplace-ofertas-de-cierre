import { fechaCalendario } from '../src/compartido/dominio/fechas.js';
import { RelojFijo } from '../src/compartido/infraestructura/relojes.js';
import { UnidadDeTrabajoMemoria } from '../src/compartido/infraestructura/unidad-de-trabajo-memoria.js';
import { OfertaRepositoryMemoria } from '../src/modulos/ofertas/infraestructura/oferta-repository-memoria.js';
import { Oferta } from '../src/modulos/ofertas/dominio/oferta.js';
import { crearApiOfertas } from '../src/modulos/ofertas/index.js';
import { crearApiNegocios } from '../src/modulos/negocios/index.js';
import { crearModuloPedidos } from '../src/modulos/pedidos/pedidos.module.js';

export const AHORA = new Date('2026-10-10T18:00:00-05:00');

/** Arma el sistema completo con adaptadores en memoria y un reloj controlable. */
export function crearEscenario({ stock = 3, apiNegocios } = {}) {
  const reloj = new RelojFijo(AHORA);
  const unidadDeTrabajo = new UnidadDeTrabajoMemoria();
  const ofertas = new OfertaRepositoryMemoria();
  ofertas.sembrar(
    Oferta.publicar(
      {
        id: 'of-1',
        negocioId: 'neg-1',
        titulo: 'Torta de chocolate',
        precioCarta: 40,
        precioOferta: 20,
        stock,
        horaLimite: new Date(AHORA.getTime() + 2 * 60 * 60_000),
        fechaVencimiento: fechaCalendario(AHORA),
      },
      AHORA,
    ),
  );

  const negocios = apiNegocios ?? crearApiNegocios();
  if (!apiNegocios) {
    negocios.sembrar({ id: 'neg-1', nombre: 'Pastelería Dulce', whatsapp: '+51 999 888 777' });
  }

  const pedidos = crearModuloPedidos({
    unidadDeTrabajo,
    reloj,
    apiOfertas: crearApiOfertas(ofertas),
    apiNegocios: negocios,
  });

  const stockActual = async () => (await ofertas.obtenerParaActualizar('of-1')).stock;
  return { reloj, ofertas, pedidos, stockActual, ...pedidos.casosDeUso };
}
