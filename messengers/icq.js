const axios = require('axios');
const express = require('express');
const router = express.Router();

const dialog_processor = require('../dialog_processor');
const config    = require('../config.js');

get_events = async function() {
    let idd = '0';
    while(1) {
        response = await axios.get(`https://api.icq.net/bot/v1/events/get?token=${config.icq.token}&lastEventId=${idd}&pollTime=300`, timeout=1000);
        if(response.data.ok) {
            for(let event of response.data.events) {
                idd = event.eventId;
                if(event.type == 'newMessage') {
                    console.log(event.payload.from.userId);
                    const result = await dialog_processor.process(event.payload.text, event.payload.from.userId, 'icq');

                    if (result) {
                        await exports.sendMessage(message, event.payload.chat.chatId);
                    }
                };
            };
        };
    };
}

exports.sendMessage = async function(msg, chat_id) {
    const message = encodeURI(msg)

    try {
        const response = await axios.get(`https://api.icq.net/bot/v1/messages/sendText?token=${config.icq.token}&text=${message}&chatId=${chat_id}`);
        console.log(response.data);
    } catch (error) {
        console.error('ICQ request error', error)
    }
}

// TODO: Регистрация веб-хука
// requests.post('https://api.telegram.org/bot{token}/setWebhook'.format(token=config.TOKEN), data=json.dumps({'url': 'https://akbars.gistrec.ru/telegram'}), headers= {'Content-Type':
get_events();

exports.router = router;
