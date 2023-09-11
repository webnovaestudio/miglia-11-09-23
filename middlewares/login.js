const loged = (req,res,next)=>{ 
    if(req.session.user && req.session.rol == 1){
        res.end(`<a href = "/panel_de_control"> Parece que ya estas logueado amiguito, clic para volver</a>`)
    }
    else if(req.session.user){
        res.end(`<a href = "/interacciones"> Parece que ya estas logueado amiguito, clic para volver</a>`)
    }
    else{
        (next())
    }
    
    
    //req.session.user  ? 
    //: (next())
}

module.exports = {loged}