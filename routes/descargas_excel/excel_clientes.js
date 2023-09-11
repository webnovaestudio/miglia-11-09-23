var express = require('express');
var router = express.Router();
var xl = require('excel4node'); // libreria para poder usar excel con node
const {clientesParaExcel} = require('../../models/consulta');


const createExcelFile = async(req, res) => {
   //En headerColumns guardo los nombres/ titulos de las columnas.
    const headerColumns = ["razon social", "nombre", "cuit", "localidad", "direccion", "provincia","correo_electronico", "semaforo comercial"];

    //Datos 
    const habilitado = true;

    const clientes  = await clientesParaExcel(habilitado);

    //Libro de trabajo. Inicio mi Libro de trabajo.
    const wb = new xl.Workbook()

    //Hoja de trabajo. Inicio mi Hoja de trabajo.
    const ws = wb.addWorksheet("clientes.xlsx")
    //NOTA:
    //ws: variable que representa a mi hoja de trabajo. Usando esta variable puedo agregarle columnas a nuestra hoja. estilos, filas, ...  

    //VARIABLE QUE DETERMINA LA CANTIDAD DE COLUMNAS
    let colIndex = 1
  
    //1: Le hago un for each a headerColumns para determinar la cantidad de elementos que tiene. En ese sentido, determino la cantidad de columna que voy a tener que agregarle a colIndex, que inicialmente tenia una  columna.
    headerColumns.forEach((item) => {
    //Por cada vuelta, le agegro una columa
       
      ws.cell(/*fila: */1, /*columna*/colIndex++)
      //En dichas columnas, le agrego el nombre. Item representa un elemento "x" del arreglo headerColumns
      .string(item)
    })
    //VARIABLE QUE DETERMINA LA CANTIDAD DE FILAS
    let rowIndex = 2;
    //1: Le hago un for each a CLIENTES para determinar la cantidad de elementos que tiene. En ese sentido, determino la cantidad de FILAS que voy a tener que agregarle a rowIndex, que inicialmente tenia DOScolumna.
    clientes.forEach((item) => {
        let columnIndex = 1;
        Object.keys(item).forEach((colName) => {
            ws.cell(rowIndex, columnIndex++).string(item[colName])
        })
        rowIndex++;
    })
 
    wb.write('clientes.xlsx',   function (err, stats){
      if(err){
          console.log(err)
      }else{
         res.download('clientes.xlsx');
        //IMPORTANTE, SIN ESTO: return false; TIRA ERROR : Error [ERR_HTTP_HEADERS_SENT]: ||  throw new ERR_HTTP_HEADERS_SENT('set');
        return false;
      }          
  });

}


router.get('/', createExcelFile )

module.exports = router;


   // ws.column(1,2,3,4,5,6,7,8).setWidth(30);
   
   // ws.row(1,2,3,4,5,6,7,8).setHeight(20);