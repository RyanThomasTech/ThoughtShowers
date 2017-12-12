var express = require('express');
var router = express.Router();

var env = require('dotenv').config();
const Client = require('pg').Client;
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect(); //connect to database

var passport = require('passport');
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('login', {error: req.flash('error')});

});

router.post('/',
  // depends on the fiels "isAdmin", redirect to the different path: admin or notAdmin
  passport.authenticate('local', { failureRedirect: '/main', failureFlash:true }),
  function(req, res,next) {

    /*if (req.user.usertype == 'admin'){
      res.redirect('/exam/admin');
    }
    else {
      res.redirect('/exam/notAdmin');
    }*/
    res.redirect('/main/user');
});

router.get('/logout', function(req, res){
    req.logout(); //passport provide it
    res.redirect('/main'); // Successful. redirect to localhost:3000/exam
});

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

router.get('/user',loggedIn,function(req, res, next){

  client.query('SELECT * FROM posts WHERE author=$1',[req.user.username], function(err,result){
    if (err) {
      console.log("main.js: sql error ");
      next(err); // throw error to error.hbs.
    }
    else {
      res.render('user', {rows: result.rows, user: req.user} );
    }
  });
});

module.exports = router;
