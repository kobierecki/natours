const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			maxlength: [40, 'Tour name must be equal to 40 or less characters'],
			minlength: [10, 'Tour name must be equal to 10 or more characters']
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
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either easy, medium, or difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Rating mus be above 1.0'],
			max: [5, 'Rating mus be below 5.0'],
			set: val => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
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
			required: [true, 'A tour must have a summary']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a imageCover']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			type: {
				type: String,
				default: 'Point',
				enum: ['Point']
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					default: 'Point',
					enum: ['Point']
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: Number
			}
		],
		guides: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User'
			}
		]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt'
	});
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
	// Hide secret tours if geoNear is NOT used
	if (!(this.pipeline().length > 0 && '$geoNear' in this.pipeline()[0])) {
		this.pipeline().unshift({
			$match: { secretTour: { $ne: true } }
		});
	}
	next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
