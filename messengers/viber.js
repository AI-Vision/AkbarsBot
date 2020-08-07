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
    if(req.body.event=='message') {
        let text = req.body.message.text;
        let id = req.body.sender.id;
        bot.sendMessage(new UserProfile(id=id, name=req.body.sender.name), new TextMessage(text= await dialog_processor.process(text, id, 'viber')));
    };
})

module.exports = router;
