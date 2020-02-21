/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateCurrentUser = async (name, email) => {
	console.log('Updating');
	try {
		const res = await axios({
			method: 'PATCH',
			url: 'http://localhost:3000/api/v1/users/updateMe',
			data: {
				name,
				email
			}
		});
		if (res.data.status === 'success') {
			showAlert('success', 'Data updated successfully');
			window.setTimeout(() => {
				location.assign('/me');
			}, 1000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message);
	}
};