import { Reloj } from '../dominio/puertos.js';

/** Adaptador de producción: la hora del sistema. */
export class RelojSistema extends Reloj {
  ahora() {
    return new Date();
  }
}

/** Adaptador para pruebas: una hora fija que se puede adelantar. */
export class RelojFijo extends Reloj {
  #actual;

  constructor(fecha) {
    super();
    this.#actual = new Date(fecha);
  }

  ahora() {
    return new Date(this.#actual);
  }

  avanzarMinutos(minutos) {
    this.#actual = new Date(this.#actual.getTime() + minutos * 60_000);
  }
}
