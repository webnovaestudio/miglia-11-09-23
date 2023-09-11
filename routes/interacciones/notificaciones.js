var express = require('express');
var router = express.Router();
const {notificaciones, interacionPorId, empleados, modifyInteraction, getMaquinaria} = require('../../models/consulta');


const get = async(req, res)=>{

    const habilitado = true;

    const status = true;

    const notifications = await notificaciones(habilitado, status);

    res.render('notificaciones', {notifications});
}

// Agarra los datos para modificar  una interacción que aparacen dentro de la seccion de "NOTIFICACIONES"
const modificarNotificacion = async(req, res) => {

    const id = req.params.id; // El id de la interacción a modificar... interacción que actua de notificacion
    
    const habilitado = true;// Agarro la interacción que este habilitada 
       
    const getMaquinaria_ = await getMaquinaria(habilitado)
    
    const datos = await interacionPorId(id, habilitado); // Selecciono la interacción a modif'
    
    const sellers = await empleados(habilitado); // Agarro los vendedores porque los neces' para el campo "seguimiento"

    res.render('modif_notificacion', {datos,  sellers, getMaquinaria_});

}


// Envio de modificaciones
const notificacionModificada = async(req, res) => {

    const id = req.params.id; // Necesito el id
    
    const cambios = req.body; //Agarro los cambios realizados

    const interModicada = await modifyInteraction(cambios, id); // Modifico la interacciona

    res.redirect('/notificaciones');
}


router.get('/', get);

router.get('/modificar/:id', modificarNotificacion)

router.post('/modificar/:id/create', notificacionModificada)

module.exports = router;
