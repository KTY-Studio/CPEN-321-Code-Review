// var mysql = require('mysql');

// var con_userDB = mysql.createConnection({
//   host: "localhost",
//   user: "yourusername",
//   password: "yourpassword",
//   database: "UserDB"
// });

// the req is the idToken of user
var express = require('express');
var auth = express();
var User = require('../models/user.js');
// var url = require('url');
const {OAuth2Client} = require('google-auth-library');
var CLIENT_ID = "948599028756-qju3o61c2ob60um012tvol60u6p7q6gf.apps.googleusercontent.com";
// var is_varified = 0;

/**
 * CODE_REVIEW: it's totally fine to use async functions, but i would suggest keeping the prototcol of chaining async consistent.
 * Mixing async functions, promise chains and callbacks can make the code really difficult to read and debug
 */
 async function verify(_idToken) {
  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: _idToken,
    audience: CLIENT_ID,
  });

  //const payload = ticket.getPayload();
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}

exports.auth_google = (req, res) => {

  let id_token = req.param('id_token');
  let email = req.param('user_email');
  let user_name = req.param('user_name');

  if(id_token === 'undefined' || email === 'undefined'  || user_name === 'undefined' ){
    res.status(400).send('Can\'t find your google id token');
    return console.log('Err: empty id_token');
  }

  verify(id_token)
  .catch((error) => {
    // is_varified = 0;
    res.status(400).send('Can\'t verify your google id token');
    return console.log(error);
  });
  console.log('Successful Verification...');
  // auth_res.send('post test');

  // const endpoint_url = new URL('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + auth_req.id_token);

  // var endpoint_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + id_token;
  // //console.log(endpoint_url);

  // auth.get(endpoint_url, function(google_req, google_res){
  //   if(google_res === null){
  //     return res.status(400).send('Can\'t connect to Google auth center.\n');
  //   }
  //   email = google_res.email;
  // });

  /**
   * CODE_REVIEW: verify and get_info are async functions, you should chain them together with callbacks
   * or else you will get unpredictable side behaviours where one runs successfully and one fails.
   * For example get_info_byId should run after update_user completes running successfully
   */
  User.get_info(email, function(get_err, user_res){
    if(get_err)
      throw get_err;
    console.log('Finding your google email from our Database...');
    //   auth_res.status(400).send('Server fails to deal with your Google account.');
    var user_id;
    if(user_res === null){
      User.create_user(email, function(create_err, db_res){
        if(create_err)
          throw create_err;
        console.log('Welcome new user');
        //   auth_res.status(400).send('Server fails to create a new account.');
        user_id = db_res.user_id;
      });

      /**
       * CODE_REVIEW: this is a totally ok way to concat strings, but i would suggest doing using Template literals
       * it is a lot easier to read
       * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
       */
      var suggestion = `user_name='${user_name}'`;
      var setcmd = "user_name='" + user_name + "'";
      User.update_user(setcmd, user_res.user_id, function(update_err, db_res){
        if(update_err)
          throw update_err;
      });

      /**
       * CODE_REVIEW: update_user and get_info_byId are async functions, you should chain them together with callbacks
       * or else you will get unpredictable side dehaviours where one runs successfully and one fails
       * for example get_info_byId should run after update_user completes running successfully
x       */
      User.get_info_byId(user_id, function(get_new_err, db_res){
        if(get_new_err)
          throw get_new_err;
        console.log('New account has been setup');
        //   auth_res.status(400).send('Server fails to find the new user.');
        // successfully create a new user and return the user info
        res.status(200).json(db_res);
      });
    } else {
      // found the exisiting record
      console.log('Welcome Back');
      var setcmd = "user_name='" + user_name + "'";

      /**
       * CODE_REVIEW: update_user is an async function, you should include res.status().json within the callback
       * or else res.status().json() might be called before update_user finishes, and you get unpredictable behavior
x       */
      User.update_user(setcmd, user_res.user_id, function(update_err, db_res){
        if(update_err)
          throw update_err;
      });
      console.log(user_name);

      res.status(200).json(user_res);

    }

  });

}
  	// con_userDB.query("SELECT * FROM Users WHERE user_email = google_res.email",
  	// 	function(user_err, user_result){
  	// 	// if user could not be found in the DB, we should create a new account for the user
  	// 	if(user_err){
  	// 		con_userDB.query("INSERT INTO Users (user_email) VALUES (google_res.email)",
  	// 			function(user_err2, user_new){
  	// 				if(user_err2) throw user_err2;
  	// 			// user_new contains the user_id and we need to give new user a calendar id
  	// 			con_calenDB.query("INSERT INTO Calendars (user_id) VALUES (user_new.user_id)",
  	// 				function(calen_err, calen_result){
  	// 					if(calen_err) throw calen_err;
  	// 				});
  	// 			// set user id in new calendar entry
  	// 			con_calenDB.query("SELECT calendar_id From Calendars WHERE user_id = user_new.user_id",
  	// 				function(calen_err, calen_id){
  	// 					if(calen_err) throw calen_err;
  	// 					// set calendar id in new user entry
  	// 					con_userDB.query("UPDATE Users SET calendar_id = calen_id WHERE user_id = user_new.user_id",
  	// 						function(user_err3, user_result3){
  	// 							if(user_err3) throw user_err3;
  	// 						});
  	// 				});
  	// 		});
  	// 		// new user entry should be here
  	// 		con_userDB.query("SELECT * FROM Users WHERE user_email = google_req.email",
  	// 			function(user_err4, user_result4){
  	// 				if(user_err4) {
  	// 					res.status(404);
  	// 					res.json(null);
  	// 					throw user_err4;
  	// 				}

  	// 				res.json(user_result4);
  	// 			});

  	// 	} else {
  	// 		// the user has an account before
  	// 		res.json(user_result);
  	// 	}
