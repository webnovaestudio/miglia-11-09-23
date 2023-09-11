const {schemas} = require('./../schemas/validar_carga_empleados')

const verif_carga_emp = (req, res, next)=>{
    const {error, value} = schemas.auth.validate(req.body);
    //utilizo operadores ternarios
    error ? res.status(422).json({error : error.details[0].message}) 
    :next()
}

module.exports = {verif_carga_emp}