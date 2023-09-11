	
var express = require('express');
var router = express.Router();
var xl = require('excel4node'); // libreria para poder usar excel con node
const {getMaquinaria, Machine4Excel} = require('../../models/consulta');
const { writeFile } = require('fs/promises');

 

const get = async(req, res)=>{
  const habilitado = true;
  const maquinarias = await getMaquinaria(habilitado)
 
   
  res.render('descargar_Maquina_Excel',{maquinarias} );
  
}

const createExcelFile = async (req, res) => {


    const maquinaria = req.body.tipo_de_maquinaria;
 
    const modalidad = req.body.maquinaria_modalidad;
  
    const estado = req.body.estado_del_equipo;
    
    const disponibilidad = req.body.disponibilidad;
  
    const habilitado = true;
  
    const machine = await Machine4Excel(habilitado, maquinaria, modalidad, estado, disponibilidad);

    if(machine.length == 0 ){
      res.end(`<a href="/informe_maquinas">No se encontraron maquinas que cumplan con dichas condiciones, intente nuevamente...</a>`)
    }else{
        //En headerColumns guardo los nombres/ titulos de las columnas.
        const headerColumns = ["Maquinaria",  "Modelo y marca", "Modalidad", "Disponibilidad", "Estado", "Precio USD",  "Caracteristicas"];

        //Libro de trabajo. Inicio mi Libro de trabajo.
        const wb = new xl.Workbook()

        //Hoja de trabajo. Inicio mi Hoja de trabajo.
        const ws = wb.addWorksheet("clientes.xlsx")
        //NOTA:
        //ws: variable que representa a mi hoja de trabajo. Usando esta variable puedo agregarle columnas a nuestra hoja. estilos, filas, ...  
        // Create a reusable style
        var style = wb.createStyle({
          font: {
            color: '#FF0800',
            size: 12,
            
          },
          numberFormat: '$#,##0.00; ($#,##0.00); -',
        });


        //VARIABLE QUE DETERMINA LA CANTIDAD DE COLUMNAS
        let colIndex = 1

        //1: Le hago un for each a headerColumns para determinar la cantidad de elementos que tiene. En ese sentido, determino la cantidad de columna que voy a tener que agregarle a colIndex, que inicialmente tenia una  columna.
        headerColumns.forEach((item) => {
        //Por cada vuelta, le agegro una columa
        
          ws.cell(/*fila: */1, /*columna*/colIndex++)
          //En dichas columnas, le agrego el nombre. Item representa un elemento "x" del arreglo headerColumns
          .string(item)
          .style(style)
        })
        //VARIABLE QUE DETERMINA LA CANTIDAD DE FILAS
        let rowIndex = 2;
        //1: Le hago un for each a CLIENTES para determinar la cantidad de elementos que tiene. En ese sentido, determino la cantidad de FILAS que voy a tener que agregarle a rowIndex, que inicialmente tenia DOScolumna.
        machine.forEach((item) => {
            let columnIndex = 1;
            Object.keys(item).forEach((colName) => {
                ws.cell(rowIndex, columnIndex++).string(item[colName])
            })
            rowIndex++;
        })
  
         wb.write('maquinas.xlsx',   function (err, stats){
          if(err){
              console.log(err)
          }else{
 
              res.download('maquinas.xlsx')
            //IMPORTANTE, SIN ESTO: return false; TIRA ERROR : Error [ERR_HTTP_HEADERS_SENT]: ||  throw new ERR_HTTP_HEADERS_SENT('set');
            return false;
          }          
      });
    }

}

router.get('/', get)
router.post('/create', createExcelFile)

module.exports = router;


   // ws.column(1,2,3,4,5,6,7,8).setWidth(30);
   
   // ws.row(1,2,3,4,5,6,7,8).setHeight(20);