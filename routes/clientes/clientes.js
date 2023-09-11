var express = require('express');
var router = express.Router();
const path = require('path')
const consultas =  require('../../models/consulta')
const {validacion_clientes} = require('../../middlewares/validar_carga_clientes');

 
 


//para agarrar los datos de los clientes
const getDatos = async(req, res)=>{
    const all = true;// todos los clientes
    const habilitado = true;
    const clientes = await consultas.clientes(habilitado);//obtengo dicha informacion
    res.render('clientes', {clientes, all});
            
          
   
    //if(clientes.length == 0){
    //res.end(`<a href="/panel_de_control">No hay clientes cargados... Volver a Panel de control...</a>`)
    //}else{
    //console.log("clientes habilitados: ", clientes);
    //}

}

//datos de un solo cliente
const single = async(req, res)=>{
    const all = false;//solo un cliente     
    const habilitado = true;//que este habilitado
    const id = req.params.id;//necesito el id para no confundirme de cliente.   
    const cliente = await consultas.cliente(id, habilitado)//obtengo dicho cliente.
    //console.log("cliente single: ", cliente);
    res.render('clientes', {cliente, all})
}


//para eliminar un cliente
const eliminarCliente = async(req, res)=>{
    //necesito el id del cliente que voy a borrar
    const id = req.params.id;
    //y pasarle habilitado en false
    const habilitado = false;
    const clienteEliminado = await consultas.borrarCliente(id, habilitado);//elimino el cliente
    //console.log(clienteEliminado);
    res.redirect('/clientes');
}

//para agarrar el form para modificar cliente
const getModCliente = async(req, res)=>{
    const habilitado = true;//cliente habilitado     
    const id = req.params.id;//el obtengo el id para no confundirme de cliente  
    const cliente = await consultas.cliente(id, habilitado)//obtengo el cliente 
    //console.log(cliente);
    res.render('modificar_clientes', {cliente});
}

//para modificar los datos de un clientes
const modificarCliente = async(req, res)=>{
    const obj = req.body;//console.log(obj);
    const id = req.params.id;//console.log(id);
    const empleadoModificado = await consultas.modifyEmploy(obj, id);//modifico el cliente.
    //console.log('empleados modificado: ', empleadoModificado);
    res.redirect('/clientes/' + `${id}`);
}


router.get('/', getDatos);

router.get('/:id', single);

router.get('/eliminar/:id', eliminarCliente);

router.get('/modificar/:id', getModCliente);

router.post('/modificar/:id',validacion_clientes, modificarCliente);






module.exports = router;
