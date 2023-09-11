document.getElementById("botonCopiar").addEventListener("click", function () {
  // Obtén el enlace y crea un elemento temporal (input) para copiar el texto
  var enlace = document.getElementById("enlace").href;
  var temporalInput = document.createElement("input");
  temporalInput.value = enlace;
  document.body.appendChild(temporalInput);

  // Selecciona el contenido del input temporal
  temporalInput.select();

  // Intenta copiar el texto seleccionado
  document.execCommand("copy");

  // Elimina el elemento temporal del DOM
  document.body.removeChild(temporalInput);

  // Muestra la alerta de Bootstrap
  var alertaEnlaceCopiado = document.getElementById("alertaEnlaceCopiado");
  alertaEnlaceCopiado.style.display = "block";

  // Oculta la alerta después de unos segundos (puedes ajustar el tiempo si lo deseas)
  setTimeout(function () {
    alertaEnlaceCopiado.style.display = "none";
  }, 3000); // 3000 milisegundos = 3 segundos, ajusta según tus preferencias
});
