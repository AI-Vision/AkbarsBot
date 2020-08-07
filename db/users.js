/** Own modules */
const db = require('./index')


/**
 * Получить пользователя по id
 * @param {Number} id - id пользователя
 */
exports.getById = async function(id) {
    const rows = await db.async_query('SELECT * FROM users WHERE id = ?', [id]);

    return JSON.parse(JSON.stringify(rows))[0];
}

/**
 * Получить пользователя по логину
 * @param {String} login - логин пользователя
 */
exports.getByLogin = async function(login) {
    const rows = await db.async_query('SELECT * FROM users WHERE login = ?', [login]);

    return JSON.parse(JSON.stringify(rows))[0];
}

/**
 * Добавить пользователя
 * @param {String} login     - логин
 * @param {String} password  - пароль
 * @param {Number} parent_id - id главного пользователя
 */
exports.add = async function(login, password, parent_id = null) {
    await db.async_query('INSERT INTO users(login, password, parent_id) VALUES(?, ?, ?)', [login, password, parent_id]);
}

/**
 * Удаляем аккаунт
 * @param {String} login - логин пользователя
 */
exports.deleteByLogin = async function(login) {
    await db.async_query('DELETE FROM users WHERE login = ?', [login]);
}

/**
 * Получить дочерние аккаунты
 * @param {Number} admin_id - id администратора
 */
exports.getСhildAccounts = async function(admin_id) {
    const rows = await db.async_query('SELECT * FROM users WHERE parent_id = ?', [admin_id]);

    return JSON.parse(JSON.stringify(rows));
}

/**
 * Устанавливаем пароль пользователю
 * @param {String} login    - логин пользователя
 * @param {String} password - новый пароль
 */
exports.setPassword = async function(login, password) {
    await db.async_query('UPDATE users SET password = ? WHERE email = ?', [password, login]);
}