var express = require('express');
var router = express.Router();
const {interaccionPorEstado, allInteractions, borrarInteraccion, interacionPorId, interaccionPorusername} = require('./../../models/consulta');

//Aclaraciones:
//la constante habilitada va en true porque agarro las interacciones habilitadas.
//si sos observador(a), podes ver que uso siempre la misma funcion(ahorro de recursos) para los distintos tipos de
//ESTADO de las interacciones.

// Interacciones en curso.
const enCurso = async(req,res)=>{
    const en_curso = 'en curso'; 
    const habilitado = true;   
    const interaccionesEnCurso = await interaccionPorEstado(en_curso, habilitado);
    if(interaccionesEnCurso.length == 0){
        res.end(`<a href="/interacciones">No hay interacciones en curso, volver...</a>`)
    }else{
    //console.log('interacciones en curso: ', interaccionesEnCurso);
    res.render('enCurso', {interaccionesEnCurso});
    }
}
    
// Interacciones pendientes
const pendiente = async(req,res)=>{
    const pendiente_ = 'pendiente';  
    const habilitado = true;      
    const interaccionesPendientes = await interaccionPorEstado(pendiente_, habilitado);
    if(interaccionesPendientes.length == 0){
        res.end(`<a href="/interacciones">No hay interacciones pendientes, volver...</a>`)
    }else{
    //console.log('interacciones pendientes: ', interaccionesPendientes);
    res.render('pendiente', {interaccionesPendientes});
    }

}

// Interacciones concretadas.
const concretada = async(req,res)=>{
    const concretada_ = 'concretada';    
    const habilitado = true;    
    const interaccionesConcretadas = await interaccionPorEstado(concretada_, habilitado);
    if(interaccionesConcretadas.length == 0){
        res.end(`<a href="/interacciones">No hay interacciones concretadas, volver...</a>`)
    }else{
    //console.log('interacciones concretadas: ', interaccionesConcretadas);
    res.render('concretada', {interaccionesConcretadas});
    }

}

// Interacciones canceladas.
const cancelada = async(req,res)=>{
    const cancelada_ = 'cancelada';    
    const habilitado = true;    
    const interaccionesCanceladas = await interaccionPorEstado(cancelada_, habilitado);
    if(interaccionesCanceladas.length == 0){
        res.end(`<a href="/interacciones">No hay interacciones cancelas, volver...</a>`)
    }else{
    //console.log('interacciones canceladas: ', interaccionesCanceladas);
    res.render('canceladas', {interaccionesCanceladas});
    }
}

 
// Para agarrar todas las Interacciones eliminadas.
const interEliminadas = async(req, res)=>{
    const all = true;
    const habilitado = false;
    const interaccionesEliminadas = await allInteractions(habilitado);
    if(interaccionesEliminadas.length == 0){
        res.end(`<a href = "/interacciones">Parece que no hay interacciones eliminadas, volver a interacciones habilitadas...</a>`)
    }
    //console.log(interaccionesEliminadas);
    res.render('interacciones_eliminadas', {interaccionesEliminadas, all})
}

//agregado 21/08/22
// Single de interacciones eliminadas.
const getSingleDeleted = async(req, res)=>{
    const all = false;//solo una interaccion
    const habilitado = false;
    const id = req.params.id;
    const interaccionUnica = await interacionPorId(id, habilitado)
    //console.log("interaccion por id en single: ",interaccionUnica);
    res.render('interacciones_eliminadas', {interaccionUnica, all})  

}


// Para habilitar una Interacción
const habilitarInteraccion = async(req, res)=>{
    // Necesito el id de la inter. que voy a borrar
    const id = req.params.id;
    // Y pasarle habilitado en true
    const habilitado = true;

    const interHabilitada = await borrarInteraccion(id, habilitado);

    res.redirect('/interacciones');
}


// Archivos de interacciones
const archivo_interacciones = (req,res)=>{
    const archivo = true;
    res.render('archivo_interacciones', {archivo})
}

const filtradoPorUsername = async(req, res)=>{

    const nombre_vendedor = req.params.nombre_vendedor;

    const habilitado = true;

    const filtro = await interaccionPorusername(nombre_vendedor, habilitado);
    
    if(filtro.length == 0){
        res.end(`<a href = "/interacciones">Parece que no hay interaccion realizadas por este usuario, volver...</a>`);
    }else{
        res.render('filtrarPorRespSeguimiento', {filtro});
    }

}



router.get('/habilitar/:id', habilitarInteraccion);

router.get('/en_curso',  enCurso);

router.get('/pendiente',  pendiente);

router.get('/concretada',  concretada);

router.get('/cancelada',  cancelada);

router.get('/interacciones_eliminadas', interEliminadas);

router.get('/interacciones_eliminadas/:id', getSingleDeleted);

router.get('/archivo_de_interacciones', archivo_interacciones);

router.get('/:nombre_vendedor', filtradoPorUsername);


module.exports = router;


