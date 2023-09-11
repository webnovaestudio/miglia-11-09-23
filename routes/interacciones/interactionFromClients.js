var express = require('express');
var router = express.Router();
const {cliente, empleados, getMachines, interacciones} =  require('../../models/consulta')
const {verifyInteraccion} = require('../../middlewares/interacciones');

// Para agarrar el form de carga de interacciones con los datos de un cliente determinado.
// Esto funcion va a estar disponible para la vista de listado de clientes dentro de "Detalles"
const get = async(req, res)=>{
    const id = req.params.id;
    const habilitado = true;
    const singleCliente = await cliente(id, habilitado);
    const sellers = await empleados(habilitado);
    //console.log('sellers: ', sellers);
    const machines = await getMachines(habilitado);
    //console.log("maquinas en inter from clientes: ", machines);

    res.render('cargar_interaccion_desde_clientes', {singleCliente, sellers, machines});
}

/**
 * It takes the data from the form, creates a new object with the data, and then saves it to the
 * database
 * @param req - The request object represents the HTTP request and has properties for the request query
 * string, parameters, body, HTTP headers, and so on.
 * @param res - The response object.
 */
const loadInteraction = async(req, res)=>{
    const obj = req.body;
    const newInteraction = await interacciones(obj);
    res.redirect('/interacciones');
}

//no olvidar cargar el middleware de validacion de carga de interacciones.
router.get('/:id', get);

router.post('/:id/create',verifyInteraccion, loadInteraction)


module.exports = router;
