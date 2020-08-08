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
    const chat_id = req.body.message.chat.id;
    const message = req.body.message.text;

    const result = await dialog_processor.process(message, chat_id, 'telegram');
    if (result) {
        exports.sendMessage(result, chat_id);
    }
})

exports.sendMessage = async function(message, chat_id) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${config.telegram.token}/sendMessage`, {
            chat_id,
            text: message
        });

        console.log('Telegram response data', response.data)
    }catch (error) {
        console.error('Telegram request error', error);
    }
};

(async () => {
    // TODO: Регистрация веб-хука
    try {
        axios.post(`https://api.telegram.org/bot${config.telegram.token}/setWebhook`, {'url': 'https://akbars.gistrec.ru/telegram'});
        console.log('Регистрация вебхука для Telegram завершена!')
    }catch (error) {
        console.log(`При регистрации вебхука для Telegram произошла ошибка`, error.data);
    }
})();


exports.router = router;
