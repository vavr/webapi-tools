/// <reference path="../typings/es6-promise/es6-promise.d.ts" />

import getDetectedUnixtime = require('./handlers/unixtime');
import getTwoGisObject = require('./handlers/twogis');
import pu = require('./utils/promise');
import TipManager = require('./ui/tipManager');

var handlers: Array<(text: string) => Promise<string>> = [
	getDetectedUnixtime,
	getTwoGisObject
];

var tipManager = new TipManager("__chrome_extension_webapi_tools_tip");

function applyHandlers(text: string) {
	return pu.getResolvedPromises(handlers.map((_) => _(text)));
}

function onSelectionChange() {
	var selection = window.getSelection();
	var selectedText = selection.toString();
	if (selection.rangeCount == 1 && selectedText.length > 0) {
		applyHandlers(selectedText)
			.then((tips) => {
				if (tips.length) {
					tipManager.show(
						tips.join(","),
						selection.getRangeAt(0).getBoundingClientRect()
					);
				} else {
					tipManager.hide();
				}
			},
			tipManager.hide);
	} else {
		tipManager.hide();
	}
}

function isArrowKeyCode(keyCode: number) {
	return keyCode >= 37 && keyCode <= 40;
}

document.addEventListener("keyup", (ev) => {
	if (ev.shiftKey && isArrowKeyCode(ev.keyCode)) {
		onSelectionChange();
	}
});

document.addEventListener("mouseup", (ev) => {
	onSelectionChange();
});