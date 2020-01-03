var mysql = require('mysql');
var database = mysql.createPool({
    connectionLimit: 10000,
    port: '3306',
    host: 'server1-280.mysql.database.azure.com',
    user: "adminUser@server1-280",
    password: "cmpe#280",
    database: "cmpe280",
    
})


module.exports = database;
/*var conn = mysql.createConnection({host: "server1-280.mysql.database.azure.com", user: "adminUser@server1-280", password: {your_password}, database: {your_database}, port: 3306, ssl:{ca:fs.readFileSync({ca-cert filename})}});*/
//var conn = mysql.createConnection({host: "server1-280.mysql.database.azure.com", user: "adminUser@server1-280", password: {your_password}, database: {your_database}, port: 3306, ssl:{ca:fs.readFileSync({ca-cert filename})}});