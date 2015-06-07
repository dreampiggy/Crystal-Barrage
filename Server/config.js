var mysql = require('mysql');
function connect(){
	var connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '123456',
		database : 'hackday_enjoy',
	});

	connection.connect(function(err) {
		if (err) {
			console.error('Database connect error!\n' + err.stack);
			process.exit();
		}
		else{
			console.log('Database start!');
		}});
	return connection;
};

module.exports = connect();