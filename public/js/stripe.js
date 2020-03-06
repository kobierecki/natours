/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
	try {
		const stripe = Stripe('pk_test_b0RzMa7TgI5amc0DQxKnDmEM00wsoew0lb');
		// Get checkout session 
		const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
		// Create checkout form + charge credit card
		await stripe.redirectToCheckout({
			sessionId: session.data.session.id
		})
	} catch (err) {
		showAlert('error', err);
	}

};