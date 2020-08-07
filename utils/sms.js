/**
 * Модуль отправки СМС сообщений через сервис smsc.ru
 */
const axios = require('axios');
const config = require('../config');

/**
 * Отправляем СМС сообщение {message} на номер {phone}
 * @note Номер телефона должен быть в международном формате
 *
 * @param {String} phone - номер телефона
 * @param {String} message - сообщение
 */
exports.sendSMS = async function(phone, message) {
    const params = {
        login: config.smsc.login,
        psw: config.smsc.psw,
        phones: phone,
        mes: message
    }

    try {
        const result = await axios.get('https://smsc.ru/sys/send.php', {params});
        console.debug(result.data);

        return true;
    } catch (error) {
        console.error('SMSC request error', error);

        return false;
    }
}