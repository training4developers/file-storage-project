module.exports = function(grunt) {

  grunt.initConfig({

    webServer: {
      rootFolder: "www",
      port: 8080,
      uploadFolder: "www/uploads"
    }

  });

  grunt.registerTask("default", "start web and database server", function() {

    var
      http = require("http"),
      express = require("express"),
      bodyParser = require("body-parser"),
      multer = require("multer"),
      app = express(),
      webServerConfig = grunt.config("webServer");

    this.async();

    app.use(bodyParser.json());
    app.use(multer({
      dest: webServerConfig.uploadFolder,
      rename: function(fieldName, fileName) {
        return fileName;
      }
    }));

    app.use(express.static(webServerConfig.rootFolder));

    app.get("/svc/files", function(req, res) {

      res.json([
        { id: 1, name: 'test1.txt', size: 2048, modified: Date.now() },
        { id: 2, name: 'test2.txt', size: 4096, modified: Date.now() },
        { id: 3, name: 'test3.txt', size: 1024, modified: Date.now() },
      ]);

    });

    app.post("/svc/files", function(req, res) {

    });

    app.delete("/svc/file/:fileId", function(req, res) {

    });

    http.createServer(app).listen(webServerConfig.port, function() {
      grunt.log.writeln("web server started on port: " + webServerConfig.port);
    });

  });

}
