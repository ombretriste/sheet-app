# SheetCTRL

Versión 0.1.0 · by OmT Finance

App web (PWA) de hojas de cálculo sencillas, compatible con archivos `.xlsx` de Excel. Mismo estilo que
las demás apps de OmT Finance, en verde hoja. Sin servidor: los libros se guardan en el dispositivo.

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

## Puesta en marcha (Vercel)

Proyecto estático sin variables. Activar Web Analytics.
