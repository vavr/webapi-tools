/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../utils/promise.ts" />

import pu = require('../utils/promise');

const API_KEY = "rugalt6554";
const API_URL = "http://catalog.api.2gis.ru";

if (API_KEY == "nospecified") {
	console.error("2GIS api key not specified");
}

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

function buildParamString(params: any) {
	return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
}

function callTwoGisAPI(method: string, params: any): Promise<any> {
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

function branchGet(id: string): Promise<Filial> {
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

function rubricGet(id: string): Promise<Rubric> {
	return new Promise<Rubric>((resolve, reject) => {
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
		return pu.promiseMap(
			branchGet(filialId.toString()), 
			(filial: Filial) => `Filial: ${filial.name}`
		);
	}
	return Promise.reject<string>(new Error("is not filial"));
}

function getTwoGisRubric(text: string): Promise<string> {
	var rubricId = Number(text);
	if (!isNaN(rubricId) && isLikeRubricId(rubricId)) {
		return pu.promiseMap(
			rubricGet(rubricId.toString()), 
			(rubric: Rubric) => `Rubric: ${rubric.name}`
		);
	}
	return Promise.reject<string>(new Error("is not rubric"));
}

function getTwoGisObject(text: string) {
	return pu.positiveRace([getTwoGisFilial(text), getTwoGisRubric(text)]);
}

export = getTwoGisObject;