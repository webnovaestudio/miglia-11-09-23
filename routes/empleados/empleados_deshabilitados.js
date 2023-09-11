var express = require('express');
var router = express.Router();
const {empleados} =  require('../../models/consulta')

// Empleados deshabilitados.
const deshabilitados = async(req, res) => {

    // Todos los empleados deshabilitados
    const all = true;
    // Clientes deshabilitados
    const habilitado = false;
    // Obtengo los clientes deshabilitados
    const noHabilitados = await empleados(habilitado);
        
    if(noHabilitados.length == 0){
        
        res.end(`<a href ="/empleados">Parece que no hay usuarios deshabilitados, volver a usuarios habilitados...</a>`)
        
    }else{
         
        
        res.render('empDeshabilitados', {noHabilitados, all});
    }


    
}

router.get('/', deshabilitados)

module.exports = router;
