var express = require('express');
var router = express.Router();
const {agregarMaquina, getMachines} =require('../../models/consulta')
const {verifyLoad} = require('../../middlewares/validar_carga_maq')
 
// Form para cargar las maq
const get = async(req, res) => {
    //habilitado en true porque quiero las maquinas habilitadas
    const habilitado = true;
    //hago la consulta y guardo los datos en la variable machines
    const machines = await getMachines(habilitado);
    
    res.render("cargar_maq_disponible", {machines});
    
}

// Cargar máquinaria
const cargarMaquina = async(req, res) => {

        //obj lo paso como parametro. obj guarda los datos del form
        const obj = req.body;
    
        //carga la nueva maquina.
    
        const maquinaCargada = await agregarMaquina(obj);
        //console.log(maquinaCargada);
    
        res.redirect('/maquinas_disponibles');
}

router.get('/', get)

//valido que los datos sean correctos
router.post('/create',verifyLoad, cargarMaquina)

module.exports = router;
