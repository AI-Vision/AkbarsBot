const dialog_processor = require('./index');

/**
 * Позиция каждого клиента
 * @key   {String} идентификатор сессии клиента
 * @value {String} позиция клиента
 */
let positions = [];

let data = [];

/**
 * Получаем данные, необходимые для заявки на кредитную карту
 * @param {Object} client  данные о клиенте
 * @param {String} message сообщение
 *
 * Диалог:
 *     Бот: Напишите своё ФИО
 *     Клиент <ФИО>
 *     Бот: Напишите дату рождения
 *     Клиент: <Дата рождения>
 *     Бот: Напишите ваш телефон
 *     Клиент: <Телефон>
 *     Бот: Напишите телефон для связи
 *     Клиент: <Телефон>
 *     Бот: Спасибо, ваша заявка принята. Скоро с вами свяжется оператор!
 */
exports.process = function(client, message) {
    const session_id = client.session_id;

    // Если клиент зашел составлять заявку в первый раз
    if (positions[session_id] == undefined) {
        positions[session_id] = 'Клиент начал составлять заявку';
    }

    switch (positions[session_id]) {
        case 'Клиент начал составлять заявку':
            data[session_id] = {};

            positions[session_id] = 'Клиент вводит ФИО';
            return 'Напишите ваше ФИО';

        case 'Клиент вводит ФИО':
            data[session_id].name = message; // TODO: Проверять данные

            positions[session_id] = 'Клиент вводит дату рождения';
            return 'Напишите вашу дату рождения';

        case 'Клиент вводит дату рождения':
            data[session_id].birthday = message;

            positions[session_id] = 'Клиент вводит телефон';
            return 'Напишите номер вашего телефона ';

        case 'Клиент вводит номер телефона':
            data[session_id].phone = message;

            return JSON.stringify(data[session_id]);

            console.log('Клиент оформил заявку на кредитную карту!');

            // Удаляем ненужные данные и сбрасываем позицию
            delete data[session_id];
            dialog_processor.resetPosition(client);

            return 'Ваша заявкя принята. После рассмотрения заявки с вами свяжется оператор.';
    }
}