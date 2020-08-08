const db = require('../db');
const dialog_processor = require('./index')

/**
 * Позиция каждого клиента
 * @key   {String} идентификатор сессии клиента
 * @value {String} позиция клиента
 */
let positions = [];

let data = [];

/**
 * Получаем данные, необходимые для заявки на кредит
 * @param {Object} client  данные о клиенте
 * @param {String} message сообщение
 *
 * Диалог:
 *     Бот: На какую сумму в рублях хотите взять кредит
 *     Клиент <Сумма кредита в рублях>
 *     Бот: На какой срок в месяцах хотите взять кредит
 *     Клиент: <Срок кредита в месяцах>
 *     Бот: Напишите ваше ФИО
 *     Клиент: <Сохраняем данные как ФИО>
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

            positions[session_id] = 'Клиент вводит сумму кредита';
            return 'На какую сумму в рублях хотите взять кредит';

        case 'Клиент вводит сумму кредита':
            data[session_id].sum = message; // TODO: Проверять данные

            positions[session_id] = 'Клиент вводит срок кредита';
            return 'На какой срок в месяцах хотите взять кредит';

        case 'Клиент вводит срок кредита':
            data[session_id].time = message;

            positions[session_id] = 'Клиент вводит ФИО';
            return 'Напишите ваше ФИО';

        case 'Клиент вводит ФИО':
            data[session_id].name = message;

            positions[session_id] = 'Клиент вводит почту';
            return 'Напишите вашу почту';

        case 'Клиент вводит почту':
            data[session_id].email = message;

            positions[session_id] = 'Клиент подтверждает корректность данных';

            return `Ваши данные\n`                            +
                   exports.generateData(session_id, 'string') +
                   '\n'                                       +
                   'Если данные верны, напишите "Верно"\n'    +
                   'Для отмены завяки напишите "Отмена"';

        case 'Клиент подтверждает корректность данных':
            let msg;

            if (message.toLowerCase().indexOf("отмена") != -1) {
                console.log('Клиент отменил оформление заявки на кредит')
                msg = "Ваша заявка отменена.\nМожет быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!";
            } else if (message.toLowerCase().indexOf("верно") != -1) {
                console.log('Клиент оформил заявку на кредит!');
                msg = "Ваша заявка принята. После рассмотрения заявки с вами свяжется оператор.\nМожет быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!";

                // Добавляем все данные о заявке в БД
                // TODO: Реализовать структурку
                db.applications.add(
                    client.client_id,
                    client.messenger,
                    'Оформление кредита',
                    JSON.stringify(exports.generateData(session_id, 'object'))
                );
            } else {
                // Возвращаемся на предыдущий пункт
                positions[session_id] = 'Клиент вводит почту';
                return exports.process(client, data[session_id].email);
            }

            // Удаляем ненужные данные и сбрасываем позицию
            delete data[session_id];
            delete positions[session_id];
            dialog_processor.resetPosition(session_id);

            return msg;
    }
}

/**
 * Генерируем структуру с данными
 * @param {Object} session_id - идентификатор сессии клиента
 * @param {Bool}   type       - возвращать данные как объект, либо как строку
 */
exports.generateData = function(session_id, type) {
    const obj = {
        'Сумма кредита': data[session_id].sum,
        'Срок кредитования (мес.)': data[session_id].time,
        'ФИО': data[session_id].name,
        'Телефон': dialog_processor.clients[session_id].phone,
        'Почта': data[session_id].email
    }

    if (type == 'object') {
        return obj;
    }
    if (type == 'string') {
        // TODO: Убрать этот ужс
        return Object.keys(obj).reduce((acc, key) => `${acc}${key}: ${obj[key]}\n`, '');
    }
}