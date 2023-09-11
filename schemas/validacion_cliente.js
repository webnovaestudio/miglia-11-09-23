
const joi = require('@hapi/joi');

const schemas = {
    auth : joi.object().keys({
        razon_social: joi.string().required(),
        nombre_de_contacto: joi.string().required(),
        telefono: joi.string().required(),
        direccion:  joi.string().required(),
        localidad: joi.string().required(),
        provincia: joi.string().required(),
        correo_electronico: joi.optional(),
        cuit: joi.number().required(),
        semaforo_comercial: joi.string().required(),
        observaciones: joi.optional()
    })
}
module.exports = {schemas}