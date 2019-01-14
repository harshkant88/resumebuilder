var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
//Get homepage
router.get('/register', function(req, res){
	res.render('register');
});

router.get('/login', function(req, res){
	res.render('login');
});
router.get('/careers', function(req, res){
	res.render('careers');
});
router.get('/about', function(req, res){
	res.render('about');
});
router.get('/account', function(req, res){
	res.render('account');
});
router.get('/contactus', function(req, res){
	res.render('contactus');
});
router.get('/resume', function(req, res){
	res.render('resume');
});

router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	//validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'E-mail is required').notEmpty();
	req.checkBody('email', 'E-mail must be valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords are not matching, Check Again').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		res.render('register', {
			errors:errors
		})
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login and Create Resume.');

		res.redirect('/users/login');
	}
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
    	if(err) throw err;
    	if(!user){
    		return done(null, false, {message: 'Unknown user, Register now to get started'});
    	}

    	User.comparePassword(password, user.password, function(err, isMatch){
    		if(err) throw err;
    		if(isMatch){
    			return done(null, user);
    		} else {
    			return done(null, false, {message: 'Invalid Password, Re-enter it'});
    		}
    	});
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect: '/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are now Logged out, Login to Start creating your resume.');

	res.redirect('/users/login');
});

router.post('/contactus', function(req, res){
	var subject = req.body.subject;
	var name = req.body.name;
	var email = req.body.email;
	var careermessage = req.body.careermessage;

	var newUser = new User({
			name: name,
			email: email,
			subject: subject,
			careermessage: careermessage
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

	req.flash('success_msg', 'Thanks for informing us with your concern. We will get back to you shortly on the provided e-mail address with your issue. Feel free to also e-mail us at eazyresume.contact@gmail.com !');

	res.redirect('/users/contactus');

});

module.exports = router;