/// <reference path="../../typings/chrome/chrome.d.ts" />

export function getExternalLinkCode(link: string) {
	return `
		<a href="${link}" target="_blank"><img src="${chrome.extension.getURL('static/link.png')}" /></a>
	`;
}