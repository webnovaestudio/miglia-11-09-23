// Credenciales de Twilio
// 1- ID de la cuenta mia de twilio
const accountSid = 'ACf9924817929689ce755fc1f26899a462';
// 2- Secret key o token
const authToken = 'e59e7d3ce63e06818abebd060885aee0';
// 3- Conectando proyecto con twilio
const client = require('twilio')(accountSid, authToken);
const { messageInfo } = require("../../models/consulta");

const infoMensaje = async (req, res) => {
  try {
    const info = await messageInfo();
    const cleanInfo = info.map((data) => ({
      mensaje: `
      ¡Hola Equipo Migliazza!.
    
      * Próximo contacto con ${data.nombre_de_contacto}.
      * Día: ${data.proximo_contacto}
      * Resposable: ${data.seguimiento}.`
    }));
    console.log("cleanInfo; ", cleanInfo);

    // Envía el mensaje de texto
    cleanInfo.forEach((message) => {
      client.messages
        .create({
          body: message.mensaje,
          from: 'whatsapp:+14155238886',
          to: 'whatsapp:+5493465442615'
        })
        .then(message => console.log('Mensaje enviado. SID del mensaje:', message.sid))
        .catch(error => console.error('Error al enviar el mensaje:', error));
    });

  } catch (e) {
    console.log(e);
  }
}

infoMensaje()

module.exports = {infoMensaje};
