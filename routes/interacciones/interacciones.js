var express = require('express');
var router = express.Router();
 
const {allInteractions, modifyInteraction,interacionPorId, borrarInteraccion, empleados, 

    comentarInteraccion, singleEmpleado, getComentarios, deleteComent, modificarComentario,
    
    singleComent, buscarClientePorCuit, getMaquinaria} = require('../../models/consulta');

/* Importing the function verifyInteraccion from the file interacciones.js, which is located in the
folder middlewares. */

const {verifyInteraccion} = require('../../middlewares/interacciones');
 
// Listado de interacciones.
const getInteraccion = async(req, res) => {
    // Todas las interacciones
    const all = true;
    // Todas las interacciones HABILITADAS. 
    const habilitado = true; 
    // Lo uso para hacer el filtro.
    const usuarios = await empleados(habilitado);
    // Obtengo las interacciones
    const todasInteracciones = await allInteractions(habilitado);

    if(todasInteracciones.length == 0){
       
        res.end(`<a href="/panel_de_control">Parece que no hay interacciones cargadas, volver al panel de control...</a>`);
    
    }else{
        res.render('interacciones', {todasInteracciones, all, usuarios});
    }

}
 

// Single de una interacción.
const getSingleInteraction = async(req , res) => {

    /* si all esta en false, obtengo solo una interaccion. */
    const all = false;

    /* A variable that is used to filter the interactions that are enabled. */
    const habilitado = true; 

    /* Taking the id from the url. */
    const id = req.params.id;//el id para identificar la interaccion

    // Obtengo dicha info'
    const interaccionUnica = await interacionPorId(id, habilitado)

    /* Creating an object from the array of objects that is returned by the query. */
    var normalResults = interaccionUnica.map((mysqlObj, index) => {

        return Object.assign({}, mysqlObj);
    });

    /* Creating an object from the array of objects that is returned by the query. */
    const obj = normalResults[0];
 
 /**
  * DESDE  for ( let prop in obj) { HASTA   var allTrue = false; DEBE SER UNA FUNCION APARTE
  */

    /* Iterating over the properties of an object. */
    for ( let prop in obj) {

        /* Checking if the object has a property called "cuit". If it does, then it takes the value of
        that property and uses it to search for a client in the database. If the client is found,
        then it returns true, otherwise it returns false. */
         if ( prop == "cuit") {
          
             /* Taking the value of the property "cuit" from the object "obj". */
             const cuit = obj[prop];

             if (cuit.length > 0) {
                // si cuit no tiene valor entonces true
                var valorCuit = true;
            }else{
                // si cuit tiene valor entonces true
                var valorCuit = false;
            }
 
            /* Used to filter the interactions that are enabled. */
             const habilitado = true;
 
             /* Searching for a client in the database. */
             const ExisteCliente = await buscarClientePorCuit(cuit, habilitado);
 
             
             if( ExisteCliente.length > 0) {
                
                var clientWasFound = true;
 
             }else{
        
                var clientWasFound = false; 
             }
         }
     }
  
     if( clientWasFound == false && valorCuit == true) {

        var allTrue = true;
     
    }else{
    
        var allTrue = false;
     }

   /* Getting all the comments from the database that are related to the interaction that has the id
   that is passed as an argument. */
    const comentarios = await getComentarios(id, habilitado);
 
   /* Checking if the array that is returned by the query is empty. If it is, then it renders the view
   interacciones.ejs and passes it the variables interaccionUnica and all. */
    if(comentarios.length == 0){

    /* A variable that is used to display a message in the view. */
    const mensaje = "No hay comentarios cargados!!!";
     
    res.render('interacciones', {interaccionUnica, all, mensaje, allTrue });

    }else{
        res.render('interacciones', {interaccionUnica, all, comentarios, allTrue })
    }
 
}

// Para modificar los datos de una interaccion 
const modificarInteraccion = async(req, res) => {

    //el id de la interaccion a modificar
   /* Taking the id from the url. */
    const id = req.params.id;
    
    /* Used to filter the interactions that are enabled. */
    const habilitado = true; 
    
    const getMaquinaria_ = await getMaquinaria(habilitado)
 
   /* Getting the data from the interaction that has the id that is passed as an argument. */
    const datos = await interacionPorId(id, habilitado); 
   
    /* Getting all the sellers from the database ' para el campo "seguimiento". */
    const sellers = await empleados(habilitado); 
     
    res.render('modif_interaccion', {datos,  sellers, getMaquinaria_});

}

// Guarda las modificaciones hechas sobre una interacción
const modificado = async(req, res) => {
    
    /* Taking the id from the url. */
    const id = req.params.id;//necesito el id
    
    /* Taking the body of the request. */
    const cambios = req.body;//agarro los cambios realizados
    
    // Modifico la interaccion
    const interModicada = await modifyInteraction(cambios, id);

    res.redirect('/interacciones/' + `${id}`);
}


// Para eliminar una interacción
const eliminarInteraccion = async(req, res) => {

    // Necesito el id de la inter. que voy a borrar
    const id = req.params.id;

    // Y pasarle habilitado en false
    const habilitado = false;
    
    const inteEliminada = await borrarInteraccion(id, habilitado);
    
    res.redirect('/interacciones');
}


// Obtiene la vista y los datos para la interacción
const comentar = async(req, res) => {

    const id_usuario = req.session.user;
    
    const id_interaccion = req.params.id;
    
    const usuario = await singleEmpleado(id_usuario)
 
    res.render('cargar_comentario', {id_usuario, id_interaccion, usuario})
}

// Envia los comentarios a la base de datos
const enviarComenterio = async(req, res) => {
    
    const obj = req.body;
    
    const comentarioHecho = await comentarInteraccion(obj)
    
    res.redirect('/interacciones')
}


//Obtiene los datos del cliente desde la interaccion seleccionada y me los brinda en una vista para luego mandarlos a la base de datos.
//Esta funcion esta relacionada con la funcion de carga_de_clientes... Se relaciona mediante el method del html...
//Esta informacion se manda a otra ruta; mas especificamente a:/carga_clientes/create

const convertir_a_cliente = async(req, res) => {
    //obtengo el id del usuario que quiero modificar
    const id = req.params.id;
    
    //habilitado en true porque esta habilitado el usuario
    
    const habilitado = true;
    
    //obtengo los datos de la interaccion relacionados con el futuro cliente(razon_social, telefono,...) mediante el id...
    const interaccionUnica = await interacionPorId(id, habilitado)//obtengo dicha info'

    
    res.render('cargarClienteDesdeInteraccion', {interaccionUnica})
}

 
/**
 * It deletes a comment from the database
 * @param req - The request object represents the HTTP request and has properties for the request query
 * string, parameters, body, HTTP headers, and so on.
 * @param res - The response object.
 */
const eliminarComentario = async(req, res) => {

    const habilitado = false;

    const id_comentario = req.params.id;
    
    const eliminandoComentario = await deleteComent(id_comentario, habilitado);
    
    res.redirect('/interacciones');

}

 

//MODIFICAR UN COMENTARIO. lA IDEA ES QUE LO PUEDA HACER SOLO EL QUE LA HIZO....
 
/**
 * It renders a view called modificar_comentario.ejs, and passes it two variables: singleComentario and
 * DatosEditor
 * @param req - The request object represents the HTTP request and has properties for the request query
 * string, parameters, body, HTTP headers, and so on.
 * @param res - The response object.
 */
const ModificarComentario = async(req, res)=>{
    
    const id_comentario = req.params.id;//obtengo el id por el parametro

    const habilitado = true;

    const singleComentario = await singleComent(id_comentario, habilitado);
    
    //DATOS DEL QUE VA A EDITAR EL COMENTARIO
    const DatosEditor = await singleEmpleado( req.session.user );
        
    res.render('modificar_comentario', {singleComentario, DatosEditor})
}

//ENVIAR COMENTARIO MODIFICADO
/**
 * It receives a request from the client, it takes the body of the request, it takes the id of the
 * comment from the url, it modifies the comment in the database and it redirects the client to the
 * interactions page
 * @param req - The request object.
 * @param res - the response object
 */
const enviarEdicionComentario = async (req, res) => {
    
    const obj = req.body;

    //console.log("body: ", obj);
    
    const id_comentario = req.params.id;

    //console.log("id del comentario: ", id_comentario)

    const habilitado = true;
    
    const comentarioEditado = await modificarComentario(obj, id_comentario, habilitado)

    //console.log("Comentario editado: ", comentarioEditado);

    res.redirect('/interacciones');
}

/* Receiving a request from the client, it takes the body of the request, it takes the id of the
comment from the url, it modifies the comment in the database and it redirects the client to the
interactions page. */
router.post('/editar-comentario/:id/create', enviarEdicionComentario) 

/* Receiving a request from the client, it takes the body of the request, it takes the id of the
comment from the url, it modifies the comment in the database and it redirects the client to the
interactions page. */
router.get('/editar-comentario/:id', ModificarComentario);

router.get('/eliminar-comentario/:id', eliminarComentario)

router.get('/convertir-a-cliente/:id', convertir_a_cliente);

router.post('/comentar/:id', enviarComenterio);

router.get('/comentar/:id', comentar)

router.get('/modificar/:id', modificarInteraccion);

router.post('/modificar/:id/create', verifyInteraccion, modificado);

router.get('/', getInteraccion);

router.get('/:id', getSingleInteraction);

router.get('/eliminar/:id', eliminarInteraccion);


 
module.exports = router;
