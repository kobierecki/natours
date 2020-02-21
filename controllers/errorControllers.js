const AppError = require('../utils/appError');

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors).map(el => el.message);
	const message = `Invalid input data: ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
	const message = `Duplicate field value: ${err.keyValue.name}. Pleasse use another value!`;
	return new AppError(message, 404);
};

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new AppError(message, 400);
};

const handleJWTError = () => {
	return new AppError('Invalid token, please log in again', 401);
};

const handleJWTExpiredError = () => {
	return new AppError('Your token has expired', 401);
};

const sendErrorDev = (err, req, res) => {
	// API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			error: err,
			status: err.status,
			message: err.message,
			stack: err.stack
		});
	}
	// RENDERED WEBSITE
	return res.status(err.statusCode).render(`error`, {
		title: 'Something went wrong',
		msg: err.message
	});
};

const sendErrorProd = (err, req, res) => {
	if (req.originalUrl.startsWith('/api')) {
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message
			});
		}
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong'
		});
	}
	if (err.isOperational) {
		return res.status(err.statusCode).render(`error`, {
			title: 'Something went wrong',
			msg: err.message
		});
	}

	console.log('Error', err);
	return res.status(err.statusCode).render(`error`, {
		title: 'Something went wrong',
		msg: 'Please try again later'
	});
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;
		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
		sendErrorProd(error, req, res);
	}
};
