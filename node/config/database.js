const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'project-db-campus.smhrd.com',
    port: 3312,
    user: 'sc_25K_HI3_p2_3',
    password: 'smhrd3',
    database: 'sc_25K_HI3_p2_3'
});


module.exports = pool;