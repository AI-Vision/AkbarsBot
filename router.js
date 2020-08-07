const express = require('express')
const router  = express.Router()

const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')

/** Cookie and URL query parsers */
router.use(cookieParser());
router.use(bodyParser.json());       // To support JSON-encoded bodies
router.use(bodyParser.urlencoded({   // To support URL-encoded bodies
    extended: true
}));

router.use(function(req, res, next) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
})

/** HTTP request handlers */
router.use('/login',  require('./routes/login.js'));
router.use('/index',  require('./routes/index.js'));
router.use('/applications', require('./routes/applications.js'));

/** Web hooks */
router.use('/vk', require('./messengers/vk.js'));
router.use('/ok', require('./messengers/ok.js'));
router.use('/icq', require('./messengers/icq.js'));
router.use('/viber', require('./messengers/viber.js'));
router.use('/telegram', require('./messengers/telegram.js'));
router.use('/whatsapp', require('./messengers/whatsapp.js'));

/** Logout request */
router.get('/logout', function(req, res) {
    console.log(`Пользователь ${req.user.email} вышел`);

    req.logout();
    res.redirect('/login');
});

/** Request for an unknown page */
router.use(function(_, res) {
    res.render('error');
});

module.exports = router;
