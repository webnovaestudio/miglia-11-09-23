const {schemas} = require('../schemas/validacion_carga_maquina')

const verifyLoad = (req, res, next)=>{
    const {error, value} = schemas.auth.validate(req.body);
    //utilizo operadores ternarios
    error ? res.status(422).json({error : error.details[0].message}) 
    :next()
}

module.exports = {verifyLoad}