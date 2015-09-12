/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />

import moment = require('moment');
import pu = require('../utils/promise');

var minDate = (new Date(2000, 1, 1, 0, 0, 0, 0)).valueOf();
var maxDate = (new Date(2030, 1, 1, 0, 0, 0, 0)).valueOf();

function isCorrectUnixtimeMs(x: number) {
	return x > minDate && x < maxDate;
}

function renderDate(time: number) {
	var d = moment(time);
	var format = "YYYY.MM.DD HH:mm:ss";
	if (d.milliseconds() > 0) {
		format += ".SSS";
	}
	return d.format(format);
}

function getDetectedUnixtime(text: string): Promise<string> {
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
	return pu.reject<string>();
}

export = getDetectedUnixtime;