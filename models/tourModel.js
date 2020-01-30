const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
		maxlength: [40, 'Tour name must be equal to 40 or less characters'],
		minlength: [10, 'Tour name must be equal to 10 or more characters'],
		// validate: [validator.isAlpha, 'Tour name must be alphanumeric']
	},
	slug: { type: String },
	duration: {
		type: Number,
		required: [true, 'A tour must have a duration']
	},
	maxGroupSize: {
		type: Number,
		required: [true, 'A tour must have a maxGroupSize']
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have a difficulty'],
		enum: {
			values: ['easy', 'medium', 'hard'],
			message: 'Difficulty is either easy, medium, or hard',
		}
	},
	ratingsAverage: {
		type: Number,
		default: 4.5,
		min: [1, 'Rating mus be above 1.0'],
		max: [5, 'Rating mus be below 5.0'],
	},
	ratingsQuantity: {
		type: Number,
		default: 0,
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price'],
	},
	priceDiscount: {
		type: Number,
		validate: {
			validator: function (val) {
				return val < this.price;
			},
			message: 'Discount price ({VALUE}) should be below regular price'
		}
	},
	summary: {
		type: String,
		trim: true,
		required: [true, 'A tour must have a summary'],
	},
	description: {
		type: String,
		trim: true,
	},
	imageCover: {
		type: String,
		required: [true, 'A tour must have a imageCover']
	},
	images: [String],
	createdAt: {
		type: Date,
		default: Date.now(),
		select: false,
	},
	startDates: [Date],
	secretTour: {
		type: Boolean,
		default: false,
	}
}, {
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });
	this.start = Date.now();
	next();
});

tourSchema.post(/^find/, function (doc, next) {
	console.log(`Querry took ${Date.now() - this.start}`);
	next();
});

tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({
		$match: { secretTour: { $ne: true } }
	});
	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
