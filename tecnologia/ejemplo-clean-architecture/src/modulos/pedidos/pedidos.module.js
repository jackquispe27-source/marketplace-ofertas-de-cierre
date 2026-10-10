// RAÍZ DE COMPOSICIÓN del módulo Pedidos.
// Es el ÚNICO lugar que conoce las clases concretas y decide qué adaptador
// implementa cada puerto. Cambiar wa.me por WhatsApp Business = cambiar una línea aquí.

import { PedirOferta } from './aplicacion/pedir-oferta.caso-uso.js';
import { ResolverPedido } from './aplicacion/resolver-pedido.caso-uso.js';
import { ExpirarReservas } from './aplicacion/expirar-reservas.caso-uso.js';
import { CodigoCanjeRepositoryMemoria } from './infraestructura/codigo-canje-repository-memoria.js';
import { WaMeEnlaceAdapter } from './infraestructura/wame-enlace.adapter.js';
import { GeneradorCodigoAleatorio } from './infraestructura/generador-codigo-aleatorio.js';
import { ReservaDeStockConOfertas, ContactoNegocioConNegocios } from './infraestructura/modulos-vecinos.adapters.js';
import { PedidosController } from './presentacion/pedidos.controller.js';

export function crearModuloPedidos({ unidadDeTrabajo, reloj, apiOfertas, apiNegocios, generadorCodigo }) {
  const codigos = new CodigoCanjeRepositoryMemoria();
  const reservaDeStock = new ReservaDeStockConOfertas(apiOfertas);
  const dependencias = { unidadDeTrabajo, reloj, codigos, reservaDeStock };

  const pedirOferta = new PedirOferta({
    ...dependencias,
    generadorCodigo: generadorCodigo ?? new GeneradorCodigoAleatorio(),
    contactoNegocio: new ContactoNegocioConNegocios(apiNegocios),
    mensajeria: new WaMeEnlaceAdapter(), // ← único punto a cambiar para otro proveedor
  });
  const resolverPedido = new ResolverPedido(dependencias);
  const expirarReservas = new ExpirarReservas(dependencias);

  return {
    casosDeUso: { pedirOferta, resolverPedido, expirarReservas },
    controller: new PedidosController({ pedirOferta, resolverPedido }),
    codigos, // expuesto solo para las pruebas del ejemplo
  };
}
