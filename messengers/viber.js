const axios = require('axios');
const express = require('express');
const router = express.Router();
const TextMessage = require('viber-bot').Message.Text;
const dialog_processor = require('../dialog_processor');
const config = require('../config.js');
const ViberBot = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const UserProfile = require('viber-bot').UserProfile;

const bot = new ViberBot({
	authToken: config.viber.token,
	name: "АК Барсик",
	avatar: "http://viber.com/avatar.jpg"
});

router.use('/', async function(req, res){
    res.send('ok');

    if (req.body.event=='message') {
        const text = req.body.message.text;
        const id = req.body.sender.id;
        const name = req.body.sender.name;

        // Костыль
        // Так как у sendMessage два параметра, то нужно объединить client_id и name
        const client_id = `${id}|${name}`;

        const result = await dialog_processor.process(text, client_id, 'viber');
        if (result) {
            exports.sendMessage(result, client_id);
        }
    };
})

exports.sendMessage = function(message, client_id) {
    // Костыль, читай выше
    const [id, name] = client_id.split('|');

    bot.sendMessage(new UserProfile(id, name), new TextMessage(message));
}

exports.router = router;
