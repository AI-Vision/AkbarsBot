toastr.options = {
    "debug": false,
    "newestOnTop": false,
    "positionClass": "toast-bottom-right",
    "closeButton": true,
    "progressBar": true
};

$("#loginForm").submit(function(e) {
    e.preventDefault(); // Отменяем отправку формы

    const login    = $("#login").val();    // Почта
    const passwd   = $("#passwd").val();   // Пароль

    if (passwd.length < 6 || passwd.length > 30) {
        toastr.error("Неверный пароль", "Пароль может содержать от 6 до 30 символов");
        return;
    }

    if (login.length < 3 || login.length > 20) {
        toastr.error("Неверный логин", "Логин может содержать от 3 до 20 символов");
        return;
    }

    $("button").prop("disabled", true);

    $.ajax({
        type: "POST",
        url: "/login",
        data: {
            login,
            passwd
        },
        success: function(response) {
            const result = JSON.parse(response);

            if (result.Status == "Success") {
                toastr.success("Авторизация прошла успешно");
                setTimeout(function() {
                    window.location.href = "/index";
                }, 500);
            }else {
                toastr.error(result.Description);

                $("button").prop("disabled", false);
            }
        }
    });
});