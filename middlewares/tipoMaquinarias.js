const {schemas} = require('./../schemas/validacion_tipoMaq');

const carga_Tipo_Maq = (req, res, next)=>{
    const {error, value} = schemas.auth.validate(req.body);
    //utilizo operadores ternarios
    error ? res.status(422).json({error : error.details[0].message}) 
    :next()
}

module.exports = {carga_Tipo_Maq}