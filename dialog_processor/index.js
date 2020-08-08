const uuid = require('uuid-by-string');

const processors = {
    phone_confirmation: require('./phone_confirmation'),

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

    BankSpecialist: 'BankSpecialist', // Общается со специалистом банка

    DepositOpen: 'Переходим на составление заявки на открытие вклада',
    CreditCard: 'Переходим на составление заявки на кредитную карту',
    OpenCredir: 'Переходим на составление заявки на кредит',
    DebitCard: 'Переходим на составление заявки на дебетовую карту',
    OpenPIF: 'Переходим на составление заявки на открытие ПИФ',
}

/**
 * Список всех клиентов
 * Для каждого клиента хранятся данные
 *     @property {String} messenger  - мессенджер или соц. сеть клиента
 *     @property {String} client_id  - идентификатор клиента
 *     @property {String} session_id - идентификатор сессии клиента
 *     @property {String} positioin  - позиция в диалоге, одно из Position
 *     @property {String} interest   - услуга, которую выбрал клиент, например название дебетовой карты
 *     @property {String} phone      - телефон клиента, подтвержденный по СМС
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
        clients[session_id] = {position: Positions.DialogFlow, session_id, messenger, client_id, interest: null, phone: null};
    }

    // Если клиент общается не с DialogFlow, т.е. составляет заявку, то у него должен быть подтвержден номер телефона
    if (clients[session_id].position != Positions.DialogFlow &&
        clients[session_id].position != Positions.BankSpecialist &&
        clients[session_id].phone == null)
    {
        const res = await processors.phone_confirmation.process(clients[session_id], message);
        if (res != 'Телефон подтвержден') return res;
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

        // Общается со специалистом из банка
        case Positions.BankSpecialist:
            exports.sendToBankSpecialist(session_id, message);
            return null;


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

const messengers = {
    ok: require('../messengers/ok'),
    vk: require('../messengers/vk'),
    icq: require('../messengers/icq'),
    viber: require('../messengers/viber'),
    telegram: require('../messengers/telegram'),
    whatsapp: require('../messengers/whatsapp'),
}

exports.resetPosition = function(session_id) {
    clients[session_id].position = Positions.DialogFlow;
}


/////////////////////////////////////////////////
//      Работа с BankSpecialis <-> client      //
/////////////////////////////////////////////////
/**
 * Ассоциативный список session_id => BankSpecialis
 */
let links = {};

/**
 * Функция, вызываемая 'извне' - когда специалист банка открывает чат
 * Устаналивает позицию на BankSpecialist
 *
 * @param {String} session_id      - идентфиикатор клиента
 * @param {Object} bank_specialist - WebSocker объект банковского специалиста
 */
exports.startChatToBankSpecialist = function(session_id, bank_specialist) {
    clients[session_id].position = Positions.BankSpecialist;

    links[session_id] = bank_specialist;
}

/**
 * Функция, вызываемая 'извне' - когда специалист банка закрыл чат
 * @param {String} session_id - идентфиикатор клиента
 */
exports.stopChatToBankSpecialist = function(session_id) {
    clients[session_id].position = Positions.DialogFlow;

    delete links[session_id];
}

/**
 * Отправляем сообщение клиенту
 */
exports.sendToClient = function(session_id, message) {
    const client_id = clients[session_id].client_id;
    const messenger = clients[session_id].messenger;

    messengers[messenger].sendMessage(message, client_id);
}

/**
 * Отправляем сообщение банковскому специалисту
 */
exports.sendToBankSpecialist = function(session_id, message) {
    const bank_specialist = links[session_id];
    bank_specialist.send(message);
}

exports.clients = clients;
