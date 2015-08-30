var express = require('express');




var app = express();
var http = require('http').Server(app);
//database
var fs = require("fs");
//var file = "charrecord.db";
//var exists = fs.existsSync(file);
//var sqlite3 = require("sqlite3").verbose();
//var db = new sqlite3.Database(file);


var credentials = require('./credentials.js');

var chat = require('./models/chat.js');






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




app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

app.use(require('body-parser')());

app.get('/', function(req, res) {
	res.render('home');
});

app.post('/enter', function(req, res) {
	console.log('Form (from querystring): ' + req.query.form);
	var name = req.body.name;
	console.log("You have entered: "+name);
	req.session.userName = name;

	return res.redirect(303, '/chatroom'); 
});

app.get('/chatroom', function(req, res, next) {
 chat.findById(1).then(function(result) {
	 console.log(result.id+": "+result.userName);
 });
 
 console.log("Session: userName -> "+req.session.userName);
/* 
Chat
  .build({ userName: 'Eileen Wei 3', chatContent: 'This is a testing msg 3' })
  .save()
  .then(function(anotherTask) {
    // you can now access the currently saved task with the variable anotherTask... nice!
	 
  }).catch(function(error) {
    // Ooops, do some error-handling
  })
 
 */
	chat.create({
	  userName: req.session.userName,
	  chatContent: 'This is a testing msg 3'
	}).then(function(john) {
	  
	});
 chat.findAll().then(function(result){
	 console.log("Number of records: "+result.length);
	 
    res.render('chatroom', {chathistory: result}, function(err, html) {
      res.send(200, html);
    });
 });
});

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

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
		
	var addedUser = false;

	// when the client emits 'new message', this listens and executes
	socket.on('new message', function (data) {
		// we tell the client to execute 'new message'
		socket.broadcast.emit('new message', {
			username: socket.username,
		  message: data
		});
	});	
	
// when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
		
		
		
		
});


module.exports = app;
//db.close();
