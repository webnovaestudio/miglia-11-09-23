const veryAdmin = (req,res,next)=>{ 
   req.session.rol == 1  && req.session.user  ? (next()) 
   : res.end(`<a href = "/interacciones">Logueate, por favor.</a>`)
}

module.exports = {veryAdmin}
