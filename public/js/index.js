/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox.js';
import { login, logout } from './login';
import { updateCurrentUser } from './updateSettings';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

if (mapBox) {
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	})
};

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
	userDataForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const name = document.getElementById('name').value;
		updateCurrentUser(name, email);
	});