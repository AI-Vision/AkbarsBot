const uuid       = require('uuid-by-string');

const processors = {
    dialogflow:  require('./dialogflow'),

    credit_card: require('./credit_card'),
    debit_card:  require('./debit_card'),
    deposit: require('./deposit'),
    credit: require('./credit'),
    pif: require('./pif')
}

/**
 * DialogFlow возвращает какой-то текст, который может перевести на определенную позицию
 * Поэтому заводим перечисление, которое одновременно является текстом (который отправляет DF)
 * и позицией, согласно которой выбирается какой dialog_processor должен обраатывать сообщение
 */
const Positions = {
    DialogFlow: 'DialogFlow', // Общается с DialogFlow ботом

    DepositOpen: 'Переходим на составление заявки на открытие вклада',
    CreditCard: 'Переходим на составление заявки на кредитную карту',
    OpenCredir: 'Переходим на составление заявки на кредит',
    DebitCard: 'Переходим на составление заявки на дебетовую карту',
    OpenPIF: 'Переходим на составление заявки на открытие ПИФ',
}

/**
 * Список всех клиентов
 * Для каждого клиента хранятся данные
 *     @property {String} session_id - идентификатор сессии клиента
 *     @property {String} positioin  - позиция в диалоге, одно из Position
 *     @property {String} interest   - услуга, которую выбрал клиент, например название дебетовой карты
 */
let clients = [];

/**
 * Основная логика работы бота
 * Принимает на вход сообщение от клиента и информацию о нем
 *
 * Дальше определяем на какой позиции диалога находится клиент:
 *     1. Общается с ботом - Перенаправляем сообщение на DF и перенаправляем ответ от DF клиенту
 *                           Тут стоит заметить, что иногда от DF могут прийти ключевые фразы,
 *                           например "Клиент хочет оформить кредит", которые говорят о том, что
 *                           дальше диалог будет вестись с этим ботом (например, оформление заявки)
 *     2. Оформляет заявку - Оформляем заявку на какой-либо продукт.
 *                           У каждого продукта свои требования к данным, поэтому важно хранить тип продукта и сам продукт
 *                           Так же после оформлении заявки важно возвращать позицию диалога на 1
 *     3. Нету?
 *
 * Ключевые фразы, по которым диалог начинает вести этот бот (при котором начинаем собирать данные клиента):
 *     1. "Переходим на составление заявки на кредитную карту"  - заявка на кредитную карту
 *     2. "Переходим на составление заявки на дебетовую карту"  - заявка на дебетовую карту
 *     3. "Переходим на составление заявки на открытие вклада"  - заявка на открытие вклада
 *     4. "Переходим на составление заявки на открытие ПИФ"     - заявка на открытие ПИФ
 *     5. "Переходим на составление заявки на кредит"           - заявка на кредит
 *
 * @param {string} message    сообщение пользователя
 * @param {string} client_id  идентефикатор пользователя
 * @param {string} messenger  мессенджер
 */
exports.process = async function(message, client_id, messenger) {
    // Получаем uuid для сессии клиента
    const session_id = uuid(messenger + client_id.toString());

    // Если клиент еще не писал, то его нет в этом массиве
    if (clients[session_id] == undefined) {
        clients[session_id] = {position: Positions.DialogFlow, session_id, interest: null};
    }
    const client = clients[session_id];
    console.log(client);

    // Смотрим какая позиция у клиента
    switch (client.position) {
        // Общается с DialogFlow ботом
        case Positions.DialogFlow:
            const result = await processors.dialogflow.process(client, message);
            // Теперь нужно проверить сообщение - там может быть ключевая фраза
            // из-за которой нужно будет сменить позцию клиента и передать
            // управление чатом другому dialog_processor'у
            for (const position_name in Positions) {
                const position = Positions[position_name];
                if (result.indexOf( position ) != -1) {
                    clients[session_id].position = position;

                    console.debug(`Переводим пользователя ${client_id} из ${messenger}: ${position}`);

                    // При смене позиции нужно еще раз вызвать эту функцию
                    var message = await exports.process(message, client_id, messenger)
                    return message;
                }
            }
            return result;

        // TODO: Объединить код снизу

        // Оформляет депозит
        case Positions.DepositOpen: {
            const result = processors.deposit.process(client, message);
            return result;
        }

        // Оформляет кредит
        case Positions.OpenCredir: {
            const result = processors.credit.process(client, message);
            return result;
        }

        // Оформляет кредитную карту
        case Positions.CreditCard: {
            const result = processors.credit_card.process(client, message);
            return result;
        }

        // Оформляет дебетовую карту
        case Positions.DebitCard: {
            const result = processors.debit_card.process(client, message);
            return result;
        }

        // Открытие персонального инвестиционного счета
        case Positions.OpenPIF: {
            const result = processors.pif.process(client, message);
            return result;
        }
    }
}

exports.resetPosition = function(client) {
    clients[client.session_id].position = Positions.DialogFlow;
}