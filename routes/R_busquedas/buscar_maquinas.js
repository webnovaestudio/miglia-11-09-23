var express = require('express');
var router = express.Router();
 
const {getMaquinaria, maquinas_filtro} = require('./../../models/consulta')

// Renderiza la vista que me permite buscar las maquinarias. 
const get = async(req, res) => {

    // Habilitado en true para que busque las maquinas que estan habilitadas nada mas.
    const habilitado = true;
    // Me tira los tipos de maquinarias disponibles para ser buscadas
    const tiposDeMaquinas = await getMaquinaria(habilitado);

    res.render('buscar_maquinaria', {tiposDeMaquinas});
}


// Busca la maquinaria que se desea encontrar.
const buscarMaquina = async(req, res) => {

    // Habilitado en true para que busque las maquinas que estan habilitadas nada mas.
    const habilitado = true;
    
    // id_categoria hace referencia al tipo de maquinaria : cosechadora, ...
    const id_categoria = req.query.tipo_de_maquinaria;

    const id_categ = id_categoria[0]["tipo_de_maquinaria"]

    console.log("id_categ: ", id_categ);
    
    // Busca las maquinarias que coincidan con id_categoria y que esten habilitadas.
    const buscando_maquina = await maquinas_filtro(id_categoria, habilitado);

    console.log("buscando_maquina: ", buscando_maquina);
    
    // Si el la longitud de buscando_maquina es cero, es porque no se encontro la maquina que se esta buscando.
    if(buscando_maquina.length == 0){

        // Tiro la bandera "found" en false. Porque no se encontro la maquina.
        const found = false;
        
        // Le tiro el listado de maquinarias para que el buscador se complete solo y no tenga que escribir.
        const tiposDeMaquinas = await getMaquinaria(habilitado);

        res.render('buscar_maquinaria', {found, tiposDeMaquinas});

    }else{

        // Le tiro la bandera "found" en true porque se encontró la máquina que estaba buscando.
        const found = true;
 
        const tiposDeMaquinas = await getMaquinaria(habilitado);
 
        res.render('buscar_maquinaria', {buscando_maquina, found, tiposDeMaquinas});
    }
    
}

router.get('/', get);

router.get('/create', buscarMaquina);

module.exports = router;
