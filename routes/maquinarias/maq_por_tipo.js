var express = require('express');
var router = express.Router();
const {string_to_id, maquinas_filtro} = require('../../models/consulta')

// Para agarrar las máquinas.. es universal.. sirve para todas... Es para el filtro.
const getMaquinaPorCategoria = async(req, res) => {

    const habilitado = true;

    // 1- Obtengo la categoría de la máquina.
    const categoria = req.params.machine;

    // 2- Busco el id correspondiente a esa categ. en la tabla tipos_maquinarias.
    const id_categoria = await string_to_id(categoria);

    // 3- Una vez obtengo el id, paso el rowdatapacket a number.
    const id_categ = id_categoria[0]["id"];

    // 4- Ahora la categ en number, lo uso como parámetro en una consulta.
    const maquinas = await maquinas_filtro(id_categ, habilitado)

    console.log("maquinas filtro: ", maquinas);
 
    if(maquinas.length == 0){

         res.end(`<a href ='/maquinas_disponibles'>No hay este tipo de máquinas disponibles, volver...</a>`);

      }else{

      res.render('maquina_por_categoria', {maquinas});   
      }
  
  }

router.get('/:machine', getMaquinaPorCategoria);

module.exports = router;

