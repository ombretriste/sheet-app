# SheetCTRL

Versión 0.2.1 · by OmT Finance

App web (PWA) de hojas de cálculo sencillas, compatible con archivos `.xlsx` de Excel. Mismo estilo que
las demás apps de OmT Finance, en verde hoja. Los libros se guardan en el dispositivo y, con una cuenta de CloudCTRL (⋯ → Nube), también en la nube, cifrados. `cloud.js` es una copia del de cloudctrl.

## Qué hace

- **Libros y hojas:** varios libros con varias hojas; se guardan solos en IndexedDB.
- **Fórmulas:** más de 100 funciones en español (`=SUMA(A1:A3;1,5)`), con autocompletado y ayuda de argumentos:
  matemáticas, estadística, condicionales, lógica, texto, fechas, búsqueda y finanzas. También admite los
  nombres en inglés. Las referencias se pueden señalar con el ratón o el dedo.
- **Formato:** negrita, cursiva, colores, bordes, alineación, ajuste de texto, combinar casillas y formatos
  de número, moneda, porcentaje y fecha.
- **Edición:** deshacer, copiar y pegar (también con Excel), rellenar series, ordenar, buscar y reemplazar,
  insertar y eliminar filas y columnas, ocultarlas, fijar paneles y zoom.
- **Archivos:** abre y exporta `.xlsx` y `.csv`. Admite arrastrar el archivo a la ventana.

## Cómo está hecho

- `engine.js`: direcciones, tokens, fórmulas, funciones y formatos de número, sin DOM. Las fórmulas se
  guardan como en el `.xlsx` (inglés, coma entre argumentos) y se traducen al mostrarlas (`toLocal`,
  `fromLocal`). El cálculo es perezoso: cada cambio sube una generación y solo se recalcula lo que se pide.
- `xlsx.js`: lector y escritor propios, sin librerías (ZIP con `DecompressionStream` y `CompressionStream`,
  XML con `DOMParser`). También el CSV.
- `app.js`: la rejilla se pinta en un `canvas` bajo un contenedor con desplazamiento nativo.

## Límites conocidos

- No se conservan gráficos, imágenes, tablas dinámicas, comentarios, formato condicional, validación de
  datos ni macros: al abrir un archivo con alguna de esas partes se avisa, y el original no cambia.
- Una función que SheetCTRL no conoce conserva su fórmula y su último resultado guardado, sin recalcular.
- Sin filtros automáticos ni gráficos.
- El `.xls` antiguo no se puede abrir.

## Seguridad

- **En el dispositivo**: los libros están en IndexedDB del navegador, aislados de otras webs y apps y protegidos por el bloqueo del móvil.
- **En la nube** (opcional, CloudCTRL): contenido y nombres se cifran en el dispositivo antes de subir; el servidor solo ve bloques ilegibles.
- **Política de seguridad (CSP) y cabeceras** en `vercel.json`, como en las demás apps: solo se ejecuta código de la propia app (nada en línea: lo que iba en `index.html` está en `boot.js`), solo se conecta a su servidor y a CloudCTRL, no se puede incrustar en otra web (`frame-ancestors 'none'`), `nosniff` y `no-referrer`.
- **Datos validados al cargar**: los libros que llegan de la nube o de otro dispositivo solo admiten tipos, números y colores esperados; los colores de un `.xlsx` solo se aceptan en hexadecimal, y todo texto se escapa al mostrarse.

## Puesta en marcha (Vercel)

Proyecto estático sin variables. Activar Web Analytics.
