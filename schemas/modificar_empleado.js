const joi = require('@hapi/joi');
const schemas = {
    auth : joi.object().keys({
        nombre_vendedor: joi.string().required(),
        rol_de_usuario: joi.string().required(),
        perfil: joi.string().required(),
        telefono: joi.string().required(),
        correo_electronico: joi.string().email().required(),
        ubicacion: joi.string().required(),
        zona_comercial: joi.string().required(),
        //contraseña: joi.string().min(6).required(),
        observaciones: joi.optional()
    })
}
module.exports = {schemas}