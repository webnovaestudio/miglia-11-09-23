const joi = require('@hapi/joi');
const schemas = {
    auth : joi.object().keys({

        //shortcut: ctrl + d para seleccionar todas las palabras que sean iguales a la seleccionada
        machine: joi.string().required()
 

    })
}
module.exports = {schemas}