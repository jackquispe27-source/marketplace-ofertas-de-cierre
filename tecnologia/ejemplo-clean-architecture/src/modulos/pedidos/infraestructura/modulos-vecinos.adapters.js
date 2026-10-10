import { ReservaDeStock, ContactoNegocio } from '../dominio/puertos.js';

/**
 * Adaptadores que conectan Pedidos con la API pública de otros módulos.
 * Pedidos depende de SUS puertos; estos adaptadores traducen a Ofertas y Negocios.
 * Si mañana Ofertas se separa en un microservicio, solo cambia este archivo.
 */
export class ReservaDeStockConOfertas extends ReservaDeStock {
  constructor(apiOfertas) {
    super();
    this.apiOfertas = apiOfertas;
  }

  reservar(ofertaId, tx, ahora) {
    return this.apiOfertas.reservarUnidad(ofertaId, tx, ahora);
  }

  liberar(ofertaId, tx) {
    return this.apiOfertas.liberarUnidad(ofertaId, tx);
  }
}

export class ContactoNegocioConNegocios extends ContactoNegocio {
  constructor(apiNegocios) {
    super();
    this.apiNegocios = apiNegocios;
  }

  obtenerContacto(negocioId) {
    return this.apiNegocios.obtenerContacto(negocioId);
  }
}
