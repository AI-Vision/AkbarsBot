const mysql  = require('mysql')

/** Own modules */
const config = require('../config.js');


const db = mysql.createPool({
    connectionLimit: 3,
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
})

db.on('connection', () => {
    console.info("Подключение к БД прошло успешно");
})

db.on('error', (err) => {
    console.warn("Ошибка при подключении к бд", { json: err })
    process.exit(1);
})

/**
 * Асинхронный запрос к БД
 * @param {String} query  - SQL запрос
 * @param {Array}  params - Массив параметров
*/
exports.async_query = function(query, params = []) {
    return new Promise(function(resolve, reject) {
        db.query(query, params, function(err, rows) {
            if (err) {
                console.error(query, {json: err});
                reject(err);
            }

            if (rows === undefined) resolve(undefined);
            else resolve(rows);
        });
    });
};

/** Подключаем файлы, содержащие функционал для работы с БД */
exports.users    = require('./users.js');            // Функции для работы с пользователями
exports.sessions = require('./sessions.js');         // Сессии
exports.applications = require('./applications.js')  // Функции для работы с заявками