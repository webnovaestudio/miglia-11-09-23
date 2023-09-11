const {schemas} = require('./../schemas/modificar_empleado');

const modificateEmployee = (req, res, next)=>{
    const {error, value} = schemas.auth.validate(req.body);
    //utilizo operadores ternarios
    error ? res.status(422).json({error : error.details[0].message}) 
    :next()
}

module.exports = {modificateEmployee}