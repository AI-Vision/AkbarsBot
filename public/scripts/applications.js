Pace.options.ajax.trackWebSockets = false;

function showApplication(id) {
    const application = applications.find(app => app.id == id);

    active_application_id = application.id;
    active_chat.client_id = application.client_id;
    active_chat.messenger = application.messenger;

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
 * При обновлении статуса
 */
$("#update_status").click(function() {
    const status = 	$("#new_status").val();
    const id = active_application_id;

    $.ajax({
        type: 'POST',
        url: '/applications/update_status',
        data: { id, status },
        success: function(res) {
            alert('Статус обновлен!');
        }
    });
});

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
                client_id: active_chat.client_id,
                messenger: active_chat.messenger
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

        active_chat.client_id = null;
        active_chat.messenger = null;

        sendMessage('Специалист банка отключился от чата.', 'right');
        $('#chat').hide();
    }
});