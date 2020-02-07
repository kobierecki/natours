const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
	{
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
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo'
	});
	next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId }
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	]);
	if (stats.length > 0) {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: stats[0].nRating,
			ratingsAverage: stats[0].avgRating.toFixed(2)
		});
	} else {
		await Tour.findByIdAndUpdate(tourId, {
			ratingsQuantity: 0,
			ratingsAverage: 4.5
		});
	}
};

reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.findOne();
	console.log(this.r);
	next();
});

reviewSchema.post(/^findOneAnd/, async function () {
	await this.r.constructor.calcAverageRating(this.r.tour);
});

reviewSchema.post('save', function () {
	this.constructor.calcAverageRating(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
