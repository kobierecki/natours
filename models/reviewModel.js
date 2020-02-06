const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	review: {
		type: String,
		required: [true, 'A review must have a description']
	},
	rating: {
		type: Number,
		min: [1, 'Rating mus be above 1.0'],
		max: [5, 'Rating mus be below 5.0'],
		required: [true, 'A review must have a rating']
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	tour: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Tour',
			required: [true, 'A review must have a tour']
		}
	],
	user: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'A review must have a user']
		}
	]
});

reviewSchema.pre(/^find/, function (next) {
	// this.populate({
	// 	path: 'tour',
	// 	select: 'name'
	// }).populate({
	// 	path: 'user',
	// 	select: 'name photo'
	// });
	this.populate({
		path: 'user',
		select: 'name photo'
	});
	next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
