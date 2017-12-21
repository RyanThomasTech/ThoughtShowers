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

router.post('/', passport.authenticate('local', { failureRedirect: '/main', failureFlash:true }),
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
    res.redirect('/main');
});

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/');
  }
}

function getAuthorID(username) {
  var authorID = client.query('SELECT id FROM user_account WHERE username=$1',[username], function(err, result){
    if (err) {
      console.log("unable to query SELECT");
      next(err);
    }
    else{
      console.log("found user id " + id + " for user " + username);
      return id;
    }
  });
  return authorID;
}

router.get('/user',loggedIn,function(req, res, next){

  var authorID = getAuthorID(req.user.username);
  client.query('SELECT * FROM thread WHERE user_account_id=$1',[authorID], function(err,result){
    if (err) {
      console.log("main.js: sql error ");
      next(err); // throw error to error.hbs.
    }
    else {
      res.render('user', {rows: result.rows, user: req.user} );
    }
  });
});

router.get('/newThread',function(req, res, next) {
  res.render('newThread', {user: req.user , error: req.flash('error')});
});

router.post('/newThread',function(req, res, next) {
  var authorID = getAuthorID(req.user.username);
  client.query('INSERT INTO post(topic, user_account_id) VALUES($1,$2)', [req.body.topic, authorID], function(err, result) {
    if (err) {
      console.log("unable to query INSERT");
      next(err);
    }
    else{
      console.log("query successful, redirecting");
      res.redirect('/main/user');
    }
  });
});

function encryptPWD(password){
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

router.get('/signup',function(req, res) {
    res.render('signup', { user: req.user }); // signup.hbs
});

router.post('/signup', function(req, res, next) {
  client.query('SELECT * FROM user_account WHERE username = $1', [req.body.username], function(err, result) {
      if (err) {
        console.log("unable to query SELECT");
        next(err);
      }
      if (result.rows.length > 0) {
        res.render('signup',      {exist: true,
                                  success: false,
                                  emptyFields: false});
      }
      else{
          if(req.body.username && req.body.password){
              var hashedPWD = encryptPWD(req.body.password);
              //TODO: timestamp on account creation
              //TODO: email registration process
              client.query('INSERT INTO user_account (username, hashed_password, name, email) VALUES($1, $2, $3, $4)', [req.body.username, hashedPWD , req.body.name, req.body.email], function(err, result) {
                  if (err) {
                    console.log("unable to query INSERT");
                    next(err);
                  }
                  else{
                    //console.log("created user with un: " + req.body.username + " pw: " + req.body.password + " isAdmin: " + req.body.usertype);
                    res.render('signup',      {exist: false,
                                              success: true,
                                              emptyFields: false});
                  }
              });
          }
          else{
              res.render('signup',      {exist: false,
                                        success: false,
                                        emptyFields: true});
          }
      }
    });
});

module.exports = router;
