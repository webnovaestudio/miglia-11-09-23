const joi = require('@hapi/joi');
const schemas = {
    auth : joi.object().keys({

        //shortcut: ctrl + d para seleccionar todas las palabras que sean iguales a la seleccionada
        
     
        razon_social: joi.optional(),
        nombre_de_contacto: joi.string().required(),
        telefono: joi.string().required(),
        direccion: joi.optional(),
        localidad: joi.optional(),
        provincia:  joi.optional(),
        cuit:  joi.optional(),
        correo_electronico : joi.optional(),
        seguimiento: joi.string().required(),
        tipo_maquinaria: joi.string().required(),
        modelo_maquina: joi.optional(),
        seguimiento: joi.optional(),
        proximo_contacto: joi.date().required(),
        interesado_en: joi.string().required(),
        estado_interaccion: joi.optional(),
        semaforo_comercial: joi.optional(),
        observaciones: joi.optional()
 

    })
}
module.exports = {schemas}