var express = require('express');
var router = express.Router();

const {createMachine, validationMachine, getMachines, eliminarUnTipoMaquinaria, singleTipoMaquinaria,modificarTipoMaquinaria02 } = require('../../models/consulta');

const {carga_Tipo_Maq} = require('../../middlewares/tipoMaquinarias');//middlewares

// Listado de tipo de maquinarias. 
// Seria para mostrarle a los usuarios todos los tipos de maquinarias que tienen. 
// Este listado no representa la cantidad de maquinas que tiene para vender, sino los diferentes tipos de 
// máquinas existente dentro de la empresa.

const getListadoHabilitado = async(req, res) => {

    const habilitado = true;

    const machine_type = await getMachines(habilitado);

    res.render('TipoMaquinariaHabilitado', {machine_type});
}

// Tipos eliminados.
const getListadoEliminado = async(req, res) => {

    const habilitado = false;

    const machine_type_deleted = await getMachines(habilitado);

    if(machine_type_deleted.length == 0){

        res.end(`<a href="/listado_tipo_maquinaria">Parece que no hay tipos de maquinaria eliminados, volver al listado de tipos de maquinarias...</a>`);
    }else{
   

        res.render('TipoMaquinariaEliminado', {machine_type_deleted});
    }

}

// Para eliminar un tipo de maquinaria.
const eliminarTipoMaquinaria = async(req, res) => {
  
    const habilitado = false;
        
    const id = req.params.id;

    const tipoMaquinaEliminado = await eliminarUnTipoMaquinaria(habilitado, id);
   
        
    res.redirect('/listado_tipo_maquinaria');
   
}

// Habilitar tipo maquinaria.
const habilitarTipoMaquinaria = async(req, res) => {
  
    const habilitado = true;
        
    const id = req.params.id;

    const tipoMaquinaHabilitado = await eliminarUnTipoMaquinaria(habilitado, id);
        
    res.redirect('/listado_tipo_maquinaria');
   
}
// Form para modificar maquinaria
const modificarTipoMaquinaria01 = async(req, res) => {

    const id = req.params.id;
    const habilitado = true;

    const datos = await singleTipoMaquinaria(id, habilitado);

    res.render('modificarTipoMaq', {datos})
}

// Guarda las modificaciones
const tipoMaquinariaModificado = async(req, res) => {

    const tipoMaquinaria = req.body;

    const id = req.params.id;

    const habilitado = true;

    const tipoModificado = await modificarTipoMaquinaria02(tipoMaquinaria, id, habilitado);

    res.redirect('/listado_tipo_maquinaria');

}
// Form para carga de nuevos tipos de maquinarias
const get = async(req, res) => {

    res.render('cargarNuevosTipos');
}

// Guarda el nuevo tipo de maquinaria.
const newMachine = async(req, res) => {

    const obj = req.body;

    const machineName = req.body.machine;

    // Si tengo un resultado = 0 es porque esa máquina no esta cargada en la base de datos.
    const result = await validationMachine(machineName);
    
    if(result.length == 0){
      
        const newMachine = await createMachine(obj);
       
        res.redirect('/listado_tipo_maquinaria');
    }

    else{
        
        res.end(`<a href="/listado_tipo_maquinaria/cargar">Parece que el tipo de maquinaria que intenta cargar ya esta cargado, intente con otro...</a>`)
    }

}

router.get('/', getListadoHabilitado);

router.get('/eliminados', getListadoEliminado);

router.get('/eliminar/:id', eliminarTipoMaquinaria);

router.get('/habilitar/:id', habilitarTipoMaquinaria);

router.get('/modificar/:id', modificarTipoMaquinaria01);

router.post('/modificar/:id/create', carga_Tipo_Maq, tipoMaquinariaModificado);

router.get('/cargar', get);

router.post('/cargar/create', carga_Tipo_Maq, newMachine);


module.exports = router;
