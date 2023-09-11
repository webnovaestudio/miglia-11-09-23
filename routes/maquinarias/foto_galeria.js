var express = require('express');
var router = express.Router();
const {borrarFotoDeGaleria} = require("../../models/consulta");

const borrarImg = async(req, res) => {
    const id_foto_galeria = req.params.id_foto;
    console.log("id_foto_galeria: ", id_foto_galeria);
    const id_maquina = req.params.id_maquina;
    console.log("id_maquina: ", id_maquina);
    const eliminando_foto = await borrarFotoDeGaleria(id_foto_galeria);
    console.log("eliminando_foto: ", eliminando_foto);
    res.redirect("/maquinas_disponibles/" + id_maquina);
}

router.get("/borrar/:id_foto/:id_maquina", borrarImg);

module.exports = router;
