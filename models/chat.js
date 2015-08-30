console.log("Reading chat.js...");
var Sequelize = require('sequelize');
var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
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

module.exports = Chat;