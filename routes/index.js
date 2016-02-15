var express = require('express');
var router = express.Router();
var pg = require('pg');
var conString = process.env.DATABASE_URL || 'postgres://localhost:5432/test';
var path = require('path');
var basePath = process.env.PWD;
var sqlite3 = require("sqlite3").verbose();
var fs = require("fs");
var file = process.env.SQLITE_FILE || "queries.db";

/* Handle Angular request */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(basePath, 'public', 'views/index.html'));
});

/** Save queries */
router.post('/api/v1/saveQuery', function(req, res) {

    var unixTime = Math.floor(new Date() / 1000);
    var data = {
      title: req.body.title,
      query: req.body.queryValue,
      createdAt : unixTime
    };
    validateData(data, function (err){
      if (err) {
        return res.status(500).json({
          message: err
        });
      } else {
        return res.json({
          result: 'Success'
        });
      }
    });

});

/** Get queries */
router.get('/api/v1/getQueries', function(req, res) {
  SQliteGetQueries(function (err, result){
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    } else {
      return res.json(result);
    }
  });
});

/** Execute query */
router.get('/api/v1/execute/:id', function(req, res) {
  var id = req.params.id;
  executeQuery(id, function (err, result){
    if (err) {
      return res.status(500).json({
        message: err.message
      });
    } else {
      return res.json(result);
    }
  });
});

/**
 * Validate input data
 * @param  Object  data 
 */
function validateData(data, cb) {
  var queryIsValid = validateQuery(data);
  if (data.title == null || data.query == null) {
    cb('input data is invalid');
  } else if ((!data.title || data.title.length == 0 || !data.query ||data.query.length == 0)) {
    cb('input data is invalid');
  } else if (!queryIsValid) {
    cb('The query should be a select statement in just one line using semicolon');
  } else {
    //Save data
    SQliteSendData(data, cb);
  }
}

/**
 * Validate if the query is a select statement in just one line
 * @param  Object data 
 * @return Boolean
 */
function validateQuery(data){

  var isValid = false;
  var val = data.query;
  var expression = /^(select).*;$/i;

  if (val) {
    if (val.match(expression)) {
      isValid = true;
    }
  }

  return isValid;

}

/**
 * Connect to Postgres Database
 * @param Object data
 * @param Callback cb
 */
function PgConnection (data, cb) {

  var results = [];
  var isValid = '';
  var unixTime = Math.floor(new Date() / 1000);

  // Get a Postgres client from the connection pool
  pg.connect(conString, function(err, client, done) {

     // Handle connection errors
    if(err) {
      done();
      console.log('Error connecting to PG.', err);
      return cb(err);
    }
    console.log('Connected to PG.');
    // SQL Query > Select Data
    var query = client.query(data.query);

    // Stream results back one row at a time
    query.on('row', function(row) {
        results.push(row);
    });

    // After all data is returned, close connection and return results
    query.on('end', function() {
        done();
        //SQlite logic
        if (results.length > 0) {
          isValid = unixTime;
        }
        data.isValid = isValid;
        data.createdAt = unixTime;
        data.updateAt = unixTime;
        SQliteSendData(data, cb);
    });

  });

}

/**
 * Save data on SQLite
 * @param Object data 
 */
function SQliteSendData (data, cb) {
  var exists = fs.existsSync(file);

  if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
  }
  var db = new sqlite3.Database(file);

  db.serialize(function() {
    if(!exists) {
      db.run("CREATE TABLE Queries (title TEXT, query TEXT, is_valid INT, created_at INT, updated_at INT)");
    }
    console.log(data.query);
    //Search if it exists
    db.all('SELECT * FROM Queries WHERE query = ?', data.query, function(err, row) {
      if(err) {
        cb(err);
      } else {
        if (row && row.length > 0) {
          //Update
          console.log("Updating record.");
          db.run("UPDATE Queries SET title = ?, updated_at = ?, is_valid = ? WHERE query = ?",
            data.title, data.updateAt, data.isValid, data.query,
            function(err){
              db.close();
              if (err) {
                cb(err);
              } else {
                SQliteGetQueries(function(err, data){
                  cb(err, data);
                });
              } 
          });
        } else {
          //create
          console.log("Creating record.");
          db.run("INSERT INTO Queries VALUES (?, ?, ?, ?, ?)",
            data.title, data.query, null, data.createdAt, null,
            function(err){
              db.close();
              cb(err);
          });
        }
      }
    });
  });

}

/**
 * Get all data from Queries table
 */
function SQliteGetQueries(cb) {
  var exists = fs.existsSync(file);

  if(!exists) { 
    cb(null, []);
  } else {
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      db.all('SELECT rowid AS id, title, query, is_valid, created_at, updated_at FROM Queries', [], function(err, row) {
        db.close();
        cb(err, row);
      });
    });
  }
}

/**
 * Get data by id
 */
function SQliteGetQuery(id, cb){
  var exists = fs.existsSync(file);

  if(!exists) { 
    cb(null, []);
  } else {
    var db = new sqlite3.Database(file);
    db.serialize(function() {
      db.all('SELECT rowid AS id, title, query, is_valid, created_at, updated_at FROM Queries WHERE rowid = ?', id, function(err, row) {
        db.close();
        if(err) {
          cb(err);
        } else {
          var data = row[0];
          cb(null, data);
        }
      });
    });
  }
}

/**
 * Check query on Postgres database
 * @param  Int  id 
 */
function executeQuery(id, cb){
  if (!id) {
    return cb('Invalid id');
  }
  SQliteGetQuery(id, function(err, data){
    if(err) {
      cb(err);
    } else {
      PgConnection(data, cb);
    }
  });
}

module.exports = router;
