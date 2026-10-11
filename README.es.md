# Diffshot

[English](README.md) · [한국어](README.ko.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Español](README.es.md)

**Dos URL. Tres tamaños de pantalla. Un informe para compartir.**

[Abrir el informe de ejemplo](https://jeffrog-256k1.github.io/diffshot/?lang=es)

[![Diffshot](assets/preview.png)](https://jeffrog-256k1.github.io/diffshot/?lang=es)

Diffshot compara dos versiones de una página, resalta las diferencias visuales y genera un HTML que funciona sin conexión. Explica un cambio de interfaz sin configurar un servicio de regresión visual. La demo usa páginas ficticias; no consulta URL enviadas por visitantes.

## Ejecución local

Requiere Node.js 22.12 o posterior y npm. Sin cuentas, servidores ni API de pago. Todavía no hay paquete en npm; ejecuta los comandos desde el repositorio clonado.

```sh
git clone https://github.com/jeffrog-256k1/diffshot.git
cd diffshot
npm ci
npx playwright install chromium
```

## Compara tus páginas

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --out reports/review-01 --lang es
```

Sustituye las URL de loopback por páginas que estés ejecutando o sitios públicos de confianza. Abre `reports/review-01/index.html` en el navegador. Comparte solo ese archivo: incluye imágenes, estilos y controles. También se guardan PNG independientes y `report.json` con metadatos, sin imágenes. Nunca se sobrescriben carpetas existentes: elige un nuevo `--out` para cada ejecución.

## Funciones

- Capturas de escritorio (1440×900), tableta (834×1112) y móvil (390×844), con contextos nuevos de Chromium, escala 1, UTC, en-US y tema claro.
- Altura completa hasta 8000px con el ancho de la ventana. Se avisa del desbordamiento horizontal; el contenido fuera de ese ancho no aparece.
- Vistas en paralelo, deslizador, diferencias en naranja y descarga de PNG. Las áreas añadidas o eliminadas cuentan incluso si están en blanco.
- Los errores de entrada, HTTP, navegación y máscaras sin coincidencias se distinguen de una comparación correcta. Los fallos parciales aparecen en el informe.
- Informes y README en inglés, coreano, chino simplificado, japonés y español. `--lang` traduce también estados y errores de la CLI; las opciones técnicas y la ayuda detallada siguen en inglés.

## Opciones

| Opción      | Significado                                              |
| ----------- | -------------------------------------------------------- |
| `--out`     | Carpeta nueva; no debe existir.                          |
| `--path`    | Hasta 5 rutas, repitiendo la opción.                     |
| `--mask`    | Hasta 10 selectores CSS; deben coincidir en cada página. |
| `--ready`   | Espera un elemento visible y la carga de fuentes.        |
| `--timeout` | 1000–60000ms por operación, 15000 por defecto.           |
| `--delay`   | Espera de 0–5000ms tras estar listo, 200 por defecto.    |
| `--lang`    | en, ko, zh-CN, ja, es; en por defecto.                   |

Cada `--path` sustituye la ruta en ambos orígenes. Sin él se usan las URL exactas. Las consultas pueden usarse al capturar, pero sus valores se ocultan en los metadatos; se omiten los fragmentos. Las rutas y el contenido de las imágenes no se anonimizan.

```sh
npm run compare -- http://127.0.0.1:3000 http://127.0.0.1:4000 --path / --path /about --mask .clock --ready main --out reports/review-02 --lang es
```

## Interpreta el resultado

El código 0 indica capturas correctas e informe guardado, incluso con cambios. El 1 indica algún fallo de captura y el 2 un error de entrada, instalación o escritura. Es una herramienta de revisión, no una barrera automática de CI. Los porcentajes describen píxeles, no gravedad de errores. Se excluyen diferencias de suavizado y se usa un umbral de color pixelmatch de 0.1.

## Límites y privacidad

Se desactivan animaciones y cursores y se solicita movimiento reducido. Aun así, fechas, contenido dinámico, vídeo, datos asíncronos y fuentes del sistema pueden variar. Usa `--mask` para zonas dinámicas y `--ready` para esperar a la aplicación; no garantizan determinismo. No importa sesiones, rastrea sitios, genera explicaciones con IA ni comenta PR automáticamente. El JavaScript de la página se ejecuta: usa sitios de confianza. Revisa el contenido privado antes de compartir capturas. Los informes permanecen locales y no se suben automáticamente.

## Desarrollo y pruebas

```sh
npm test
npm run build
npm run test:browser
npm run dev
```

Regenera el ejemplo ficticio con `npm run demo:capture` y `npm run build`. Usa `DIFFSHOT_BROWSER_CHANNEL=chrome` para Chrome instalado. En Linux, `npx playwright install --with-deps chromium` instala dependencias. Las pruebas cubren páginas idénticas, cambios de CSS y altura, máscaras, fallos HTTP, códigos de salida, protección contra sobrescritura, inyección HTML, descargas sin conexión, idiomas y desbordamiento móvil.

[CONTRIBUTING](CONTRIBUTING.md) · [SECURITY](SECURITY.md) · [CHANGELOG](CHANGELOG.md)

## Licencia

MIT. Puedes utilizar los informes exportados; los derechos del contenido capturado siguen perteneciendo a sus titulares.

[LICENSE](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

[jeffrog-256k1](https://github.com/jeffrog-256k1) · [leejungjae.app](https://leejungjae.app)
