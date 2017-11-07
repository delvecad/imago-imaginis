const db = require('../db');
const multer = require('multer'); 
const path = require('path');
const jwt = require('jsonwebtoken');

const config = require('../../config.js');


module.exports = function(app) {
  /**
   * Performs a photo upload
   * https://github.com/expressjs/multer/issues/170
   */
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploadsPath)
    },
    filename: async function (req, file, cb) {
        console.log(file);
        // Insert new entry into the database and use the unfiltered photo ID as filename
        let queryText = "INSERT INTO unfiltered_photo (size, height, width, path) VALUES (0, 264, 264, '') RETURNING unfiltered_photo_id;";
        console.log("Query: " + queryText);
        var result = await db.query(queryText);
        var unfiltered_photo_id = result.rows[0].unfiltered_photo_id;
        file.unfiltered_photo_id = unfiltered_photo_id;
        var filename = file.fieldname + '-' + unfiltered_photo_id + path.extname(file.originalname);
        cb(null, filename);
    }
  });
  app.post('/upload/photo', multer({storage: storage}).single("upload"), (req, getres) => {
    // Do verification that this is indeed a photo upload
    console.log("POST - upload");
    console.log(req.file);
    async function upload() {
      var path = config.uploadsPath + "/" + req.file.filename;
      // Update record in DB to have file size and path
      let queryText = "UPDATE unfiltered_photo SET (size, height, width, path) = (" + req.file.size + ", "+req.query.height+", "+req.query.width+", '" + path + "') WHERE unfiltered_photo_id = " + req.file.unfiltered_photo_id + ";";
      console.log("Query: " + queryText);
      result = await db.query(queryText);
      // Need to generate entry in Photos to have photo id so we can create entry in user_photo
      queryText = "INSERT INTO photos (size, creation_date, path, process_time, flag, display, height, width) VALUES (.00000001, '1970-01-01', '', 0, false, false, 0, 0) RETURNING photo_id;";
      console.log("Query: " + queryText);
      result = await db.query(queryText); 
      var photo_id = result.rows[0].photo_id;
      // We also need to create a new entry in User_Photo. Need to use generated unfiltered_photo_id
      queryText = "INSERT INTO user_photo (user_id, photo_id, filter_id, status, wait_time, unfiltered_photo_id) VALUES (" + req.query.user_id + ", " + photo_id + ", " + req.query.filter_id + ", 'waiting', 0, " + req.file.unfiltered_photo_id + ");";
      console.log("Query: " + queryText);
      db.query(queryText); 
      getres.send("Upload complete!");
    }
    upload();
  });

  /**
   * Performs a video upload
   * https://github.com/expressjs/multer/issues/170
   */
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.videoUploadsPath)
    },
    filename: async function (req, file, cb) {
        // Insert new entry into the database and use the unfiltered photo ID as filename
        let queryText = "INSERT INTO unfiltered_video (size, height, width, path) VALUES (0, 264, 264, '') RETURNING unfiltered_video_id;";
        console.log("Query: " + queryText);
        var result = await db.query(queryText);
        var unfiltered_video_id = result.rows[0].unfiltered_video_id;
        file.unfiltered_video_id = unfiltered_video_id;
        var filename = file.fieldname + '-' + unfiltered_video_id + path.extname(file.originalname);
        cb(null, filename);
    }
  });
  app.post('/upload/video', multer({storage: storage}).single("upload"), (req, getres) => {
    // Do verification that this is indeed a photo upload
    console.log("POST - upload");
    console.log(req.file);
    async function upload() {
      var path = config.videoUploadsPath + "/" + req.file.filename;
      // Update record in DB to have file size and path
      let queryText = "UPDATE unfiltered_video SET (size, height, width, path) = (" + req.file.size + ", "+"0"+", "+"0"+", '" + path + "') WHERE unfiltered_video_id = " + req.file.unfiltered_video_id + ";";
      console.log("Query: " + queryText);
      result = await db.query(queryText);
      // Need to generate entry in Videos to have photo id so we can create entry in user_photo
      // TODO: Insert height and width of video
      queryText = "INSERT INTO videos (size, creation_date, path, process_time, flag, display) VALUES (.00000001, '1970-01-01', '', 0, false, false) RETURNING video_id;";
      console.log("Query: " + queryText);
      result = await db.query(queryText); 
      var video_id = result.rows[0].video_id;
      // We also need to create a new entry in User_Video
      queryText = "INSERT INTO user_video (user_id, video_id, filter_id, status, wait_time, unfiltered_video_id) VALUES (" + req.query.user_id + ", " + video_id + ", " + req.query.filter_id + ", 'waiting', 0, " + req.file.unfiltered_video_id + ");";
      console.log("Query: " + queryText);
      db.query(queryText); 
      getres.send("Upload complete!");
    }
    upload();
  });

  /**
   * Performs filter upload
   */
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.stylePath)
    },
    filename: async function (req, file, cb) {
        // Insert new entry into the database and use the unfiltered photo ID as filename
        let queryText = "INSERT INTO filters(name, preset) VALUES('', false) RETURNING filter_id;";
        console.log("Query: " + queryText);
        var result = await db.query(queryText);
        var filter_id = result.rows[0].filter_id;
        file.filter_id = filter_id;
        var filename = 'filter' + '-' + filter_id + path.extname(file.originalname);
        cb(null, filename);
    }
  });
  app.post('/filter/upload', multer({storage: storage}).single("upload"), (req, getres) => {
    // Do verification that this is indeed a photo upload
    console.log("POST - upload");
    console.log(req.body);
    console.log(req.file);
    // getres.send(req.file);
    async function upload() {
      var path = config.stylePath + "/" + req.file.filename;
      // Update record in DB to have file size and path
      let queryText = "UPDATE filters SET (name, path) = ('" + req.body.user_id + "', '" + path + "') WHERE filter_id = " + req.file.filter_id + ";";
      console.log("Query: " + queryText);
      result = await db.query(queryText);
      getres.send(""+req.file.filter_id);
      // Need to generate entry in Photos to have photo id so we can create entry in user_photo
    }
    upload();
  });

  /* Performs a profile photo upload
   * https://github.com/expressjs/multer/issues/170
   */
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, config.uploadsPath)
    },
    filename: function (req, file, cb) {
        var filename = "profile" + '-' + Date.now() + path.extname(file.originalname)
        cb(null, filename);
    }
  });
  app.post('/user/upload/profile', multer({storage: storage}).single("upload"), (req, getres) => {
    // TODO: Do verification that this is indeed a photo upload
    console.log("POST - upload");
    console.log(req.file);
    async function upload() {
      var path = config.uploadsPath + "/" + req.file.filename;
      // var path = req.file.filename;
      var queryText = "UPDATE asp_users SET (profile_photo) = ('" + path + "') WHERE user_id = " + req.query.user_id + ";";
      console.log("Query: " + queryText);
      result = await db.query(queryText); 
    }
    upload();
    getres.send("Upload complete!");
  });
};