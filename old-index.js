var express = require('express');

var app = express();
var http = require('http').Server(app);
//database
var fs = require("fs");
var file = "charrecord.db";
var exists = fs.existsSync(file);
//var sqlite3 = require("sqlite3").verbose();
//var db = new sqlite3.Database(file);

var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

  // SQLite only
  storage: './db/test.sqlite3'
});

var Chat = sequelize.define('chat', {
  userName: {
    type: Sequelize.STRING
  },
  chatContent: {
    type: Sequelize.STRING
  }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});
console.log("Sequelize...Creating Chat Instance...");
Chat.sync({force: true}).then(function () {
	Chat.create({
	  userName: 'Eileen Wei 2',
	  chatContent: 'This is a testing msg 2'
	}).then(function(john) {
	  console.log('created!!!');
	});
  // Table created
  return Chat.create(
		{
    userName: 'Eileen Wei',
    chatContent: 'This is a testing msg'
  	}
	);
});


/*
db.serialize(function() {
  if(!exists) {
			db.run('CREATE TABLE "chathistory" ' +
           '("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
           '"user_name" VARCHAR(255), ' +
					 '"message" VARCHAR(255), ' +
           '"timestamp"  VARCHAR(255))', function(err) {
      if(err !== null) {
        console.log(err);
      }
      else {
        console.log("SQL Table 'chathistory' initialized.");
      }
    });
  }else{
  	console.log("SQL Table 'chathistory' already exists.");
  }
  
	db.run("BEGIN TRANSACTION");
	for (var i = 0; i < 10; i++) {
  	db.run("INSERT OR IGNORE INTO chathistory (id, user_name, message, timestamp) VALUES (?,?,?,?)", i, ''+i, ''+i, ''+i);
		console.log("Inserting into db: "+i);
	}		
	db.run("END");
	
	db.each("SELECT rowid AS id, user_name FROM chathistory", function(err, row) {
      console.log(row.id + ": " + row.user_name);
  });
			
//var stmt = db.prepare("INSERT INTO chathistory VALUES (?, ?, ?, ?)");
  
//Insert random data
  var rnd;
  for (var i = 0; i < 10; i++) {
    rnd = Math.floor(Math.random() * 10000000);
    stmt.run("Thing #" + rnd);
  }
  
stmt.finalize();
});

*/



app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + 
	'; press Ctrl-C to terminate.');
});

var io = require('socket.io').listen(server);

// set up handlebars view engine
var handlebars = require('express3-handlebars') .create({ 
	defaultLayout:'main',
	helpers: {
		section: function(name, options){
			if(!this._sections) this._sections = {};
		  this._sections[name] = options.fn(this);
		  return null;
		}
	}
});
 
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');



//static middleware
app.use(express.static(__dirname + '/public'));


/*
app.get('/', function(req, res){
  //res.sendFile('index.html',{ root: __dirname });
	//res.render('home');
	//res.render('home', {chathistory: row});
	console.log('Querying db...');

	db.serialize(function() {
		db.each("SELECT rowid AS id, user_name FROM chathistory", function(err, row) {
	      console.log(row.id + ": " + row.user_name);
	  });
	});	
		res.render('home');
		
		
});*/



app.get('/', function(req, res, next) {
	
	
	

 /* db.all('SELECT * FROM chathistory ORDER BY id', function(err, row) {
    if(err !== null) {
      // Express handles errors via its next function.
      // It will call the next operation layer (middleware),
      // which is by default one that handles errors.
      next(err);
    }
    else {
      console.log(row);
      res.render('home', {chathistory: row}, function(err, html) {
        res.send(200, html);
      });
    }
  });*/
	 Chat.findById(1).then(function(result) {
		 console.log(result.id+": "+result.userName);
	 });
	 Chat.findAll().then(function(result){
		 console.log("Number of records: "+result.length);
		 console.log(result);
     res.render('home', {chathistory: result}, function(err, html) {
       res.send(200, html);
     });
	 });
});



//socket.io
io.on('connection', function(socket){
  console.log('a user connected');
	
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
	socket.on('chat message', function(msg){
	    console.log('message: ' + msg);
			io.emit('chat message', msg);
	  });
});


module.exports = app;
//db.close();
