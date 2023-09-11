var express = require('express');
var router = express.Router();
const { Storage } = require('@google-cloud/storage');
const multer = require('multer')
const {setImage, getMaquinaria} = require("../../models/consulta")
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Configuración de Google Cloud Storage.
const storage = new Storage({
  projectId: 'principal-rope-394117',
  keyFilename: 'principal-rope-394117-50edf592e5aa.json', // Ruta al archivo de credenciales
});

// Reemplaza con el nombre de tu bucket
const bucket = storage.bucket('examplepoi');

const upload = multer({ storage: multer.memoryStorage() });

// Form carga fotos
const get = async(req, res) => {

  const id = req.params.id; 
  res.render("cargar_foto", {id})

}
router.get("/:id", get)

const getUniqueFileName = (originalFileName) => {
  // Obtenemos la extensión del archivo original (por ejemplo, '.jpg', '.png', etc.).
  const fileExtension = originalFileName.split('.').pop();

  // Generamos un nombre de archivo único basado en la fecha y hora actual.
  const uniqueName =   uuidv4();
  const newFileName = `${uniqueName}.${fileExtension}`;

  return newFileName;
};


// Función para redimensionar la imagen
async function resizeImage(buffer) {
  try {
    // Redimensionar la imagen a un nuevo tamaño específico (por ejemplo, 800x600)
    const resizedImageBuffer = await sharp(buffer)
     // .resize({ width: 500, height: 500, fit: 'inside', position: 'top' }) // 'fit' and 'position' options are optional but can be useful
      .png({ quality: 100, chromaSubsampling: '4:4:4' }) // Adjust quality options as needed
      .toBuffer();

    return resizedImageBuffer;
  } catch (err) {
    throw new Error('Error al redimensionar la imagen.');
  }
}


// Guardar fotos
router.post('/:id/create', upload.single('foto'), async (req, res) => {
  try {
    if (req.file) {
      console.log("Imagen encontrada, tratando de subirla...");

      // Generamos un nuevo nombre de archivo único basado en la fecha y hora actual.
      const newFileName = getUniqueFileName(req.file.originalname);

      // Agrego la referencia de la foto a la base de datos
      const id = req.params.id;
      const agregarFoto = await setImage(newFileName, id);

      // Redimensionar la imagen antes de guardarla en el bucket
      const resizedImageBuffer = await resizeImage(req.file.buffer);

      // Creamos una referencia al nuevo archivo en el bucket de Google Cloud Storage.
      const blob = bucket.file(newFileName);

      //console.log("Esto hay dentro de la variable blob: ", blob);

      // Creamos un stream de escritura para el nuevo archivo.
      const blobStream = blob.createWriteStream();

      // Cuando el stream de escritura termine (finish), enviamos una respuesta al cliente
      // indicando que la subida fue exitosa.
      blobStream.on("finish", () => {
       res.redirect("/maquinas_disponibles")
      });

      // Escribimos los datos del archivo redimensionado en el stream de escritura para que se guarde con el nuevo nombre.
      blobStream.end(resizedImageBuffer);
    } else {
      // Si no se envió ningún archivo en la solicitud, enviamos un mensaje de error al cliente.
      res.status(400).send("No se proporcionó ninguna imagen en la solicitud.");
    }
  } catch (e) {
    // Si ocurre algún error durante el proceso de subida de la imagen,
    // enviamos un mensaje de error al cliente con el código de estado 500 (Internal Server Error).
    res.status(500).send(e.message);
  }
});






module.exports = router;