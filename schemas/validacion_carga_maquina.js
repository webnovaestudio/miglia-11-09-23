const joi = require('@hapi/joi');
const schemas = {
    auth : joi.object().keys({
        maquinaria_modalidad: joi.string().required(),
        tipo_de_maquinaria: joi.string().required(),
        modelo_maquina: joi.string().required(),
        disponibilidad: joi.string().required(),
        estado_del_equipo: joi.string().required(),
        precio_usd: joi.number().required(),
        caracteristicas: joi.optional() 
    })
}
module.exports = {schemas}