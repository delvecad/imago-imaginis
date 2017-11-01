const db = require('../db');
const multer = require('multer'); 
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = function(app) {
  /**
   * Test route
   */
  app.post('/test', (req, res) => {
    console.log(req.query);
    res.send('Hello');
  });

  /**
   * Inserts an entry into the asp_users' table
   * Takes in the request body's parameters
   */
  app.post('/user/create', (req, getres) => {
    console.log("POST - create account");
    var firstName = req.body.first_name;
    var lastName = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password; // Hash password
    const hash = crypto.createHash('sha256');
    hash.update(password);
    password = hash.digest('hex');
    var date = new Date(Date.now()).toLocaleDateString();
    let queryText = "INSERT INTO asp_users (first_name, last_name, email, password, date_joined, status) VALUES ('" + firstName + "', '" + lastName + "', '" + email + "', '" + password + "', '" + date + "', true);";
    console.log("Query: " + queryText);
    db.query(queryText)
      .then(res => {
        if(res != undefined){
          console.log("Account creation successful!");
          getres.send("Account creation successful!");
        }
        else{
          getres.send("Account creation failed");
        }
      })
      .catch(e => console.error(e.stack))
  });

  /**
   * Takes in the request query's parameters
   * Signs a JWT token and returns it to the user
   * If the user doesn't exist, return an error
   */
  app.get('/user/login', (req, getres) => {
    console.log("GET - login");
    var email = req.query.email;
    var password = req.query.password;
    const hash = crypto.createHash('sha256');
    hash.update(password);
    password = hash.digest('hex');
    let queryText = "SELECT * FROM asp_users WHERE email = '" + email + "' AND password = '" + password + "';";
    db.query(queryText)
      .then(res => {
        if(res.rows[0] != null){
          // Puts various user information into the JWT
          var payload = {
            user_id: res.rows[0].user_id,
            first_name: res.rows[0].first_name,
            last_name: res.rows[0].last_name,
            email: email,
          };
          var token = jwt.sign(payload, "thisisthekey", { expiresIn: '1h'}); // Sets the token to expire in an hour
          var decoded = jwt.verify(token, "thisisthekey"); // For reference
          console.log(res.rows[0]);
          // Return the token to the user
          getres.send(token);
          // getres.send(res.rows[0]);
        }
        else{
          getres.send("User not found");
        }
      })
      .catch(e => console.error(e.stack))
  });

  /**
   * Returns users that match a query string
   * Takes in the request query's parameters
   */
  app.get('/user/search', (req, getres) => {
    console.log("GET - search");
    var searchString = req.query.searchString;
    let queryText = "SELECT * FROM ASP_USERS WHERE first_name::text || last_name::text LIKE '%" +  searchString + "%'";
    db.query(queryText)
      .then(res => {
        console.log(res.rows);
        getres.send(res.rows);
      })
      .catch(e => console.error(e.stack))
  });
  
  /**
   * Returns user info for user with id
   * Takes in the request query's parameters
   */
  app.get('/user/info', (req, getres) => {
    console.log("GET - info");
    var id = req.query.id;
    let queryText = "SELECT * FROM ASP_USERS WHERE user_ID = " +  id + ";";
    db.query(queryText)
      .then(res => {
        console.log(res.rows);
        getres.send(res.rows);
      })
      .catch(e => console.error(e.stack))
  });

  /**
   * Returns user profile picture for user with id
   * Takes in the request query's parameters
   */
  app.get('/user/profile-picture', (req, getres) => {
    console.log("GET - profile picture");
    var id = req.query.id;
    let queryText = "SELECT path FROM PHOTOS WHERE photo_id = (SELECT photo_id FROM USER_PHOTO WHERE user_ID = " +  id + " AND type = 'profile');";
    db.query(queryText)
      .then(res => {
        console.log(res.rows);
        getres.send(res.rows);
      })
      .catch(e => console.error(e.stack))
  });
  
  /**
   * Modifies an entry in the asp_users' table
   * Takes in the request body's parameters
   */
  app.post('/user/alter', (req, getres) => {
    console.log("Post - create account");
    var id = req.body.id;
    var firstName = req.body.first_name;
    var lastName = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password; // Hash password
	console.log(password);
    const hash = crypto.createHash('sha256');
    hash.update(password);
    password = hash.digest('hex');
    let queryText = "UPDATE asp_users SET (first_name, last_name, email, password) = ('" + firstName + "', '" + lastName + "', '" + email + "', '" + password + "') WHERE user_id = " + id + ";";
    console.log("Query: " + queryText);
    db.query(queryText)
      .then(res => {
        if(res != undefined){
          console.log("Account update successful!");
          getres.send("Account update successful!");
        }
        else{
          getres.send("Account update failed");
        }
      })
      .catch(e => console.error(e.stack))
  });

  /**
   * Returns user's photos for user with id
   * Takes in the request query's parameters
   */
  app.get('/user/photos', (req, getres) => {
    console.log("GET - user photos");
    var id = req.query.id;
    let queryText = "SELECT * FROM PHOTOS WHERE photo_id in (SELECT photo_id FROM USER_PHOTO WHERE user_ID = " +  id + " AND type = 'styled')";
    db.query(queryText)
      .then(res => {
        console.log(res.rows);
        getres.send(res.rows);
      })
      .catch(e => console.error(e.stack))
  });
  
}