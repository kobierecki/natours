const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

process.on('uncaughtException', err => {
	console.log(err.name, err.message);
	console.log('UNCAUGHT EXCEPTION!');
	server.close(() => {
		process.exit(1);
	});
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => {
		console.log('DB connected');
	});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', err => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION!');
	server.close(() => {
		process.exit(1);
	});
});
