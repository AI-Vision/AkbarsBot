const dialog_processor = require('../dialog_processor');
const WebSocket = require('ws');
const express = require('express');
const router = express.Router();

const db = require('../db');


router.get('/', async function(req, res){
	if (!req.isAuthenticated()) return res.redirect('/login');

	res.render('applications', {
        user: req.user,
        applications: await db.applications.getAll()
    });
})

const wss = new WebSocket.Server({ port: 9000 });
wss.on('connection', function connection(ws) {
    // Клиент, с котором общается клиент банка
    let client_id = null;
    let messenger = null;

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        // Специалист банка подключается в чат
        if (data.type == 'Open chat') {
            client_id = data.client_id;
            messenger = data.messenger;

            dialog_processor.sendToClient(client_id, messenger, 'Специалист поддержки зашел в чат');
            dialog_processor.startChatToBankSpecialist(client_id, messenger, ws);

            console.debug(`Специалист банка открывает чат с ${client_id} из ${messenger}`);
        }
        if (data.type == 'Close chat') {
            dialog_processor.sendToClient(client_id, messenger, 'Специалист поддержки вышел из чата');
            dialog_processor.stopChatToBankSpecialist(client_id, messenger);

            console.debug(`Специалист банка закрывает чат с ${client_id} из ${messenger}`);

            client_id = null;
            messenger = null;
        }
        if (data.type == 'New message') {
            dialog_processor.sendToClient(client_id, messenger, data.message);

            console.debug(`Специалист банка прислал сообщение: ${data.message}`)
        }
    });
    ws.on('close', function close() {
        if (client_id && messenger) {
            dialog_processor.sendToClient(client_id, messenger, 'Специалист поддержки вышел из чата');
            dialog_processor.stopChatToBankSpecialist(client_id, messenger);

            console.debug(`Специалист банка закрывает чат с ${client_id} из ${messenger}`);
        }
    });

    console.debug('Кто-то подключился к WebSocketServer');
});
;;
module.exports = router;
