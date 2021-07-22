'use strict';

const { app, BrowserWindow } = require('electron');
// const path = require('path');

function createWindow () {
	const win = new BrowserWindow({
		width: 800,
		height: 800,
		// preload: path.join(__dirname, 'preload.js'),
		webPreferences: {
			nodeIntegration: true
		}
	});
	win.loadFile('index.html');
}

app.whenReady().then(() => {
	createWindow();
});

app.on('window-all-closed', () => {
	app.quit();
});