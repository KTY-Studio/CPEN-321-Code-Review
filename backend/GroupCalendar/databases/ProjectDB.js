var mysql = require('mysql');

/**
 * CODE_REVIEW: passwords should not be hardcode
 * suggest: passing it as an environment variable, process.env
 */ 
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'secretpw=ZZJ321',
  database: 'ProjectDB'
});

db.connect(function(err) {
  if (err) throw err;
  console.log('You are now connected to ProjectDB...');
});

exports.query = function(query, result){ 
	db.query(query, function(err, res){
		if (err) throw err;
		//console.log(res);
		result(null, res);
	});
};