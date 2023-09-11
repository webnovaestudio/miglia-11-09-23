var express = require('express');
var router = express.Router();
const { Storage } = require('@google-cloud/storage');
const multer = require('multer')
const sharp = require('sharp');
const { addFoto } = require("../../models/consulta");
const { v4: uuidv4 } = require('uuid');

// Configuración de Google Cloud Storage.
const storage = new Storage({
  projectId: 'principal-rope-394117',
  keyFilename: 'principal-rope-394117-50edf592e5aa.json', // Ruta al archivo de credenciales
});

// bucket
const bucket = storage.bucket('examplepoi');

const upload = multer({ storage: multer.memoryStorage() });


// Renderiza el formulario de carga
const render_cargar_galeria_hbs = async (req, res) => {

  const id_maquinaria = req.params.id;

  res.render("cargar_galeria", { id_maquinaria });

}

router.get("/:id", render_cargar_galeria_hbs)

// Genera nombres únicos para las fotos.
const getUniqueFileNames = (originalFileNames) => {
  const uniqueFileNames = [];
  for (const originalFileName of originalFileNames) {
    // Obtenemos la extensión del archivo original (por ejemplo, '.jpg', '.png', etc.).
    const fileExtension = originalFileName.split('.').pop();

    // Generamos un nombre de archivo único utilizando UUID.
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    uniqueFileNames.push(uniqueFileName);
  }
  return uniqueFileNames;
};

// Se llama resizeImage, pero en realidad sólo hace que la foto esté en su mejor calidad.
async function resizeImage(buffers) {
  try {

    const resizedImages = await Promise.all(buffers.map(async (buffer) => {
      // Redimensionar cada imagen a un nuevo tamaño específico (por ejemplo, 800x600)
      const resizedImageBuffer = await sharp(buffer)
        .png({ quality: 100, chromaSubsampling: '4:4:4' }) // Adjust quality options as needed
        .toBuffer();

      return resizedImageBuffer;
    }));

    return resizedImages;
  } catch (err) {
    throw new Error('Error al redimensionar las imágenes.');
  }
}

// Middleware personalizado para limitar la cantidad de fotos
/*
const limitarCantidadFotos = (req, res, next) => {

  const maxAllowedPhotos = 5; // Número máximo de fotos permitidas

  // Verificar si hay archivos en la solicitud
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No se han encontrado fotos para subir.");
  }

  // Verificar la cantidad de fotos
  if (req.files.length > maxAllowedPhotos) {
    return res.status(400).send("Se ha excedido el número máximo de fotos permitidas.");
  }

  next();
};
*/

// Guarda las fotos en google cloud
router.post('/create/:id', upload.array('fotos', 11), async (req, res) => {

  // cantidad de archivos
  const tamaño = req.files.length;

  // ID de la máquina_: Para redireccionar....
  const id_maquina = req.params.id;

  // Obtener nombres originales de los archivos cargados
  const originalFileNames = req.files.map(file => file.originalname);

  // Generar nuevos nombres de archivo únicos
  const newFileNames = getUniqueFileNames(originalFileNames);

  // Lógica para agregar las referencias de las fotos a la base de datos
  for (let i = 0; i < tamaño; i++) {
    const id_maquinaria = req.params.id;
    const nombre_foto = newFileNames[i];
    const obj = { id_maquinaria, nombre_foto };
    await addFoto(obj);
  }

  try {
    // Promesas para subir las imágenes
    const promesasSubida = newFileNames.map((newFileName, index) => {
      return new Promise((resolve, reject) => {
        const blob = bucket.file(newFileName);
        const blobStream = blob.createWriteStream();

        // Registrar el evento "finish"
        blobStream.on("finish", () => {
          // Cuando se haya subido una imagen, resolvemos la promesa.

          resolve();
        });

        // Registrar el evento "error"
        blobStream.on("error", (err) => {
          // Si ocurre algún error durante el proceso de subida de la imagen,
          // rechazamos la promesa con el error.
          reject(err);
        });

        // Escribir el buffer de la imagen en el blobStream para subirla al bucket.
        blobStream.end(req.files[index].buffer);
      });
    });

    // Esperar a que se resuelvan todas las promesas de subida de imágenes.
    await Promise.all(promesasSubida);

    // Cuando todas las imágenes se hayan subido, redireccionar al cliente.
    res.redirect("/maquinas_disponibles/" + id_maquina);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al subir las imágenes.");
  }



});


module.exports = router;
