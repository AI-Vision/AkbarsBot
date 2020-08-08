Pace.options.ajax.trackWebSockets = false;

function showApplication(id) {
    const application = applications.find(app => app.id == id);

    chat_session_id = application.session_id;

    // Устанавливаем данные окна
    $('#name').html(application.application);

    // Отчищаем таблицу со старыми параметрами и добавляем новые
    $("#params tr").remove();

    const params = JSON.parse(application.data);
    for (const key of Object.keys(params)) {
        $('#params > tbody:last-child').append(
            '<tr>'                                      +
            `    <td>${key}</td>`                       +
            `    <td class="text-right">${params[key]}` +
            '</td>'                                     +
            '</tr>');
    };

    $('#modal').modal('show');
}

/**
 * При переключении свитча, подключаемся к чату
 */
$('#switch').on("change" , function() {
    if (this.checked) {
        webSocket = new WebSocket('ws://akbars.gistrec.ru:9000');
        webSocket.onopen = function (event) {
            console.debug('Открыли вебсокет');

            webSocket.send(JSON.stringify({
                type: 'Open chat',
                session_id: chat_session_id
            }));
        };
        webSocket.onmessage = function(event) {
            addMessage(event.data, 'left');
        };

        addMessage('Специалист банка подключился к чату.', 'right');
        $('#chat').show();
    }else {
        webSocket.close();
        webSocket = null;

        sendMessage('Специалист банка отключился от чата.', 'right');
        $('#chat').hide();
    }
});