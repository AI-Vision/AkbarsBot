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
 * Получаем данные, необходимые для заявки на кредитную карту
 * @param {Object} client  данные о клиенте
 * @param {String} message сообщение
 *
 * Диалог:
 *     Бот: Напишите желаемый кредитный лемит
 *     Клиент: <Кредитный лимит>
 *     Бот: Напишите город проживания
 *     Клиент: <Город>
 *     Бот: Напишите своё ФИО
 *     Клиент <ФИО>
 *     Бот: Напишите дату рождения (дд.мм.гггг)
 *     Клиент: <Дата рождения>
 *     Бот: Напишите место рождения
 *     Клиент: <Место рождения>
 *     Бот: Напишите серию и номер паспорта
 *     Клиент: <Серия и номер паспорта>
 *     Бот: Напишите код подразделения, в котором выдан паспорт
 *     Клиент: <Код подразделения>
 *     Бот: Напишите дату выдачи паспорта (дд.мм.гггг)
 *     Клиент: <Дата выдачи>
 *     Бот: Напишите кем выдан паспорт
 *     Клиент: <Кем выдан>
 *     Бот: Напишите ваш телефон
 *     Клиент: <Телефон>
 *     Бот: Напишите вашу почту
 *     Клиент: <Почта>
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

            positions[session_id] = 'Клиент вводит кредитный лимит';
            return 'Напишите желаемый кредитный лимит в рублях';

        case 'Клиент вводит кредитный лимит':
            data[session_id].limit = message;

            positions[session_id] = 'Клиент вводит город проживания';
            return 'Напишите город проживания';

        case 'Клиент вводит город проживания':
            data[session_id].city = message;

            positions[session_id] = 'Клиент вводит ФИО';
            return 'Напишите своё ФИО';

        case 'Клиент вводит ФИО':
            data[session_id].name = message;

            positions[session_id] = 'Клиент вводит дату рождения';
            return 'Напишите дату рождения (дд.мм.гггг)';

        case 'Клиент вводит дату рождения':
            data[session_id].birthday = message;

            positions[session_id] = 'Клиент вводит место рождения';
            return 'Напишите место рождения';

        case 'Клиент вводит место рождения':
            data[session_id].birth_city = message;

            positions[session_id] = 'Клиент вводит серию и номер паспорта';
            return 'Напишите серию и номер паспорта';

        case 'Клиент вводит серию и номер паспорта':
            data[session_id].passport_number = message;

            positions[session_id] = 'Клиент вводит подразделение, в котором выдан паспорт';
            return 'Напишите код подразделения, в котором выдан паспорт';

        case 'Клиент вводит подразделение, в котором выдан паспорт':
            data[session_id].passport_subdivision = message;

            positions[session_id] = 'Клиент вводит дату выдачи паспорта';
            return 'Напишите дату выдачи паспорта (дд.мм.гггг)';

        case 'Клиент вводит дату выдачи паспорта':
            data[session_id].passport_take = message;

            positions[session_id] = 'Клиент вводит кем выдан паспорт';
            return 'Напишите кем выдан паспорт';

        case 'Клиент вводит кем выдан паспорт':
            data[session_id].passport_who = message;

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
                    'Оформление кредитной карты',
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
        'Кредитный лимит в рублях': data[session_id].limit,
        'ФИО': data[session_id].name,
        'Дата рождения': data[session_id].birthday,
        'Место рождения': data[session_id].birth_city,
        'Серия и номер паспорта': data[session_id].passport_number,
        'Подразделение, в котором выдан паспорт': data[session_id].passport_subdivision,
        'Дата выдачи паспорта': data[session_id].passport_take,
        'Паспорт выдан': data[session_id].passport_who,
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