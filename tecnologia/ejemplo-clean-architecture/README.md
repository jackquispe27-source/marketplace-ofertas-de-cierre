# Ejemplo de Clean Architecture: módulo Pedidos

Código de referencia del enfoque arquitectónico ([ADR-002](../../docs/02-arquitectura-software/decisiones/ADR-002-clean-architecture.md)). Implementa el flujo más crítico del sistema, **pedir una oferta**, con las capas de Clean Architecture y adaptadores en memoria. No necesita base de datos para ejecutarse.

> Es un **ejemplo de arquitectura**, no el sistema completo: muestra cómo se organiza cada módulo para que el resto se construya igual.

## Ejecutar

```bash
cd tecnologia/ejemplo-clean-architecture
npm install
npm test      # 15 pruebas: reglas del dominio, casos de uso, concurrencia y regla de dependencia
npm start     # API en http://localhost:3000
```

Probar la API:

```bash
curl http://localhost:3000/api/v1/ofertas
curl -X POST http://localhost:3000/api/v1/ofertas/of-1/pedidos
curl -X PATCH http://localhost:3000/api/v1/pedidos/CODIGO -H "x-negocio-id: neg-1" -H "content-type: application/json" -d "{\"accion\":\"confirmar\"}"
```

> `x-negocio-id` **simula** el token JWT solo para el ejemplo. En el sistema real, el `negocioId` se obtiene del token validado (ADR-006).

## Estructura

```text
src/
├── compartido/
│   ├── dominio/            errores.js · puertos.js (Reloj, UnidadDeTrabajo) · fechas.js
│   └── infraestructura/    relojes.js · unidad-de-trabajo-memoria.js · unidad-de-trabajo-pg.js (referencia)
├── modulos/
│   ├── ofertas/
│   │   ├── dominio/        oferta.js (entidad + RN-01…RN-05, RN-08) · oferta-repository.js (puerto)
│   │   ├── aplicacion/     listar-ofertas-vigentes.caso-uso.js
│   │   ├── infraestructura/ oferta-repository-memoria.js · oferta-repository-pg.js (referencia, FOR UPDATE)
│   │   └── index.js        API pública: reservarUnidad, liberarUnidad
│   ├── negocios/index.js   API pública mínima: obtenerContacto
│   └── pedidos/
│       ├── dominio/        codigo-canje.js (máquina de estados RN-06, RN-07) · puertos.js
│       ├── aplicacion/     pedir-oferta · resolver-pedido · expirar-reservas
│       ├── infraestructura/ repositorio en memoria · wa.me · generador de código · adaptadores a Ofertas/Negocios
│       ├── presentacion/   pedidos.controller.js · pedidos.routes.js
│       └── pedidos.module.js   raíz de composición: conecta puertos con adaptadores
├── app.js                  Express + manejo de errores + datos de ejemplo
└── server.js
tests/
├── dominio.test.js         reglas de negocio sin infraestructura
├── pedidos.test.js         casos de uso: concurrencia (EQ-02), rollback, seguridad (EQ-04), expiración (EQ-06)
└── arquitectura.test.js    falla si el dominio o la aplicación importan Express, pg o infraestructura (EQ-09)
```

## Qué demuestra cada prueba

| Prueba | Requisito / escenario que verifica |
|---|---|
| 50 pedidos simultáneos sobre 3 unidades → 3 reservas | EQ-02, DA02, ADR-003 |
| Si falla a mitad del pedido no se descuenta stock | ADR-003 (transacción) |
| Otro negocio no puede confirmar un código ajeno | EQ-04, RN-10, ADR-006 |
| A los 30 min la reserva expira y el stock vuelve | EQ-06, RN-06, ADR-005 |
| El dominio no importa frameworks | EQ-09, ADR-002 |

## Cómo pasar a producción

1. `npm install pg`.
2. Crear `CodigoCanjeRepositoryPg` siguiendo el mismo patrón que `OfertaRepositoryPg`.
3. En `pedidos.module.js` y `app.js`, reemplazar los adaptadores en memoria por los de PostgreSQL (`OfertaRepositoryPg` y `UnidadDeTrabajoPg` ya vienen incluidos como referencia).
4. Los casos de uso, las entidades y las pruebas del dominio **no cambian**.
