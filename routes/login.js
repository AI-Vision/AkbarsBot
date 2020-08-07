const passport = require("passport");

const express = require("express");
const router  = express.Router();


router.get("/", function(req, res) {
    // Если юзер авторизован - перенаправляем его в чат
    if (req.isAuthenticated()) return res.redirect("/index");

    res.render('login')
});

router.post("/", async function(req, res) {
    const login  = req.body.login;
    const passwd = req.body.passwd;

    const loginFormat = /^[a-zA-Z0-9_\-\.]{3,20}$/
console.log(login, passwd);
    /** Такие данные не должны приходить с фронтэнда, ибо там уже есть эта проверка */
    if (!loginFormat.test(login) || passwd.length < 6 || passwd.length > 30) {
        console.warn(`Попытка авторизации с некорректными данными`, login, passwd);
        return res.send('{"Status": "Error", "Description": "Неверный логин или пароль"}');
    }

    passport.authenticate("local", function(err, user) {
        if (err) {
            console.error("Внутренняя ошибка при авторизации пользователя [1]", {json: err});
            return res.send('{"Status": "Error", "Description": "Внутренняя ошибка сервера"}');
        }

        // Если не найден пользователь
        if (!user) return res.send('{"Status": "Error", "Description": "Неверный логин или пароль"}');

        // Пытаемся авторизовать
        req.logIn(user, function(err) {
            if (err) {
                console.error("Внутренняя ошибка при авторизации пользователя [2]", {json: err});
                return res.send('{"Status": "Error", "Description": "Внутренняя ошибка сервера"}');
            }

            return res.send('{"Status": "Success"}');
        });
    })(req, res);
});

module.exports = router;
