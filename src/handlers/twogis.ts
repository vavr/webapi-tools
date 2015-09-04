/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

const API_KEY = "putkeyhere";
const API_URL = "http://catalog.api.2gis.ru";

class Filial {
	id: string;
	name: string;
	
	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}

class Rubric {
	id: string;
	name: string;
	
	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}

function isLikeFilialId(n: number) {
	return (n >> 32) > 0;
}

function isLikeRubricId(n: number) {
	return isLikeFilialId(n);
}

function promiseMap<A, B>(promise: Promise<A>, callback: (A) => B): Promise<B> {
	return new Promise<B>((resolve, reject) => {
		promise.then(
			(value) => {
				resolve(callback(value));
			},
			reject
		);
	});
}

function buildParamString(params: any) {
	return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
}

function callTwoGisAPI(method, params: any): Promise<any> {
	return new Promise<Filial>((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.open('GET',
			`${API_URL}/2.0/${method}?key=${API_KEY}&${buildParamString(params)}`,
			true
		);
		xhr.onreadystatechange = (ev) => {
			if(xhr.readyState == xhr.DONE) {
				if (xhr.status == 200) {
					try {
						var resp = JSON.parse(xhr.responseText);
						if (resp.meta.code == 200) {
							resolve(resp);
							return;
						}
					} catch (err) {
						reject(err);
					}
				}
				reject();
			}
		};
		xhr.send();
	})
}

function branchGet(id): Promise<Filial> {
	return new Promise<Filial>((resolve, reject) => {
		callTwoGisAPI("catalog/branch/get", {id: id})
			.then((resp) => {
				if (resp.result.total > 0) {
					var filial = resp.result.items[0];
					resolve(new Filial(filial.id, filial.name));
				} else {
					reject();
				}
			}, reject);
	})
}

function rubricGet(id): Promise<Rubric> {
	return new Promise<Filial>((resolve, reject) => {
		callTwoGisAPI("catalog/rubric/get", {id: id})
			.then((resp) => {
				if (resp.result.total > 0) {
					var rubric = resp.result.items[0];
					resolve(new Rubric(rubric.id, rubric.name));
				} else {
					reject();
				}
			}, reject);
	})
}

function getTwoGisFilial(text: string): Promise<string> {
	var filialId = Number(text);
	if (!isNaN(filialId) && isLikeFilialId(filialId)) {
		return promiseMap<Filial, string>(
			branchGet(filialId), 
			(filial: Filial) => {
				return `Filial: ${filial.name}`;
			}
		);
	}
	return Promise.reject(null);
}

function getTwoGisRubric(text: string): Promise<string> {
	var rubricId = Number(text);
	if (!isNaN(rubricId) && isLikeRubricId(rubricId)) {
		return promiseMap<Rubric, string>(
			rubricGet(rubricId), 
			(rubric: Rubric) => {
				return `Rubric: ${rubric.name}`;
			}
		);
	}
	return Promise.reject(null);
}