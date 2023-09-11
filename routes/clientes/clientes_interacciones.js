var express = require('express');
var router = express.Router();

const consultas =  require('../../models/consulta')

// Agarra los clientes que han participado en interacciones 
const clientesConInteraccion = async(req, res)=>{
    
    const habilitado = true;//solo los habilitados

    const status = true;//solo las interacciones habilitadas

    const clientes_interacciones = await consultas.clientesInteracciones(habilitado, status);// obtengo dicha info'

    console.log("clientes_interacciones: ", clientes_interacciones)

    if(clientes_interacciones.length == 0) {

        res.end(`<a href = "/clientes" >Parece que no hay clientes que hayan participado en alguna interaccion, volver a clientes...</a>`);
    
    }else{

    res.render('clientes_con_interacciones', {clientes_interacciones})

    }

}


router.get('/', clientesConInteraccion)

module.exports = router;
