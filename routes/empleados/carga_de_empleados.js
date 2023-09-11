var express = require('express');
var router = express.Router();

//08/10/22
var bcrypt = require('bcryptjs');

const {createEmpleado, empleados, differentWorkers, eliminarEmpleado, singleEmpleado, modificar, cambiarRol, existEmployee} = require('../../models/consulta')

const {verif_carga_emp} = require('../../middlewares/validar_carga_emp')//middlewares

const {modificateEmployee} = require('../../middlewares/modif_empleados');//middlewares

// Selecciona todos los empleados que estan habilitados, no discrima por profesion
const getEmpleados = async(req,res) => {

    const all = true; //Si es true muestro todos los empleados. Si es false muestro un single empleado
    
    const habilitado = true;

    const allEmpleados = await empleados(habilitado);

    res.render('empleados', {allEmpleados, all})
}
// Me agarra solo un empleado. le paso el id para que lo identifique
const single = async(req, res) => {

    const all = false;

    const id = req.params.id;
    
    const empleado = await singleEmpleado(id);
    
    res.render('empleados', {empleado, all})

}

// Form para cargar el empleado
const getCargaEmpleados = (req, res)=>{

    res.render('carga_de_empleados')

}

// Carga el empleado
const cargar_empleado = async(req,res)=>{
    // Tomo la contraseña
    const pass = req.body.contraseña;
    // Encripto la contraseña
    const passEncriptada = await bcrypt.hash(pass, 8);
    // Agrego al cuerpo de información la contraseña encriptada
    req.body.contraseña = passEncriptada;
    // Guardo el cuerpo de la información con la contraseña encriptada
    const obj = req.body;

    const nombreEmpleado = req.body.nombre_vendedor;
    
    const mail = req.body.correo_electronico;

    const telefono = req.body.telefono;
    // Verifico si existe el empleado que se cargó
    const result = await existEmployee(nombreEmpleado, mail, telefono);
    
    if(result.length === 0){
    
        const nuevoEmpleado = await createEmpleado(obj);
    
        //console.log(nuevoEmpleado);
        res.redirect('/empleados')
    
    }else{
    
        res.end("<a href ='/empleados/carga_empleado'>Parece que el nombre del vendedor, el telefono o el correo electronico estan repetidos, intente con otros datos</a>")
    }


}
// Vendedores habilitados
const getVendedores = async(req, res) => {

    const habilitado = true;
    
    const profesion = 'vendedor'
    
    const sellers = await differentWorkers(profesion, habilitado);
    
    if(sellers.length == 0){
    
        res.end(`<a href="/empleados">Parece que no hay vendedores habilitados, volver...</a>`)
    
    }else{
    
        res.render('vendedores',{sellers})
    }
}

// Empleados de servicio mecanico habilitados
const getMecanicos = async(req, res)=>{

    const habilitado = true;

    const profesion = 'Servicio Mecànico';

    const allMecanicos = await differentWorkers(profesion, habilitado);

    if(allMecanicos.length == 0){

        res.end(`<a href="/empleados">Parece que no hay mecanicos habilitados, volver...</a>`)

    }else{

        res.render('mecanicos',{allMecanicos})
    }    
   
}

// Repuesteros habilitados
const getRespuesteros = async(req, res) => { 

    const habilitado = true;

    const profesion = 'Repuestero'

    const allRepuesteros = await differentWorkers(profesion, habilitado);

    //console.log(allRepuesteros);
    if(allRepuesteros.length == 0){

        res.end(`<a href="/empleados">Parece que no hay repuesteros habilitados, volver...</a>`)
    }else{

        res.render('repuesteros',{allRepuesteros})
    }
}



// Eliminar un empleado 
const borrarEmpleado = async(req, res) => {

    const habilitado = false;

    const id = req.params.id;

    const empleadoEliminado = await eliminarEmpleado(id, habilitado);

    res.redirect('/empleados');
}

// Habilitar empleado
const habilitarEmplado = async(req, res) => {
    const habilitado = true;

    const id = req.params.id;

    const empHabilitado = await eliminarEmpleado(id, habilitado);

    //console.log(empHabilitado);
    res.redirect('/empleados');
}

// Form con los datos del empleado a modificar
const getMoficar = async(req, res) => {

    const id = req.params.id;

    const empleadoElegido = await singleEmpleado(id);
  
    res.render('modificar_empleado', {empleadoElegido})
}

// Guarda modificaciones
// La contraseña se cambia ???
const modificarEmpleado = async(req, res) => {

    const obj = req.body;

    const id = req.params.id;

    const empleadoMoficado = await modificar(id, obj);

    res.redirect('/empleados/' + `${id}`);

}

// Convertir en administrador un empleados
const convertAdmin = async(req, res)=>{
    // Le paso en true porque representa al 1 (en rol  de usuaario esta: administrador(1) y editor(0))
    const rol_usuario = true;
    
    // Necesito el id del empleado
    const id = req.params.id;

    // Empleado convertido.
    const admin = await cambiarRol(id, rol_usuario);

    res.redirect('/empleados');

}

// Convertir en editor un empleados
const convertEditor = async(req, res)=>{
    
    // Le paso en false porque representa al 0 (en rol  de usuaario esta: administrador(1) y editor(0))
    const rol_usuario = false;

    // Necesito el id del empleado
    const id = req.params.id;
    
    // Empleado convertido.
    const editor = await cambiarRol(id, rol_usuario);
 

    res.redirect('/empleados');

}

router.get('/', getEmpleados);

router.get('/carga_empleado', getCargaEmpleados);

router.post('/carga_empleado/create', verif_carga_emp, cargar_empleado);

router.get('/vendedores', getVendedores);

router.get('/macanicos', getMecanicos);

router.get('/repuesteros', getRespuesteros);

router.get('/eliminar/:id', borrarEmpleado);

router.get('/habilitar/:id', habilitarEmplado);

router.get('/:id', single);

router.get('/editar/:id', getMoficar);

router.post('/editar/:id', modificateEmployee, modificarEmpleado);

router.get('/a_admin/:id', convertAdmin);

router.get('/a_editor/:id', convertEditor);



module.exports = router;
