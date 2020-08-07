const express = require('express')
const app     = express()

/** Own modules */
const config = require('./config.js');

app.use('/vendor', express.static('public/vendor'))
app.use('/styles', express.static('public/styles'))
app.use('/images', express.static('public/images'))
app.use('/scripts', express.static('public/scripts'))

/** Enabling EJS */
app.set('view engine', 'ejs');
app.set('views', require('path').join(__dirname, '/public'));

/** Authorization */
app.use(require('./utils/authorization'));

/** Handler for HTTP requests */
app.use(require('./router'));

/** Listen for connections */
app.listen(config.app.port, async () => {
    console.log(`HTTP Web Server running on port ${config.app.port}`);
});
