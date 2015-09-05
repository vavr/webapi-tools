/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

function buildParamString(params: any) {
	return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
}

function request(url: string, params: any = {}) {
	return new Promise<any>((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', `${url}?${buildParamString(params)}`, true);
		xhr.onreadystatechange = (ev) => {
			if(xhr.readyState == xhr.DONE) {
				if (xhr.status == 200) {
					try {
						var resp = JSON.parse(xhr.responseText);
						resolve(resp);
					} catch (err) {
						reject(err);
					}
				}
				reject(xhr.statusText);
			}
		};
		xhr.send();
	});
}

export = request;