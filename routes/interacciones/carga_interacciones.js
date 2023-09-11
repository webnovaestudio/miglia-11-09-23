var express = require('express');
var router = express.Router();
const {interacciones, empleados, getMachines} = require('../../models/consulta')
const {verifyInteraccion} = require('../../middlewares/interacciones');

// Form de carga de interacciones
const get = async(req, res)=>{
 
    // Necesito una funcion para que me lista los empleados para ponernos como encarg secundarios 
    const habilitado = true;
    // Vendedores. Los necesito para el form
    const sellers = await empleados(habilitado);  
    // Máquinas. Las necesito en el form
    const machines = await getMachines(habilitado); 
    
    res.render('carga_interacciones', {sellers, machines});

}

// Carga la interacción
const interaccion = async(req, res)=>{
    // Datos de la interacción
    const obj = req.body; 
    // Crea una nueva interacción
    const nuevaInteraccion = await interacciones(obj);

    res.redirect('/interacciones')
}

router.get('/', get);
router.post('/create', verifyInteraccion, interaccion);


module.exports = router;