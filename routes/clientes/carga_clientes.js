var express = require('express');
var router = express.Router();
const {createCliente, verifyExistUser} = require('../../models/consulta')
const {validacion_clientes} = require('../../middlewares/validar_carga_clientes');

//para agarrar el form
const get = (req, res)=>{
    res.render('carga_cliente');
}

//para enviar los datos del nuevo cliente
const cargarCliente = async(req, res)=>{
    // Obtengo el cuit
    const cuit = req.body.cuit;
    // Verifico que no esté el cuit cargado
    const result = await verifyExistUser(cuit);

    if(result.length  === 0){

        const obj = req.body;
 
        const clienteNuevo = await createCliente(obj)
 
        res.redirect('/clientes');

    }else{
        
        res.end('<a href="/carga_clientes">Parece que el cuit esta repetido, intente con otro cuit</a>')
    }

}

router.get('/', get);
router.post('/create', validacion_clientes, cargarCliente)

module.exports = router;
