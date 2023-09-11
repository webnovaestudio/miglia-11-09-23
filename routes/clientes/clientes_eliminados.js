
var express = require('express');
var router = express.Router();
const consultas = require('../../models/consulta');


//para agarrar los clientes eliminados
const clientesEliminados = async(req, res)=>{
    const all = true;// agarra todos los clientes eliminados
    const habilitado = false;//el habilitado en false hace referencia a que estan eliminados
    const clientesElim = await consultas.clientes(habilitado);//obtiene los clientes eliminados y los guarda en clientesElim
    if(clientesElim.length == 0){
        res.end(`<a href="/clientes">Parece no hay clientes eliminados, volver a clientes...</a>`)
    }else{
    //console.log("clientes eliminados: ", clientesElim);
    res.render('clientesEliminados', {clientesElim, all})
    }

}
//habilitar un cliente eliminado
const habilitarCliente = async(req, res)=>{
    //necesito el id del cliente que voy a borrar
    const id = req.params.id;
    //y pasarle habilitado en true
    const habilitado = true;
    const clienteEliminado = await consultas.borrarCliente(id, habilitado);
    //console.log("cliente eliminado: ", clienteEliminado);
    res.redirect('/clientes');
}

//datos de un solo cliente eliminado
const single = async(req, res)=>{
    const all = false;
    const habilitado = false;
    const id = req.params.id;
    const cliente = await consultas.cliente(id, habilitado)
    //console.log(cliente);
    res.render('clientesEliminados', {cliente, all})
}




router.get('/', clientesEliminados);
router.get('/habilitar/:id', habilitarCliente);
router.get('/:id', single)



module.exports = router;
