
const pool = require('./../util/baseDatos')
const TABLA_MAQUINARIA = "MAQUINARIAS";
const TABLA_EMPLEADOS = 'EMPLEADOS';//ya no es vendedores, si no, empleados; ya que es un concepto mas abarcativo.
const TABLA_INTERACCIONES = 'INTERACCIONES';
const TABLA_CLIENTES = 'CLIENTES';
const TABLA_TIPO_MAQUINARIAS = 'TIPO_MAQUINARIAS'//esta tabla es la que guarda los tipo de maquinaria.
const TABLA_COMENTARIO = "COMENTARIOS"; //tabla para guardar los comentarios que se hacen sobre una interaccion
const TABLA_MAQUINA_GALERIA = "MAQUINARIA_GALERIA";

// Toma las interacciones que están a un día de ser atendidas
const messageInfo = async () => {
  try{
    const query = "SELECT DATE_FORMAT(proximo_contacto, '%d-%m-%Y') AS proximo_contacto, seguimiento, nombre_de_contacto FROM ?? WHERE DATEDIFF(proximo_contacto, CURDATE()) = 1 AND habilitado = true;"
    const params = [TABLA_INTERACCIONES];
    return await pool.query(query, params)
  }catch(e){
    console.log(e);
  }
}
// Agregar una foto destacada 
const setImage = async (foto, id) => {
  try {
    const query = "UPDATE ?? SET foto = ? WHERE id = ?";
    const params = [TABLA_MAQUINARIA, foto, id];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}
// Recordar que estas fotos son solo para una máquina.
// Además, remarcamos la diferencia entra máquina y tipo de máquina.
// Agregar fotos a la galería.
const addFoto = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_MAQUINA_GALERIA, obj];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}
// Todos los datos de una máquina específica --- Galería de fotos
const fotosGaleria = async (id) => {
  try {
    const query = "SELECT * FROM ?? WHERE id_maquinaria = ? AND foto_habilitada = true";
    const params = [TABLA_MAQUINA_GALERIA, id];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

// Borrar una foto de la galería de fotos de una máquina específica
const borrarFotoDeGaleria = async (id) => {
  try {
    const query = "UPDATE ?? SET foto_habilitada = false WHERE id_foto = ?";
    const params = [TABLA_MAQUINA_GALERIA, id];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

// Agarra todas las fotos destacadas
// Explicación de la consulta:
// 1 - Selecciona la foto destacada de cada tipo de maquinaria desde la tabla TIPO_DE_MAQUINARIAS
// 2 - Une las tablas TIPO_DE_MAQUINARIAS con MAQUINARIA
// 3 - Selecciona las fotos sólo donde el id de la tabla TIPO_DE_MAQUINARIAS coincido con el valor del campo tipo_de_maquinaria de la tabla  MAQUINARIA. Por ejemplo: Hay 3 máquinas cargadas de tipo "Accesorio" en la tabla MAQUINARIA, y la tabla TIPO_DE_MAQUINARIA tiene una foto destacada para ese tipo, habra tres (3) registros con la misma foto destacada
// 4 - Selecciona sólo las fotos de las máquinas habilitadas
// 5 - Ordena los registros de forma alfabética según el tipo de maquinaria
// --- Cambios ---
// Qué queremos ? : Cada maquinaria tendra su propia foto destacada. Ésta esta guardada en la tabla MAQUINARIA, es indep' al tipo.
// Antes entendamos cómo se listan las maquinarias: Se listan de forma alfabética ascendente dependiendo del tipo de maquinaria.
// Ejemplo: 1 - Accesorio, 2 - Camión, 3 - Bóte, ...
// Listamos las máquinarias,  no los tipos. Pero para listarlas tenemos en cuenta el tipo
// O sea, que para que se correspondan las fotos con las máquinas, a éstas hay que listarlas dependiendo el tipo de forma alfabética ascendente
// y sólo las máquinas habilitadas


const getFotos = async () => {
  try {
    const query = "SELECT m.foto FROM ?? m JOIN ?? tm ON m.tipo_de_maquinaria = tm.id WHERE m.habilitado = true ORDER BY tm.machine ASC";
   const params = [TABLA_MAQUINARIA, TABLA_TIPO_MAQUINARIAS]
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

/////panel de control//////

//para agarrar las ultimas 3 interacciones
//me agarra las ultimas 3 interacciones cargadas en el sistema. No se basa en el valor del campo proximo_contacto.
const getLastInteraction = async () => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.*  FROM ?? as inte WHERE inte.habilitado = TRUE AND (inte.estado_interaccion = 'en curso' or inte.estado_interaccion = 'pendiente') ORDER BY inte.proximo_contacto DESC LIMIT 6 ";
    const params = [TABLA_INTERACCIONES];
    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }
}

//Me tira las 3 notificaciones mas urgentes
const notificationAtControlPanel = async (habilitado, status) => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.* FROM ?? AS inte INNER JOIN ?? AS emp ON inte.seguimiento = emp.nombre_vendedor WHERE inte.habilitado = ? AND emp.habilitado = ? AND (inte.estado_interaccion = 'en curso' or inte.estado_interaccion = 'pendiente') ORDER BY inte.proximo_contacto ASC  LIMIT 6";
    const params = [TABLA_INTERACCIONES, TABLA_EMPLEADOS, habilitado, status];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}


//////////////////////MAQUINARIA////////////////////////

//Para cargar una nueva maquina.
const agregarMaquina = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_MAQUINARIA, obj];
    return await pool.query(query, params);
  }
  catch (e) {
    console.log(e);
  }
}

//para ver los sig datos de maq tanto disp. como para eliminadas.
//esto depende del valor que tenga el parametro "habilitado"
//Tipo de Maquinaria Estado Modelo y marca Disponibilidad Precio USD
// Explicación de la consulta paso a paso:
// 1 - Selecciona casi todos los datos de la tabla maquinaria
// 2 - Selecciona la foto destacada y el tipo de maquina(descripción) de la tabla tipo maquinarias
// 3 - Une las tablas MAQUINARIA y TIPO_DE_MAQUINARIA
// 4 - Selecciona los datos donde el valor del campo tipo_maquinaria de la tabla MAQUINARIA coincide con el id de la tabla TIPO_DE_MAQUINARIAS
// 5 - Selecciona sólo las maquinarias habilitadas
// 6 - Ordena los registros de forma alfabética dependiendo del tipo de maquinarias
//--- Cambios ---
// 1 - La foto, ahora, está en la tabla MAQUINARIA
// 2 - La consulta sigue siendo muy similar, con el único cambio en mt.foto_destacada
// Ahora será m.foto
// Seguira haciendo lo del punto 4, 5 y 6
const Maquinas = async (habilitado) => {
  try {
    const query = "SELECT m.foto, tm.machine, m.id, m.modelo_maquina, m.maquinaria_modalidad, m.precio_usd, m.estado_del_equipo, m.estado_del_equipo, m.disponibilidad FROM ?? as m JOIN ?? as tm ON m.tipo_de_maquinaria = tm.id AND m.habilitado = ? ORDER BY tm.machine ASC;"
    const params = [TABLA_MAQUINARIA, TABLA_TIPO_MAQUINARIAS, habilitado]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}

const maquinas_filtro = async (id_categ, habilitado) => {
  try {
    const query = "SELECT tm.machine, m.* FROM ?? as m JOIN ?? as tm ON m.tipo_de_maquinaria = tm.id AND tm.id = ? AND m.habilitado = ? ORDER BY tm.machine ASC;"
    const params = [TABLA_MAQUINARIA, TABLA_TIPO_MAQUINARIAS, id_categ, habilitado]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}



//para agarrar las  por grupo para el filtro en seccion
//maquinarias disponibles.
const getMaquinaria = async (habilitado) => {
  try {
    const query = "SELECT id, machine FROM ?? as m  WHERE m.habilitado = ? GROUP BY m.machine ORDER BY m.machine ";
    const params = [TABLA_TIPO_MAQUINARIAS, habilitado]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}



//para seleccionar todos los datos de una sola maquina
const maquinaSingle = async (id) => {
  try {
    const query =
      "SELECT tm.machine, m.* FROM ?? as m JOIN ?? as tm ON m.tipo_de_maquinaria = tm.id WHERE m.id = ?";
    const params = [TABLA_MAQUINARIA, TABLA_TIPO_MAQUINARIAS, id]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}



//para eliminar una maquina
const eliminarMaquina = async (id, habilitado) => {
  try {
    const query = "UPDATE ?? SET habilitado = ? WHERE id = ?"
    const params = [TABLA_MAQUINARIA, habilitado, id]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}
//para modificar un empleado
const modif_machine = async (id, obj) => {
  try {
    const query = "UPDATE ?? SET ? WHERE id = ?";
    const params = [TABLA_MAQUINARIA, obj, id];
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}

// Agarra el string(machine) y obtengo su equivalente en número(id)
const string_to_id = async (machine) => {
  try {
    const query = "SELECT id FROM ?? WHERE machine = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, machine];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

// Agarra el número(id) y obtengo su equivalente en string(machine)
const id_to_string = async (id_categ) => {
  try {
    const query = "SELECT machine FROM ?? WHERE id = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, id_categ];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}


//Para agarrar los datos de las maquinas que cumplen con los siguientes parametros.
//Esta funcion esta hecha solo para la descarga de datos en formato excel.

const Machine4Excel = async (habilitado, maquinaria, modalidad, estado, disponibilidad) => {
  try {
    const query = "SELECT tipo_de_maquinaria,  modelo_maquina, maquinaria_modalidad, disponibilidad, estado_del_equipo, precio_usd,  caracteristicas FROM ?? WHERE habilitado = ? AND tipo_de_maquinaria = ? AND  maquinaria_modalidad = ? AND estado_del_equipo = ? AND disponibilidad = ? "
    const params = [TABLA_MAQUINARIA, habilitado, maquinaria, modalidad, estado, disponibilidad]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}


///////////////////////////EMPLEADOS///////////////////////
//me crea un nuevo empleado
const createEmpleado = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ? ";
    const params = [TABLA_EMPLEADOS, obj];
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}

//me agarra todos los empleados sin discrimar profesion el paramtro habilitado si es true agarra los habilitados si es false agarra todos los deshabilitados.
const empleados = async (habilitado) => {
  try {
    const query = "SELECT emp.* FROM ?? AS emp WHERE emp.habilitado = ? ORDER BY nombre_vendedor ASC";
    const params = [TABLA_EMPLEADOS, habilitado];
    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }
}

//para verificar si e un empleado con los mismo datos y en consecuencia no duplicar los datos.
const existEmployee = async (nombre, correo, telefono) => {
  try {
    const query = "SELECT emp.nombre_vendedor, emp.correo_electronico, emp.telefono FROM ?? AS emp WHERE emp.nombre_vendedor = ? or emp.correo_electronico = ? or emp.telefono = ?";
    const params = [TABLA_EMPLEADOS, nombre, correo, telefono];
    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }

}

//me agarra vend, repuest, macans depediendo el valor del
//parametro profesion
const differentWorkers = async (profesion, habilitado) => {
  try {
    const query = "SELECT emp.* FROM ?? AS emp WHERE emp.perfil = ? AND emp.habilitado = ? ORDER BY emp.nombre_vendedor ASC";
    const params = [TABLA_EMPLEADOS, profesion, habilitado];
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }
}

//elimina un empleado
const eliminarEmpleado = async (id, habilitado) => {
  try {
    const query = "UPDATE ?? SET habilitado = ? WHERE id = ?"
    const params = [TABLA_EMPLEADOS, habilitado, id]
    return await pool.query(query, params)
  }
  catch (e) {
    console.log(e);
  }

}
//Agarra un solo empleado
const singleEmpleado = async (id) => {
  try {
    const query = "SELECT emp.* FROM ?? AS emp WHERE emp.id = ?";
    const params = [TABLA_EMPLEADOS, id]
    return await pool.query(query, params);
  }
  catch (e) {
    console.log(e);
  }
}

//modificar datos de un empleado
const modificar = async (id, obj) => {
  try {
    const query = "UPDATE ?? SET ? WHERE id = ?";
    const params = [TABLA_EMPLEADOS, obj, id];
    return await pool.query(query, params);

  }
  catch (e) {
    console.log(e);
  }
}

// voy a convertir al correo electronico y el id en variables globales porque las necesito.
//me sirve para verificar si el usuario existe
//y esto solo funciona si el usuario esta habilitado
const auth = async (correo_electronico, habilitado) => {
  try {
    const query = "SELECT emp.* FROM ?? AS emp WHERE correo_electronico = ? AND emp.habilitado = ?";
    const params = [TABLA_EMPLEADOS, correo_electronico, habilitado];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}




///////////////////////////INTERACCIONES//////////////////////
//para cargar las interraciones
const interacciones = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_INTERACCIONES, obj];
    return await pool.query(query, params);

  }
  catch (e) {
    console.log(e);
  }
}
//para filtrar por username 11/09/22
const interaccionPorusername = async (nombre_vendedor, habilitado) => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.* FROM ?? AS inte WHERE inte.seguimiento = ? AND inte.habilitado = ? AND (inte.estado_interaccion = 'En curso' or inte.estado_interaccion = 'Pendiente') ORDER BY inte.proximo_contacto";
    const params = [TABLA_INTERACCIONES, nombre_vendedor, habilitado];
    return await pool.query(query, params);

  }
  catch (e) {
    console.log(e);
  }
}


//para agarrar todas las interacciones
/*SELECT interacciones.* FROM interacciones ORDER BY proximo_contacto DESC*/
const allInteractions = async (habilitado) => {
  try {
    const query = "SELECT  DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.* FROM ?? AS inte WHERE (inte.estado_interaccion = 'En curso' OR inte.estado_interaccion = 'Pendiente') AND inte.habilitado = ? ORDER BY proximo_contacto ASC ";
    //console.log("datos interacciones - consulta: ", query);
    const params = [TABLA_INTERACCIONES, habilitado];

    return await pool.query(query, params);
  }
  catch (e) {
    console.log(e);
  }
}


//para agarrar la interacciones depen on status
const interaccionPorEstado = async (estado, habilitado) => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.* FROM ?? AS inte  WHERE inte.estado_interaccion = ? AND inte.habilitado = ?";

    const params = [TABLA_INTERACCIONES, estado, habilitado];

    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }
}


//21/08/22 agregue el parametro habilitado a la query
//////////////////////////////////////////////////////////////////////////////////////////////
//para agarrar solo una interaccion.
const interacionPorId = async (id, habilitado) => {

  try {
    const query = "SELECT * FROM ?? WHERE id = ? AND habilitado = ?";

    const params = [TABLA_INTERACCIONES, id, habilitado];

    return await pool.query(query, params);

  }
  catch (e) {
    console.log(e);
  }
}

//sirve para convertir a admin o a editor. Segun el valor del parametro "rol_de_usuario"
const cambiarRol = async (id, rol_usuario) => {

  try {

    const query = "UPDATE ?? SET rol_de_usuario = ? WHERE id = ?";
    const params = [TABLA_EMPLEADOS, rol_usuario, id];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }

}

//modicar interaccion
const modifyInteraction = async (cambios, id) => {
  try {
    const query = "UPDATE ?? SET ? WHERE id = ?";
    const params = [TABLA_INTERACCIONES, cambios, id];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}
//borrar interaccion
const borrarInteraccion = async (id, habilitado) => {
  try {
    const query = "UPDATE ?? SET habilitado = ? WHERE id = ?";
    const params = [TABLA_INTERACCIONES, habilitado, id];
    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }
}




///////COMENTARIOS////////

//agregar comentario a una interaccion

const comentarInteraccion = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_COMENTARIO, obj];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}


//obtener comentarios
const getComentarios = async (id_interaccion, habilitado) => {
  try {
    const query = "SELECT DATE_FORMAT(comen.ts_create, '%d-%m-%Y'),  DATE_FORMAT(comen.ts_update, '%d-%m-%Y'), comen.* FROM ??  as comen WHERE comen.id_interaccion = ? AND comen.comentario_habilitado = ?";
    const params = [TABLA_COMENTARIO, id_interaccion, habilitado];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}


const modificarComentario = async (obj, id, habilitado) => {

  try {
    const query = "UPDATE ?? SET ? WHERE id_comentario = ? AND comentario_habilitado = ?";
    const params = [TABLA_COMENTARIO, obj, id, habilitado];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

const deleteComent = async (id, habilitado) => {
  try {
    const query = "UPDATE ?? SET comentario_habilitado = ? WHERE id_comentario = ?";
    const params = [TABLA_COMENTARIO, habilitado, id];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}


const singleComent = async (id, habilitado) => {
  try {
    const query = "SELECT * FROM ?? WHERE id_comentario = ? AND comentario_habilitado = ?";
    const params = [TABLA_COMENTARIO, id, habilitado];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

////////////////TABLA_CLIENTES//////////////////////////////////

//buscar cliente por cuit .. interacciones.js funcion verificarCliente

const buscarClientePorCuit = async (cuit, habilitado) => {
  try {
    const query = "SELECT * FROM ?? WHERE cuit = ? AND habilitado = ?";
    const params = [TABLA_CLIENTES, cuit, habilitado];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}



//para crear un cliente(alta cliente)
const createCliente = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_CLIENTES, obj];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

//para verificar que no exitan dos clientes con el mismo cuit
const verifyExistUser = async (cuit) => {
  try {
    const query = "SELECT cuit FROM ?? WHERE  cuit = ?";
    const params = [TABLA_CLIENTES, cuit];
    return await pool.query(query, params)
  } catch (e) {
    console.log(e);
  }
}

//para agarrar los datos de los clientes que no han participado de una interaccion.
const clientes = async (habilitado) => {
  try {
    const query = "SELECT * FROM ?? WHERE habilitado = ? AND razon_social regexp '^[A-Za-z]' ORDER BY razon_social ASC";
    //console.log(query)
    const params = [TABLA_CLIENTES, habilitado];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}
//para agarrar los datos de los clientes y usarlo en un hoja de excel
const clientesParaExcel = async (habilitado) => {
  try {
    const query = "SELECT razon_social, nombre_de_contacto, cuit, localidad, direccion, provincia, correo_electronico, semaforo_comercial FROM ?? WHERE habilitado = ? AND razon_social regexp '^[A-Za-z]' ORDER BY razon_social ASC";
    //console.log(query)
    const params = [TABLA_CLIENTES, habilitado];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}


//para agarrar los datos de los clientes y tmb para agarrar la fecha de la ultima interaccion que tuvo un cliente "x" con un vendedor "x".


//para que esto funcione el correo del cliente debe estar en ambas tablas: interacciones y clientes.
const clientesInteracciones = async (habilitado, status) => {
  try {
    const query = "SELECT DATE_FORMAT(MAX(INTERACCIONES.ts_create), '%d-%m-%y'), CLIENTES.* FROM ?? INNER JOIN ?? ON INTERACCIONES.nombre_de_contacto = CLIENTES.nombre_de_contacto WHERE CLIENTES.habilitado = ? AND INTERACCIONES.habilitado = ? GROUP BY INTERACCIONES.nombre_de_contacto";
    const params = [TABLA_INTERACCIONES, TABLA_CLIENTES, habilitado, status];

    return await pool.query(query, params)

  } catch (e) {
    console.log(e);
  }
}

//para hacer single de cliente
const cliente = async (id, habilitado) => {
  try {
    const query = "SELECT cli.* FROM ?? AS cli WHERE cli.id = ? AND cli.habilitado = ?";
    const params = [TABLA_CLIENTES, id, habilitado];
    return await pool.query(query, params);


  } catch (e) {
    console.log(e);
  }
}


//para borrar un cliente.
const borrarCliente = async (id, habilitado) => {
  try {
    const query = "UPDATE ??  SET habilitado = ? WHERE id = ?";
    const params = [TABLA_CLIENTES, habilitado, id];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

//modificar cliente
const modifyEmploy = async (obj, id) => {
  try {
    const query = "UPDATE ?? SET ? WHERE id = ?";
    const params = [TABLA_CLIENTES, obj, id];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

//buscar cliente por razOn socail o contacto. Me tira todos los clientes que coincidan con el nombre que fue pasado como parAmetro. la funciOn SOUNDEX es como el operador LIKE pero este me permite encontrar los usuarios incluso si escribo mal el nombre. por ej: si yo tengo un usuario llamado alberto y yo pongo alverte, el programa terminarA por agarrarme alberto. por quE?... porque suena parecido. 
//El operador  funciona, pero si le coloco el signo % deja de hacerlo. Lo cual es un gran problema. No se cual es la sintaxis correcta. 

const search = async (razon_social, contact, cuit, localidad, habilitado) => {
  try {
    const query = 'SELECT cli.* FROM ?? AS cli WHERE (cli.nombre_de_contacto LIKE "%"?"%" OR cli.razon_social LIKE "%"?"%" OR cli.cuit LIKE ? OR cli.localidad = ?) AND cli.habilitado = ?';

    //const query = 'SELECT cli.* FROM ?? AS cli WHERE cli.razon_social LIKE ?"%" AND cli.habilitado = ?';

    const params = [TABLA_CLIENTES, razon_social, contact, cuit, localidad, habilitado];

    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}



//////////////////////////////MAQUINAS////////////////////////////////////////////
//31/08/22
const createMachine = async (obj) => {
  try {
    const query = "INSERT INTO ?? SET ?";
    const params = [TABLA_TIPO_MAQUINARIAS, obj];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}



const maquinaria_tipo = async () => {
  try {
    const query = "SELECT machine FROM ?? AS TM JOIN ?? AS MAQ ON TM.id = MAQ.tipo_de_maquinaria AND MAQ.habilitado = TRUE";
    const params = [TABLA_TIPO_MAQUINARIAS, TABLA_MAQUINARIA];
    return await pool.query(query, params);
  } catch (e) {
    console.log(e);
  }
}

//PARA AGARRAR TODOS LOS TIPOS DE MACHINES
const getMachines = async (habilitado) => {
  try {
    const query = "SELECT * FROM ?? WHERE habilitado = ? ORDER BY machine ASC";
    const params = [TABLA_TIPO_MAQUINARIAS, habilitado];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

//Validar que no se repitan los nombres de los tipos de maquinarias
//parametro habilitado? lo pongo no lo pongo?

const validationMachine = async (machineName) => {
  try {
    const query = "SELECT * FROM ?? WHERE machine = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, machineName];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}
//eliminar un tipo de maquinaria
//tipo hace refer' a por ejemplo: cosechadora, sembradora, ...
const eliminarUnTipoMaquinaria = async (habilitado, id) => {
  try {
    const query = "UPDATE ?? SET habilitado = ? WHERE id = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, habilitado, id]
    return await pool.query(query, params)

  } catch (e) {
    console.log(e);
  }
}

//singleTipoMaquinaria
const singleTipoMaquinaria = async (id, habilitado) => {
  try {
    const query = "SELECT * FROM ?? WHERE id = ? AND habilitado = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, id, habilitado];
    return await pool.query(query, params)

  } catch (e) {
    console.log(e);
  }
}
//para modificar tipo de maquinarias.
const modificarTipoMaquinaria02 = async (tipoMaquinaria, id, habilitado) => {
  try {
    const query = "UPDATE ?? SET ? WHERE id = ? AND habilitado = ?";
    const params = [TABLA_TIPO_MAQUINARIAS, tipoMaquinaria, id, habilitado];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

///////////////////////////////////////Notificaciones/////////////////////////////////////////////////////
const notificaciones = async (habilitado, status) => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), inte.id, inte.seguimiento, inte.nombre_de_contacto, inte.proximo_contacto, inte.estado_interaccion FROM ?? AS inte INNER JOIN ?? ON inte.seguimiento = EMPLEADOS.nombre_vendedor WHERE inte.habilitado = ? AND EMPLEADOS.habilitado = ? AND (inte.estado_interaccion = 'en curso' or inte.estado_interaccion = 'pendiente') ORDER BY inte.proximo_contacto ASC";
    const params = [TABLA_INTERACCIONES, TABLA_EMPLEADOS, habilitado, status];
    return await pool.query(query, params);

  } catch (e) {
    console.log(e);
  }
}

//me agarra los notificaciones de un empleado determinado, en base a su nombre y apellido.
//mejor lo puedo hacer por id.
const notifPorUsuario = async (fullName, habilitado, status) => {
  try {
    const query = "SELECT DATE_FORMAT(inte.proximo_contacto, '%d-%m-%Y'), interacciones.id, interacciones.seguimiento, interacciones.nombre_de_contacto, interacciones.estado_interaccion, interacciones.proximo_contacto FROM ?? INNER JOIN ?? ON interacciones.seguimiento = ? WHERE EMPLEADOS.habilitado = ? AND interacciones.habilitado = ? AND (interacciones.estado_interaccion = 'En curso' or interacciones.estado_interaccion = 'Pendiente') GROUP BY interacciones.proximo_contacto ASC; ";
    const params = [TABLA_INTERACCIONES, TABLA_EMPLEADOS, fullName, habilitado, status];
    return await pool.query(query, params)

  } catch (e) {
    console.log(e);
  }
}



module.exports = {

    ///PANEL DE CONTROL///
    /*dataPanelControl,*/notificationAtControlPanel,

  ///MAQUINARIA///
  borrarFotoDeGaleria, fotosGaleria, addFoto, getFotos, setImage, id_to_string, maquinas_filtro, string_to_id, maquinaria_tipo, agregarMaquina, Maquinas, maquinaSingle, eliminarMaquina, modif_machine, getMaquinaria, Machine4Excel,

  ///EMPLEADOS///
  createEmpleado, empleados, modifyEmploy, differentWorkers, eliminarEmpleado, singleEmpleado, cambiarRol, modificar, auth, existEmployee,

  ///CLIENTES///
  createCliente, borrarCliente, clientes, verifyExistUser, cliente, clientesInteracciones, search, clientesParaExcel, buscarClientePorCuit,

  ///INTERACCIONES JOIN CLIENTES///
  ///INTERACCIONES///
  allInteractions, interacciones, interacionPorId, modifyInteraction, interaccionPorEstado, borrarInteraccion, interaccionPorusername,
  getLastInteraction,/* fechasInteracciones,  selectCuit,existCuit*/

  ///COMENTARIOS///
  comentarInteraccion, modificarComentario, getComentarios, deleteComent, singleComent,
  ////////////////////////////////////////////////////


  ///TIPO DE MAQUINARIAS///
  createMachine, getMachines, validationMachine, eliminarUnTipoMaquinaria, singleTipoMaquinaria, modificarTipoMaquinaria02,

  ///NOTIFICACIONES///
  notificaciones, notifPorUsuario,

  //TWILIO
  messageInfo

}