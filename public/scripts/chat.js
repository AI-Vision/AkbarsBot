addMessage = function(text, side) {
    let $message = $($('.message_template').clone().html());
    $message.addClass(side).find('.text').html(text);

    $('.messages').append($message);

    $message.addClass('appeared');

    $('.messages').animate({ scrollTop: $('.messages').prop('scrollHeight') }, 300);
}

/**
 * Функция вызывается при нажатии на кнопку "Отправить" или на Энтер
 * Действие:
 *   1. Отчищает поле инпута
 *   2. Добавляет сообщение в чат
 *   3. Отправляет сообщение на сервер
 */
sendMessage = function(message) {
    addMessage(message, 'right');

    if (webSocket) {
        webSocket.send(JSON.stringify({
            type: 'New message',
            message: message
        }));
        console.debug('Сообщение отправлено на сервер');
    };
}

$('.send_message').click(function(e) {
    const message = $('.message_input').val();
    $('.message_input').val('');

    return sendMessage(message);
});
$('.message_input').keyup(function(e) {
    if (e.which === 13) {
        const message = $('.message_input').val();
        $('.message_input').val('');

        return sendMessage(message);
    }
});