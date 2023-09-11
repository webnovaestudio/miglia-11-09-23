var express = require('express');
var router = express.Router();

const {Maquinas} =  require('../../models/consulta');

// Agarra las máquinas eliminadas
const cadaMaquinaEliminada = async(req,res) => {

    const habilitado = false;

    const maquinas = await Maquinas(habilitado);

    if(maquinas.length == 0){

        res.end(`<a href="/maquinas_disponibles">No hay maquinas eliminadas, volver...</a>`)

    }else{

    const all = true;

    res.render('maquinasEliminadas', {maquinas, all});
    
  }
}

router.get('/', cadaMaquinaEliminada)

module.exports = router;







