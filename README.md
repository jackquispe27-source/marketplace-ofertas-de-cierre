# Marketplace de Ofertas de Cierre

## Nombre
Jack Franklyn Quispe Lujan

## Descripción
Marketplace web académico donde los negocios de comida de Huamanga (pollerías, panaderías y pastelerías) publican sus **ofertas de cierre del día**: producto apto que sobró y que se perdería si no se vende en las próximas horas. El cliente entra desde un link, ve las ofertas cercanas, pide por **WhatsApp** con un **código de canje**, paga por **Yape** directo al negocio y recoge en tienda o recibe por delivery del propio negocio. No hay que descargar ninguna app ni registrarse para comprar.

## Caso de estudio
Propuesta propia: *Marketplace de Ofertas de Cierre* (Ayacucho, 2026).
Referencias funcionales: Cirkula (Lima), Too Good To Go (Europa/EE.UU.) y Cheaf (México).

## Diferencias frente a un marketplace tradicional (p. ej. GoPet)
| Marketplace tradicional | Este marketplace |
|---|---|
| Carrito de compras | Un pedido = una oferta; no hay carrito |
| Pasarela de pago integrada | Pago por Yape directo al negocio, fuera del sistema |
| Servicio de envío externo | Recojo o delivery del propio negocio |
| Stock permanente | Stock limitado que vence en horas |
| Venta registrada en la plataforma | Venta ocurre en WhatsApp; se rastrea con código de canje |

## Curso
Arquitectura de Software (IS-488) · UNSCH · Semestre 2026-II
Docente: Ing. Lizbeth Jaico Quispe

## Proceso de arquitectura (Sprint 1)

| # | Etapa | Documento |
|---|---|---|
| 1 | Necesidad del negocio | [00-necesidad-del-negocio](docs/01-analisis-de-sistema/00-necesidad-del-negocio.md) |
| 2 | Requisitos | [01-actores](docs/01-analisis-de-sistema/01-actores.md) · [02-historias](docs/01-analisis-de-sistema/02-historias-del-usuario.md) · [03-requisitos funcionales](docs/01-analisis-de-sistema/03-requisitos-funcionales.md) · [05-restricciones](docs/01-analisis-de-sistema/05-restricciones.md) |
| 3 | Atributos de calidad | [04-atributos](docs/01-analisis-de-sistema/04-atributos-de-calidad.md) · [08-escenarios medibles](docs/01-analisis-de-sistema/08-escenarios-atributos-calidad.md) |
| 4 | Drivers arquitectónicos | [06-drivers](docs/01-analisis-de-sistema/06-driver-arquitectonicos.md) |
| 5 | Decisiones arquitectónicas | [07-resumen](docs/01-analisis-de-sistema/07-decisiones-arquitectonicas.md) · [ADR-001 … ADR-009](docs/02-arquitectura-software/decisiones/README.md) |
| 6 | Estilo arquitectónico | [estilo-arquitectonico](docs/02-arquitectura-software/estilo-arquitectonico.md) (monolito modular en capas) |
| 7 | Enfoque arquitectónico | [enfoque-arquitectonico](docs/02-arquitectura-software/enfoque-arquitectonico.md) (Clean Architecture) |
| 9 | Componentes y trazabilidad | [componentes-arquitectonicos](docs/02-arquitectura-software/componentes-arquitectonicos.md) |
| 10 | Diseño interno (SOLID y patrones) | [módulos](docs/03-diseno-de-software/diseno-interno/diseno-interno-de-modulos.md) · [principios](docs/03-diseno-de-software/diseno-interno/principios-de-diseno.md) · [patrones](docs/03-diseno-de-software/diseno-interno/patrones-de-diseno.md) |
| 13 | Documentación C4 | [Nivel 1](docs/04-modelo-c4/Nivel1-DiagramadeContextodelSistema.md) · [Nivel 2](docs/04-modelo-c4/Nivel2-DiagramadeContenedores.md) · [Nivel 3](docs/04-modelo-c4/Nivel3-Diagrama-de-Componentes.md) · [Nivel 4](docs/04-modelo-c4/Nivel4-DiagramadeCodigo.md) |
| — | Código de referencia | [tecnologia/ejemplo-clean-architecture](tecnologia/ejemplo-clean-architecture/README.md) (Node.js, 15 pruebas) |

## Estructura del repositorio

```text
marketplace-ofertas-de-cierre/
├── docs/
│   ├── 01-analisis-de-sistema/        00 necesidad … 08 escenarios de calidad
│   ├── 02-arquitectura-software/      arquitectura inicial, estilo, enfoque, componentes
│   │   └── decisiones/                ADR-001 … ADR-009
│   ├── 03-diseno-de-software/
│   │   └── diseno-interno/            módulos, principios SOLID, patrones
│   ├── 04-modelo-c4/                  Nivel 1 … Nivel 4
│   └── img/                           diagramas exportados en PNG (para presentaciones)
├── tecnologia/
│   └── ejemplo-clean-architecture/    código ejecutable del módulo Pedidos
├── .gitignore
└── README.md
```

> Los diagramas están escritos en **Mermaid** dentro de cada `.md`: GitHub los dibuja automáticamente y se versionan como texto. En `docs/img/` hay una copia PNG de cada uno.
> Los nombres de carpetas y archivos no llevan tildes ni ñ, para evitar problemas de codificación entre Windows, Git y GitHub.

## Ejecutar el ejemplo de código

```bash
cd tecnologia/ejemplo-clean-architecture
npm install
npm test
npm start
```
