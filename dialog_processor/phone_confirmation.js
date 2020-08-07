const dialog_processor = require('./index');
const validator = require('../utils/validator')
const sms = require('../utils/sms')

/**
 * Позиция каждого клиента
 * @key   {String} идентификатор сессии клиента
 * @value {String} позиция клиента
 */
let positions = [];

/**
 * Код, отправленный клиенту
 * @key   {String} идентификатор сессии клиента
 * @value {String} код, отправленный в смс
 * @value {String} телефон
 */
let codes  = [];
let phones = [];

/**
 * Получаем данные, необходимые для заявки на кредит
 * @param {Object} client  данные о клиенте
 * @param {String} message сообщение
 *
 * Диалог:
 *     Бот: Для составления заявки необходимо подтверить номер телефона.
 *          Введите номер телефона или "Отмена"
 *     Клиент <Номер телефона>
 *     Бот: Вам была отправлена СМС с кодом, введите его
 *     Клиент: <Вводит код>
 */
exports.process = async function(client, message) {
    const session_id = client.session_id;

    if (client.phone) {
        console.error(`У клиента уже установлен номер телефона ${client.phone}`);
        // Сбрасываем позицию
        dialog_processor.resetPosition(client);
        return;
    }

    // Если клиент зашел составлять заявку в первый раз
    if (positions[session_id] == undefined) {
        positions[session_id] = 'Клиент начал подтверждать телефон';
    }

    switch (positions[session_id]) {
        case 'Клиент начал подтверждать телефон':

        positions[session_id] = 'Клиент вводит номер телефона';
        return 'Для составления заявки необходимо подтверить номер телефона.\nНапишите номер телефона или "Отмена"';

        case 'Клиент вводит номер телефона':
            if (message.toLowerCase().indexOf('отмена') != -1) {
                console.info(`Клиент отменил операцию подтверждения телефона`);
                delete positions[session_id];
                dialog_processor.resetPosition(client);
                return 'Может быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!';
            }

            const phone = validator.phone(message);
            // Если клиент ввел какую-то фигню, а не номер телефона
            if (!phone) {
                return 'Я вас не понимаю. Напишите номер телефона в формате +7XXXXXXXXXX или "Отмена"';
            }
            phones[session_id] = phone;
            codes[session_id] = Math.floor(Math.random() * (9999 - 1000)) + 1000;
            sms.sendSMS(phone, `Акбарсик. Код подтверждения: ${codes[session_id]}`);

            console.debug(`На телефон ${phone} отправлен код подтверждения ${codes[session_id]}`);

            positions[session_id] = 'Клиент вводит код подтверждения';
            return 'Код подтверждения был отправлен на ваш телефон. Напишите его';

        case 'Клиент вводит код подтверждения':
            // Клиент прервал процедуру авторизации
            if (message.toLowerCase().indexOf('отмена') != -1) {
                console.info(`Клиент отменил операцию подтверждения телефона`);
                delete positions[session_id];
                dialog_processor.resetPosition(client);
                return 'Может быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!';
            }
            // Если код не совпадает
            if (message != codes[session_id]) {
                return 'Код не совпадает. Попробуйте еще раз.\nВы можете написать "Отмена" для прекращения оформления заявки';
            }
            // Если код совпадает, то телефон подтвержден
            dialog_processor.clients[session_id].phone = phones[session_id];

            // Освобождаем ресурсы
            delete codes[session_id];
            delete phones[session_id];
            delete positions[session_id];

            return 'Телефон подтвержден';
    }
}