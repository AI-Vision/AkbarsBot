const db = require('../db');
const express = require('express');
const router = express.Router();

router.get('/', async function(req, res){
	if (!req.isAuthenticated()) return res.redirect('/login');

	res.render('applications', {
        user: req.user,
        applications: await db.applications.getAll()
    });
})

module.exports = router;
