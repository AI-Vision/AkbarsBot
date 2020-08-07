const dialog_processor = require('./index');
/**
 * Позиция каждого клиента
 * @key   {String} идентификатор сессии клиента
 * @value {String} позиция клиента
 */
let positions = [];

let data = [];

/**
 * Получаем данные, необходимые для заявки на ПИФ
 * @param {Object} client  данные о клиенте
 * @param {String} message сообщение
 *
 * Диалог:
 *     Бот: Напишите сумму вклада
 *     Клиент <Сумма вклада>
 *     Бот: Напишите срок вклада
 *     Клиент: <Срок вклада>
 *     Бот: Напишите ваше ФИО
 *     Клиент: <ФИО>
 *     Бот: Напишите ваш телефон
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

            positions[session_id] = 'Клиент вводит сумму вклада';
            return 'Напишите сумму вклада';

        case 'Клиент вводит сумму вклада':
            data[session_id].sum = message;

            positions[session_id] = 'Клиент вводит срок вклада'
            return 'Напишите срок вклада';

        case 'Клиент вводит срок вклада':
            data[session_id].time = message;

            positions[session_id] = 'Клиент вводит ФИО';
            return 'Напишите ваше ФИО';

        case 'Клиент вводит ФИО':
            data[session_id].name = message; // TODO: Проверять данные

            positions[session_id] = 'Клиент вводит телефон';
            return 'Напишите номер вашего телефона ';

        case 'Клиент вводит номер телефона':
            data[session_id].phone = message;

            return JSON.stringify(data[session_id]);

            console.log('Клиент оформил заявку на депозит!');

            // Удаляем ненужные данные и сбрасываем позицию
            delete data[session_id];
            dialog_processor.resetPosition(client);

            return 'Ваша заявкя принята. После рассмотрения заявки с вами свяжется оператор.';
    }
}