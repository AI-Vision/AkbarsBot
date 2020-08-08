const axios = require('axios');
const express = require('express');
const router = express.Router();

const dialog_processor = require('../dialog_processor');
const config = require('../config.js');

router.post('/', async function(req, res){
    res.send('OK');

    // Отслеживаем только эвент о новых сообщенияъ
    if (!Array.isArray(req.body.messages)) return;

    for (let message of req.body.messages){
        console.log(message)
        if (!message.fromMe) {
            const chat_id = message.chatId;
            const result = await dialog_processor.process(message.body, chat_id, 'whatsapp');
            if (result) {
                exports.sendMessage(result, chat_id);
            }
        }
    };
})

exports.sendMessage = async function(msg, chat_id) {
    try {
        const response = await axios.post(`${config.whatsapp.apiUrl}sendMessage?token=${config.whatsapp.token}`, {
            chatId: chat_id,
            body: msg
        }, {headers: {'Content-Type': 'application/json;charset=utf-8'}});

        console.log(response.data);
    } catch (error) {
        console.error('Whatsapp request error', error);
    }
}

// const hook_response = axios.post(`${config.whatsapp.apiUrl}webhook?token=${config.whatsapp.token}`, {"set":true, "webhookUrl":"https://akbars.gistrec.ru/whatsapp"} , {headers: {'Content-Type': 'application/json;charset=utf-8'}})
// console.log(`${config.whatsapp.apiUrl}webhook?token=${config.whatsapp.token}`)
// console.log(hook_response);
// TODO: Регистрация веб-хука
// requests.post('https://api.telegram.org/bot{token}/setWebhook'.format(token=config.TOKEN), data=json.dumps({'url': 'https://akbars.gistrec.ru/telegram'}), headers= {'Content-Type':

exports.router = router;
