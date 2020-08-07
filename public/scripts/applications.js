function showApplication(id) {
    const application = applications.find(app => app.id == id);

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