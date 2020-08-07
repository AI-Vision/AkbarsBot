const express = require('express');
const app     = express();

const md5 = require("md5");

const session  = require('express-session')
const passport = require('passport')
const Strategy = require('passport-local').Strategy;

/** Own modules */
const db = require('../db');


passport.use("local", new Strategy({
        usernameField: 'login',
        passwordField: 'passwd'
    },
    async function(login, password, done) {
        const user = await db.users.getByLogin(login);

        if (!user) {
            console.debug(`Пользователь ${login} не найден`);
            return done(null, false);
        }

        if (user.password != md5(password)) {
            console.debug(`Пароль для пользователя ${login} неверный`);
            return done(null, false);
        }

        console.debug(`Пользователь ${login} успешно авторизован`);
        return done(null, user);
    }
));

passport.serializeUser(function(user, cb) {
    console.debug(`Сериализация данных для пользователя ${user.login}`);
    cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
    const user = await db.users.getById(id);

    console.debug(`Десериализация данных для пользователя ${user.login}`);

    cb(null, user);
});

app.use(session({
    secret: 'KJjsdz',
    store: db.sessions,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 5 } // 5 дней
}))

app.use(passport.initialize());
app.use(passport.session());

module.exports = app