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
      mongo = require("mongodb").MongoClient,
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

          dbFileStorage.collection("Files")
  					.find({ "_id": new myBSON.ObjectID(req.params.fileId) })
  					.nextObject(function(err, file) {
  						res.json(file);
  					});

        });


        app.post("/svc/file", function(req, res) {

          dbFileStorage.collection("Files")
  					.insert(req.body.file, function(err, file) {
  						res.json(file);
  					});

        });

        app.delete("/svc/file/:fileId", function(req, res) {

          dbFileStorage.collection("Files")
  					.remove({ "_id" : new myBSON.ObjectID(req.params.fileId) },
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
