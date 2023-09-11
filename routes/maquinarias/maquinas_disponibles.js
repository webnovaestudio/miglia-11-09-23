var express = require('express');
var router = express.Router();
const { id_to_string, Maquinas, maquinaSingle, eliminarMaquina, modif_machine, getMaquinaria, getFotos, fotosGaleria } = require('../../models/consulta');
const { verifyLoad } = require('../../middlewares/validar_carga_maq');

// Datos necesarios para acceder a mi proyecto de Google Cloud
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ projectId: 'principal-rope-394117', keyFilename: 'principal-rope-394117-50edf592e5aa.json' });
const bucket = storage.bucket('examplepoi');


async function getPublicUrlsFromDatabase() {
  try {
    const fotos = await getFotos();
    // console.log("fotos: ", fotos);

    if (!fotos || fotos.length === 0) {
      console.warn('No se encontraron fotos en la base de datos.');
      return []; // Devolvemos un arreglo vacío si no hay fotos en la base de datos
    }

    // Mapeamos los objetos RowDataPacket para obtener solo los nombres de las fotos
    const photoNames = fotos.map(row => row.foto);
    // console.log("photoNames:", photoNames);
    return photoNames;
  } catch (error) {
    console.error('Error al obtener las fotos desde la base de datos:', error);
    return []; // Devolvemos un arreglo vacío si ocurre algún error
  }
}

async function getPublicUrls() {
  try {
    const photoNames = await getPublicUrlsFromDatabase();

    console.log("photoNames: ", photoNames);

    // Creamos un arreglo para almacenar las URLs públicas
    const urls = await Promise.all(
      photoNames.map(async (photoName) => {
        if (!photoName) {
          // Si el nombre de la foto es nulo o vacío, retornamos una URL "fantasma" vacía
          return 'URL_FANTASMA';
        }

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
          return 'URL_FANTASMA';
        }
      })
    );

    return urls;
  } catch (error) {
    console.error('Error al obtener las URLs públicas:', error);
    return []; // Devolvemos un arreglo vacío si ocurre algún error
  }
}



// Selecciona las máquinas disponibles
const maquinas_disponibles = async (req, res) => {

  const habilitado = true;

  const all = true;

  // Categorías de maquinas. Para el filtro
  const CategoriaMaquinaria = await getMaquinaria(habilitado);

  // Listado de maquinarias
  const maquinarias = await Maquinas(habilitado);

  // Recupera las fotos desde google cloud
  getPublicUrls()

    .then(urls => {

      const datos = maquinarias.map((newData, index) => ({

        ...newData,

        public_url: urls[index],

      }));

      console.log("datos de maquinaria con url pública para fotos: ", datos);

      // Renderiza la vista 'fotos.hbs' y pasa las URLs públicas como propiedad
      res.render('maquinasDisponibles', { CategoriaMaquinaria, all, datos });
    })
    .catch(err => res.status(500).send(err));

};

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
const unicaMaquina = async (req, res) => {
  try {
    // Declaración de variable por fuera de if para que puedan existir fuera de él
    var referencia_foto;

    var url_foto;

    var photoNames;

    const all = false;

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
      photoNames = await fotosGaleria(id)

    }

    if (photoNames && photoNames.length > 0) {

      // Creo array con los nombres de las fotos. Sin propiedades.
      const cloneNamesPhotosGallery = photoNames.map(foto => foto.nombre_foto);


      // Usar await dentro de una función async: incluso si getPublicUrlGallery() es una promesa.
      // URLS públicas obtenidas.
      const urls = await getPublicUrlGallery(cloneNamesPhotosGallery);


      // Objetivo: Fusión de dos row data packet en uno.
      // fullInfoGallery contendrá toda la información de: "photoNames" + las URLS públicas
      // alojadas en la variable "urls".
      const fullInfoGallery = photoNames.map((foto, index) => ({
        ...foto, // foto, es la información que tiene photoNames en cada iteración que hace la función map.
        url: urls[index] // url, es la nueva propiedad que tendra fullInfoGallery. Propiedad que aloja las URLS P.
      }))

      console.log("fullInfoGallery: ", fullInfoGallery);

      res.render('maquinasDisponibles', { maquinaPorId, all, url_foto, fullInfoGallery });

    } else {

      res.render('maquinasDisponibles', { maquinaPorId, all, url_foto });

    }


  } catch (e) {
    console.log(e);
  }

}


// Eliminar una máquina
const bajaLogica = async (req, res) => {

  const habilitado = false;

  const id = req.params.id;

  const maquinaEliminada = await eliminarMaquina(id, habilitado);

  res.redirect('/maquinas_disponibles');

}

// Habilitar una maquina
const habilitarMaquina = async (req, res) => {

  const habilitado = true;

  const id = req.params.id;

  const maquinaHabilitada = await eliminarMaquina(id, habilitado);

  res.redirect('/maquinas_disponibles');

}

// Me muestra la máquina selccionada para modificar
const modificar_maquina = async (req, res) => {

  // Habilitado
  const habilitado = true;

  // Id de la máquina a modificar
  const id = req.params.id;

  // Listado categoría + id de todas las máquinas
  const CategoriaMaquinaria = await getMaquinaria(habilitado);

  // Datos máquina a modificar
  const datosMaquinaSingle = await maquinaSingle(id);

  if (datosMaquinaSingle.length > 0) {
    // 1- Obtengo el tipo_de_maquinaria
    const id_categoria = datosMaquinaSingle[0]["tipo_de_maquinaria"];
    //console.log("id_categoria: ", id_categoria);
    // 2- Selecciono la categoría que le corresponde
    const categoria_string = await id_to_string(id_categoria);
    //console.log("categoria_string: ", categoria_string);
    const cat_str = categoria_string[0]["machine"]
    //console.log("cat_str: ", cat_str);
    // 3- Guardo los datos del punto 1 y el 2 en un mismo objeto.

    res.render('modificar_maquina', { datosMaquinaSingle, id_categoria, cat_str, CategoriaMaquinaria })
  }

}

// Modifica los datos de la maquina seleccionada
const maquina_modifcada = async (req, res) => {

  const id = req.params.id;

  const obj = req.body;

  const maquina_modificada = await modif_machine(id, obj);

  res.redirect('/maquinas_disponibles/' + `${id}`)

}


router.get('/modificar/:id', modificar_maquina);

router.post('/modificar/:id', verifyLoad, maquina_modifcada);

router.get('/eliminar/:id', bajaLogica);

router.get('/habilitar/:id', habilitarMaquina);

router.get('/:id', unicaMaquina);

router.get('/', maquinas_disponibles);



module.exports = router;
