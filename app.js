// Estas son todas las dependicias que estoy usando para mi servidor/proyecto 
const hbs = require('hbs')

var createError = require('http-errors');

var express = require('express');

var path = require('path');

var cookieParser = require('cookie-parser');

var logger = require('morgan');

var session = require('express-session');// Antes de las rutas, para que las afecte.

// Validaciones que permiten ingresar o no a ciertas rutas.
var { veryUser } = require('./middlewares/auth');

var { veryAdmin } = require('./middlewares/admin');

var { loged } = require('./middlewares/login');



// Para usar variables de entorno
// Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. 
require('dotenv').config();
/**
 * // Credenciales de Twilio
// 1- ID de la cuenta mia de twilio
const accountSid = 'ACf9924817929689ce755fc1f26899a462';
// 2- Secret key o token
const authToken = 'e59e7d3ce63e06818abebd060885aee0';
// 3- Conectando proyecto con twilio
const client = require('twilio')(accountSid, authToken);
const { messageInfo } = require("./models/consulta");

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

// infoMensaje()
 */


// Creo mi app con express
var app = express();

// Puerto de mi app
const PORT = process.env.PORT || '3000';

// Llamo a todas los archivos de la carpeta routes.

// Para cargar foto destacada
const cargarFotoRouter = require("./routes/maquinarias/cargar_foto");

// Para cargar fotos en la galería
const cargarGaleriaRouter = require("./routes/maquinarias/cargar_galeria");

// Sólo para crear la función de borrar fotos de la galería
var galeriaRouter = require("./routes/maquinarias/foto_galeria");

// Página princ.
var indexRouter = require('./routes/index');

// Log out
const logOutRouter = require('./routes/logout');

//Login
const loginRouter = require('./routes/login');

// Panel de control
const panelControRouter = require('./routes/panel_de_control.js');

var excel_maquinas = require('./routes/descargas_excel/excel_maquinas');

// Maquinarias
const CargarMaquinaRouter = require('./routes/maquinarias/cargar_maquina_disponible')

const maquinasDisponiblesRouter = require('./routes/maquinarias/maquinas_disponibles')

const maquinasEliminadasRouter = require('./routes/maquinarias/maquinas_eliminadas');

const fichaRouter = require("./routes/maquinarias/Ficha_maquinaria");

// Empleados o usuarios
const cargarEmpleadoRouter = require('./routes/empleados/carga_de_empleados');

const empleadosDeshabilitadosRouter = require('./routes/empleados/empleados_deshabilitados')

// Interacciones
const interaccionesRouter = require('./routes/interacciones/interacciones');

const cargaInteraccionesRouter = require('./routes/interacciones/carga_interacciones');

const estadoInteraccionRouter = require('./routes/interacciones/interaccionPorEstado');

// Clientes
const cargaClientesRouter = require('./routes/clientes/carga_clientes');

const clientesRouter = require('./routes/clientes/clientes');

const clientesEliminadosRouter = require('./routes/clientes/clientes_eliminados');

const clientesInteraccionRouter = require('./routes/clientes/clientes_interacciones');

// Buscar cliente
const buscarClienteRouter = require('./routes/R_busquedas/buscar_clientes');

// Buscar máquina
const buscarMaquinariaRouter = require('./routes/R_busquedas/buscar_maquinas');

// Maquinaria por tipo
const maquinariaPorTipoRouter = require('./routes/maquinarias/maq_por_tipo');

// Este es para cargar nuevos tipo de maquinarias.. No para cargar nuevas maquinas
const newMachineRouter = require('./routes/maquinarias/list_tipo_maquinaria');

// Notificaciones
const notificacionesRouter = require('./routes/interacciones/notificaciones');

// Para cargar interacciones desde la sección de clientes. Es una ópcion que aparece en detalles.
const cargarinteraccionFromClientes = require('./routes/interacciones/interactionFromClients');



// view engine setup
app.set('views', path.join(__dirname, 'views'))

//indica que mi motor de vistas es: hbs
app.set('view engine', 'hbs');

//para agregar vistas parciales como plantillas.
hbs.registerPartials(__dirname + '/views/partials')


app.use(logger('dev'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Usando express session
app.use(session({
  secret: 'pass secreto',
  cookie: { maxAge: null },
  resave: false,
  saveUninitialized: true//
}));


// Rutas

// Información de maquinaria para clientes de Migliazza
app.use("/ficha", fichaRouter);

// La creé sólo para hacer la función de borrar foto de galaría
app.use("/foto-galeria", veryAdmin, galeriaRouter)

// Para cargar fotos en la galería
app.use("/cargar-galeria", veryAdmin, cargarGaleriaRouter);

// Para cargar foto destacada
app.use("/cargar-foto", veryAdmin, cargarFotoRouter);

app.use('/informe_maquinas', veryAdmin, excel_maquinas);

app.use('/', indexRouter);

app.use('/Cargar_Maquina', veryAdmin, CargarMaquinaRouter);

app.use('/maquinas_disponibles', veryAdmin, maquinasDisponiblesRouter);

app.use('/maquinas_eliminadas', veryAdmin, maquinasEliminadasRouter);

app.use('/empleados', veryAdmin, cargarEmpleadoRouter);

app.use('/emplados_deshabitados', veryAdmin, empleadosDeshabilitadosRouter);

app.use('/interacciones', veryUser, interaccionesRouter);

app.use('/carga_interacciones', veryUser, cargaInteraccionesRouter);

app.use('/login', loged, loginRouter);

app.use('/panel_de_control', veryAdmin, panelControRouter);

app.use('/estadoInteraccion', veryUser, estadoInteraccionRouter);

app.use('/carga_clientes', veryAdmin, cargaClientesRouter);

app.use('/clientes', veryAdmin, clientesRouter);

app.use('/clientes_eliminados', veryAdmin, clientesEliminadosRouter);

app.use('/clientes_con_interacciones', veryAdmin, clientesInteraccionRouter)

app.use('/maquinariaPorTipo', veryAdmin, maquinariaPorTipoRouter);

app.use('/listado_tipo_maquinaria', veryAdmin, newMachineRouter);

app.use('/notificaciones', veryAdmin, notificacionesRouter);

app.use('/cargar_interaccion_desde_clientes', veryAdmin, cargarinteraccionFromClientes);

app.use('/buscar_cliente', veryAdmin, buscarClienteRouter);

app.use('/buscar_maquinaria', veryAdmin, buscarMaquinariaRouter);

app.use('/logout', logOutRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})




module.exports = app;
