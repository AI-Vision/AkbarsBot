/** Own modules */
const db = require('./index')

/**
 * Статусы заявления
 *   0 - не обработано
 *   1 - в обработке
 *   2 - обработано
 */


 /**
  * Получить все заявления
  */
 exports.getAll = async function() {
    const rows = await db.async_query('SELECT * FROM applications ORDER BY created DESC');

    return JSON.parse(JSON.stringify(rows));
 }

/**
 * Получить заявление по id
 * @param {Number} id - id заявления
 */
exports.getById = async function(id) {
    const rows = await db.async_query('SELECT * FROM applications WHERE id = ?', [id]);

    return JSON.parse(JSON.stringify(rows))[0];
}

/**
 * Получить заявления пользователя
 * @param {String} session_id - уникальный идентификатор пользователя
 */
exports.getBySessionId = async function(session_id) {
    const rows = await db.async_query('SELECT * FROM applications WHERE session_id = ?', [session_id]);

    return JSON.parse(JSON.stringify(rows))[0];
}

/**
 * Добавить заявление
 * @param {String} session_id  - уникальный идентификатор пользователя
 * @param {String} application - тип заявления
 * @param {String} data        - данные в JSON формате
 */
exports.add = async function(session_id, application, data) {
    await db.async_query('INSERT INTO applications(session_id, application, data) VALUES(?, ?, ?)', [session_id, application, data]);
}

/**
 * Удаляем заявление по id
 * @param {Number} id - id заявления
 */
exports.deleteById = async function(id) {
    await db.async_query('DELETE FROM applications WHERE id = ?', [id]);
}

/**
 * Устанавливаем пароль пользователю
 * @param {String} id     - id заявления
 * @param {String} status - новый пароль
 */
exports.setStatus = async function(id, status) {
    await db.async_query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
}