const axios = require('axios');
const express = require('express');
const router = express.Router();

const dialog_processor = require('../dialog_processor');
const config = require('../config.js');

/**
 * При уведомлении о новом сообщении в req.body лежит структура:
 * В req.body лежит структура
 *  {
 *      type: 'message_new',
 *      object: {
 *          id: 65,
 *          date: 1596659285,
 *          out: 0,
 *          user_id: 548717558,
 *          read_state: 0,
 *          title: '',
 *          body: 'еуые',
 *          owner_ids: []
 *      },
 *      group_id: 197683253,
 *      event_id: '270ec8a2ff347bc9fea692d65d7f0258458b31d1',
 *      secret: 'barsiktop'
 *  }
 */
router.post('/', async function(req, res){
    res.send('ok');

    const message = req.body.object.body;
    const user_id = req.body.object.user_id;

    const result = await dialog_processor.process(message, user_id, 'vk');
    if (result) {
        exports.sendMessage(result, user_id);
    }
})

exports.sendMessage = async function(message, user_id) {
    const params = {
        access_token: config.vk.token,
        peer_id: user_id,
        random_id: Math.floor(Math.random() * Math.floor(999999)),
        message,
        v: 5.92
    }

    try {
        const response = await axios.get('https://api.vk.com/method/messages.send', { params });
        console.log(response.data)
    }catch (error) {
        console.error(`VK request error`, error.data);
    }
}

exports.router = router;
