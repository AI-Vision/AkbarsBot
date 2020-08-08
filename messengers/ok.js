const axios = require('axios');
const express = require('express');
const router = express.Router();

const dialog_processor = require('../dialog_processor');
const config = require('../config.js');

/**
 * При уведомлении о новом сообщении в req.body лежит структура:
 *  {
 *      update_id: 565003495,
 *      message: {
 *          message_id: 815,
 *          from: {
 *              id: 394190148,
 *              is_bot: false,
 *              first_name: 'Alex',
 *              username: 'gistrec'
 *          },
 *          chat: { id: -1001357321393, title: 'тест барсика', type: 'supergroup' },
 *          date: 1596660922,
 *          text: 'Тест'
 *      }
 *  }
 */
router.post('/', async function(req, res){
    res.send('OK');

    // Не важно кто отправил сообщение, важно в каком чате
    const user_id = req.body.sender.user_id;
    const chat_id = req.body.recipient.chat_id;
    const message = req.body.message.text;

    // Костыль
    // Так как у sendMessage два параметра, то нужно объединить user_id и chat_id
    const client_id = `${user_id}|${chat_id}`;

    const result = await dialog_processor.process(message, client_id, 'ok');
    if (result) {
        exports.sendMessage(result, client_id);
    }
})

exports.sendMessage = async function(msg, client_id) {
    try {
        // Костыль, читай выше
        const [user_id, chat_id] = client_id.split('|');

        const response = await axios.post(`https://api.ok.ru/graph/me/messages/${chat_id}?access_token=${config.ok.token}`, {
            recipient: {user_id},
            message: {text: msg}
        }, {headers: {'Content-Type': 'application/json;charset=utf-8'}});

        console.log(response.data);
    } catch (error) {
        console.error('OK request error', error);
    }
};

(async () => {
    try {
        const hook_response = await axios.post(`https://api.ok.ru/graph/me/subscribe?access_token=${config.ok.token}`, {url : 'https://akbars.gistrec.ru/ok'}, {headers: {'Content-Type': 'application/json;charset=utf-8'}})
        console.log('Регистрация вебхука для ОК завершена!')
    }catch (error) {
        console.log('При регистрации вебхука для Ok произошла ошибка', error.data);
    }
})();

exports.router = router;
