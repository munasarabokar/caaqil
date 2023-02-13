
const { response } = require('express');
const mysql = require('mysql');
require('dotenv').config()
var connection = mysql.createConnection({
	host:process.env.HOST,
	database:process.env.DB,
	user: process.env.USER,
	password: process.env.PASS ,
	multipleStatements: true
});

connection.connect(function(error){
	if (error) {
		console.log('MySQL Database is not connected Please Try to connect');
	} else {
		console.log('MySQL Database is connected Successfully');
	}
});

module.exports = connection;