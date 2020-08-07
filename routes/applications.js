const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
	if (!req.isAuthenticated()) return res.redirect('/login');

	res.render('applications', {
        user: req.user
    });
})

module.exports = router;
