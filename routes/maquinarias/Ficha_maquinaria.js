var express = require('express');
var router = express.Router();
const {maquinaSingle, fotosGaleria} = require("../../models/consulta");

// Datos necesarios para acceder a mi proyecto de Google Cloud
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'principal-rope-394117', keyFilename: 'principal-rope-394117-50edf592e5aa.json' });
const bucket = storage.bucket('examplepoi');




// Obtiene la URL pública para una sóla foto.
async function getPublicUrlForPhoto(photoName) {
    try {
      // Verificamos si el nombre de la foto existe en Google Cloud Storage
      const file = bucket.file(photoName);
      const [exists] = await file.exists();
  
      if (exists) {
        // Si el nombre de la foto existe, obtenemos la URL pública
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 1000 * 60 * 60, // 1 hora
        });
        return url;
      } else {
        // Si el nombre de la foto no existe, devolvemos null
        // console.warn(`La foto con nombre ${photoName} no existe en Google Cloud Storage.`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener la URL pública:', error);
      return null; // Devolvemos null si ocurre algún error
    }
  }
  
  // Obtiene las url públicas para las fotos de la galería.
  const getPublicUrlGallery = async (cloneNamesPhotosGallery) => {
  
    // Referencias de las fotos de la galería obtenidas.
    const photoNames = cloneNamesPhotosGallery;
  
    // urls guarda las urls públicas.
    const urls = await Promise.all(
  
      photoNames.map(async (photoName) => {
  
        // Verificamos si el nombre de la foto existe en Google Cloud Storage
        const file = bucket.file(photoName);
  
        const [exists] = await file.exists();
  
        if (exists) {
          // Si el nombre de la foto existe, obtenemos la URL pública
          const [url] = await file.getSignedUrl({
  
            version: 'v4',
            action: 'read',
            expires: Date.now() + 1000 * 60 * 60, // 1 hora
          });
  
          return url;
        } else {
          // Si el nombre de la foto no existe, retornamos una URL "fantasma" vacía
          return null;
        }
      })
  
    );
  
    // Devolvemos la lista de URLs públicas.
    return urls;
  }
  

// Agarra solo una máquina habilitada, es decir, no eliminada
const getFicha = async (req, res) => {
    try {

      // Declaración de variable por fuera de if para que puedan existir fuera de él
      var referencia_foto;  
      var url_foto;   
      var photoNamesGallery;
  
      // Agarrar el id de la máquina por medio de la ruta
      const id = req.params.id;
  
      // Single máquina sin la categoría en forma de string
      const maquinaPorId = await maquinaSingle(id);
  
  
      if (maquinaPorId.length > 0) {
        // Referencia de foto destacada
        referencia_foto = maquinaPorId[0]['foto_destacada'];
  
        // URL de la foto destacada obtenida.
        url_foto = await getPublicUrlForPhoto(referencia_foto);
  
        // Obtiene las referencias de las fotos
        photoNamesGallery = await fotosGaleria(id)
  
      }
  
      if (photoNamesGallery && photoNamesGallery.length > 0) {
  
        // Creo array con los nombres de las fotos. Sin propiedades.
        const cloneNamesPhotosGallery = photoNamesGallery.map(foto => foto.nombre_foto);
  
        // URLS públicas obtenidas.
        const urls = await getPublicUrlGallery(cloneNamesPhotosGallery);
  
        res.render('ficha', { maquinaPorId, url_foto, urls });
  
      } else {
  
        res.render('ficha', { maquinaPorId, url_foto });
  
      }
  
    } catch (e) {
      console.log("error: ", e);
    }
  
  }

router.get("/:id", getFicha);

module.exports = router;
