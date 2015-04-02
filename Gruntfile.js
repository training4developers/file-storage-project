module.exports = function(grunt) {

  grunt.initConfig({

    webServer: {
      rootFolder: "www",
      port: 8080,
      uploadFolder: "www/uploads"
    },
    mongoServer: {
      host: 'localhost',
      port: 27017
    }

  });

  grunt.registerTask("default", "start web and database server", function() {

    var
      http = require("http"),
      express = require("express"),
      bodyParser = require("body-parser"),
      multer = require("multer"),
      mongo = require("mongodb"),
      app = express(),
      webServerConfig = grunt.config("webServer"),
      mongoServerConfig = grunt.config("mongoServer");

    this.async();

    mongo.connect("mongodb://" + mongoServerConfig.host + ":" + mongoServerConfig.port,
      function(err, db) {

        if (err) {
          grunt.log.writeln("Failed to connect to MongoDB Server on " +
            mongoServerConfig.host + ":" + mongoServerConfig.port + ".\nError: " + err);
          return;
        }

        var dbFileStorage = db.db("FileStorage");

        app.use(bodyParser.json());
        app.use(multer({
          dest: webServerConfig.uploadFolder,
          rename: function(fieldName, fileName) {
            return fileName;
          }
        }));

        app.use(express.static(webServerConfig.rootFolder));

        app.get("/svc/files", function(req, res) {

          dbFileStorage.collection("Files")
  					.find()
  					.toArray(function(err, files) {
  						res.json(files);
  					});

        });

        app.get("/svc/file/:fileId", function(req, res) {

          console.log(req.params.fileId);
          console.log(mongo.BSONPure);

          dbFileStorage.collection("Files")
  					.find({ "_id": new mongo.ObjectID(req.params.fileId) })
  					.nextObject(function(err, file) {
  						res.json(file);
  					});

        });

        app.post("/uploads", function(req, res) {

          res.json({
            message: "file upload successful!"
          });

        });


        app.post("/svc/file", function(req, res) {

          dbFileStorage.collection("Files")
  					.insert(req.body.file, function(err, file) {
  						res.json(file);
  					});

        });

        app.put('/svc/file/:fileId', function(req, res) {

  				req.body.file._id = new mongo.ObjectID(req.params.fileId);

          dbFileStorage.collection("Files")
  					.update({ "_id" : req.body.file._id },
  						{$set: req.body.file},
  						{w:1},
  						function(err) {
  							res.json(err);
  						});

  			});

        app.delete("/svc/file/:fileId", function(req, res) {

          dbFileStorage.collection("Files")
  					.remove({ "_id" : new mongo.ObjectID(req.params.fileId) },
  						function(err, numberRemoved) {
  							res.json(numberRemoved);
  						});

        });

        http.createServer(app).listen(webServerConfig.port, function() {
          grunt.log.writeln("web server started on port: " + webServerConfig.port);
        });

      });

  });

}
