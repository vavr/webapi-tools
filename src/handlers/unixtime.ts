/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

var minDate = (new Date(2000, 1, 1, 0, 0, 0, 0)).valueOf();
var maxDate = 0xFFFFFFFF * 1000;

function isCorrectUnixtimeMs(x: number) {
	return x > minDate && x < maxDate;
}

function renderDate(time: number) {
	var d = new Date(time);
	var dateString = `${d.getFullYear()}.${d.getMonth()}.${d.getDate()}`;
	var timeString = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
	if (d.getMilliseconds() != 0) {
		timeString += `.${d.getMilliseconds()}`;
	}
	return `${dateString} ${timeString}`;
}

function getDetectedUnixtime(text: string) {
	text = text.replace(/[^0-9]+/g, '');
	var parsedNumber = Number(text);
	if (!isNaN(parsedNumber)) {
		if (isCorrectUnixtimeMs(parsedNumber)) {
			return Promise.resolve(`Unixtime (ms): ${renderDate(parsedNumber)}`);
		}
		parsedNumber *= 1000.0;
		if (isCorrectUnixtimeMs(parsedNumber)) {
			return Promise.resolve(`Unixtime: ${renderDate(parsedNumber)}`);
		}
	}
	return Promise.reject(null);
}