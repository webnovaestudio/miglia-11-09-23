// Hace las consultas asicronicas
const util = require('util');
// Módulo mysql
const mysql = require('mysql');
// Conecto la base de datos al proyecto
const pool = mysql.createPool({
    host : '45.152.44.52',
    port :  '3306',
    password : 'Interpolwkx2023!',
    user : 'u217934892_crm23',
    database : 'u217934892_crm23',
    connectionLimit : 10
});
// Permito consultas asincronicas
pool.query = util.promisify(pool.query);
// Exporto la base de datos.
module.exports = pool;
