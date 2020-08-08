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
    let session_id;

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);

        // Специалист банка подключается в чат
        if (data.type == 'Open chat') {
            session_id = data.session_id;

            dialog_processor.sendToClient(session_id, 'Специалист поддержки зашел в чат');
            dialog_processor.startChatToBankSpecialist(session_id, ws);

            console.debug(`Специалист банка открывает чат с ${session_id}`);
        }
        if (data.type == 'Close chat') {
            dialog_processor.sendToClient(session_id, 'Специалист поддержки вышел из чата');
            dialog_processor.stopChatToBankSpecialist(session_id);

            console.debug(`Специалист банка закрывает чат с ${session_id}`);
        }
        if (data.type == 'New message') {
            dialog_processor.sendToClient(session_id, data.message);
        }
        console.debug(`Кто-то прислал сообщение: ${message}`)
    });
    ws.on('close', function close() {
        if (session_id) {
            dialog_processor.sendToClient(session_id, 'Специалист поддержки вышел из чата');
            dialog_processor.stopChatToBankSpecialist(session_id);

            console.debug(`Специалист банка закрывает чат с ${session_id}`);
        }
    });

    console.debug('Кто-то подключился к WebSocketServer');
});
;;
module.exports = router;
