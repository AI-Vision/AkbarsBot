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

    const result = await dialog_processor.process(message, user_id, 'ok');

    exports.sendMessage(result, chat_id, user_id);
})

exports.sendMessage = async function(msg, chat_id, user_id) {
    try {
        const response = await axios.post(`https://api.ok.ru/graph/me/messages/${chat_id}?access_token=${config.ok.token}`, {
            recipient: {user_id:user_id},
            message: {text: msg}
        }, {headers: {'Content-Type': 'application/json;charset=utf-8'}});

        console.log(response.data);
    } catch (error) {
        console.error('OK request error', error);
    }
};

(async () => {
    const hook_response = await axios.post(`https://api.ok.ru/graph/me/subscribe?access_token=${config.ok.token}`, {url : 'https://akbars.gistrec.ru/ok'}, {headers: {'Content-Type': 'application/json;charset=utf-8'}})
    // console.log(hook_response.data);
    console.log('Регистрация вебхука для ОК завершена!')
})();

module.exports = router;
