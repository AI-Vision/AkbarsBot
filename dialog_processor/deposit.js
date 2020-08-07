const db = require('../db');
const dialog_processor = require('./index');

/**
 * Позиция каждого клиента
 * @key   {String} идентификатор сессии клиента
 * @value {String} позиция клиента
 */
let positions = [];

let data = [];

/**
 * Получаем данные, необходимые для заявки на депозит
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
            data[session_id] = {
                application: "Открытие вклада"
            };

            positions[session_id] = 'Клиент вводин название вклада';
            return 'Введите название вклада';

        case 'Клиент вводин название вклада':
            data[session_id].deposit = message;

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

            positions[session_id] = 'Клиент вводит почту';
            return 'Напишите вашу почту';

        case 'Клиент вводит почту':
            data[session_id].email = message;

            positions[session_id] = 'Клиент подтверждает корректность данных';
            return `Ваши данные\n`                            +
                   exports.generateData(session_id, 'string') +
                   `\n`                                       +
                   `Если данные верны, напишите "Верно"\n`    +
                   `Для отмены завяки напишите "Отмена"`;

        case 'Клиент подтверждает корректность данных':
            let msg;

            if (message.toLowerCase().indexOf("отмена") != -1) {
                console.log('Клиент отменил оформление заявки на вклад')
                msg = "Ваша заявка отменена.\nМожет быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!";
            } else if (message.toLowerCase().indexOf("верно") != -1) {
                console.log('Клиент оформил заявку на кредит!');
                msg = "Ваша заявка принята. После рассмотрения заявки с вами свяжется оператор.\nМожет быть вас интересуют другие продукты?\nВы можете обратится ко мне в любой момент и я помогу!";

                db.applications.add(session_id, 'Оформление депозита', JSON.stringify(exports.generateData(session_id, 'object')));
            } else {
                // Возвращаемся на предыдущий пункт
                positions[session_id] = 'Клиент вводит почту';
                return exports.process(client, data[session_id].email);
            }

            // Удаляем ненужные данные и сбрасываем позицию
            delete data[session_id];
            delete positions[session_id];
            dialog_processor.resetPosition(client);

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
        'Название вклада': data[session_id].deposit,
        'Сумма вклада': data[session_id].sum,
        'Срок вклада': data[session_id].time,
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