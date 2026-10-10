// Errores del dominio. No conocen HTTP: la capa de presentación los traduce a códigos de estado.

export class ReglaNegocioError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ReglaNegocioError';
  }
}

export class OfertaAgotadaError extends ReglaNegocioError {
  constructor() {
    super('RN-05: la oferta ya no tiene unidades disponibles');
    this.name = 'OfertaAgotadaError';
  }
}

export class OfertaNoDisponibleError extends ReglaNegocioError {
  constructor() {
    super('RN-05: la oferta no está activa o ya pasó su hora límite');
    this.name = 'OfertaNoDisponibleError';
  }
}

export class NoEncontradoError extends Error {
  constructor(recurso) {
    super(`${recurso} no encontrado`);
    this.name = 'NoEncontradoError';
  }
}
