/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

import pu = require('../utils/promise');
import ui = require('../ui/helper');

const API_KEY = "2GIS_API_KEY"; // replaced by gulp
const API_URL = "//catalog.api.2gis.ru";

if (API_KEY == "2GIS" + "_API_KEY") {
	console.error("2GIS api key not specified");
}

class Entity {
	id: string;
	apiLink: string;
	
	constructor(id: string, apiLink: string) {
		this.id = id;
		this.apiLink = apiLink;
	}
	
	getExternalLinkHtml() {
		return ui.getExternalLinkCode(this.apiLink);
	}
}

class Filial extends Entity {
	name: string;
	projectId: number;
	
	constructor(id: string, name: string, projectId: number, apiLink: string) {
		super(id, apiLink);
		this.name = name;
		this.projectId = projectId;
	}
	
	toString() {
		return `${this.name}, pj. ${this.projectId} ${this.getExternalLinkHtml()}`;
	}
}

class Rubric extends Entity {
	name: string;
	projectId: number;
	
	constructor(id: string, name: string, projectId: number, apiLink: string) {
		super(id, apiLink);
		this.name = name;
		this.projectId = projectId;
	}
	
	toString() {
		return `${this.name}, pj. ${this.projectId} ${this.getExternalLinkHtml()}`;
	}
}

class ApiResult {
	url: string;
	data: any;
	
	constructor(url: string, data: any) {
		this.url = url;
		this.data = data;
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

function callTwoGisAPI(method: string, params: any): Promise<ApiResult> {
	return new Promise<ApiResult>((resolve, reject) => {
		params.key = API_KEY;
		var requestUrl = `${API_URL}/2.0/${method}?key=${API_KEY}&${buildParamString(params)}`
		var xhr = new XMLHttpRequest();
		xhr.open('GET',
			`${API_URL}/2.0/${method}?${buildParamString(params)}`,
			true
		);
		xhr.onreadystatechange = (ev) => {
			if(xhr.readyState == xhr.DONE) {
				if (xhr.status == 200) {
					try {
						var resp = JSON.parse(xhr.responseText);
						if (resp.meta.code == 200) {
							resolve(new ApiResult(requestUrl, resp));
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
		callTwoGisAPI("catalog/branch/get", {id: id, fields: 'items.region_id'})
			.then((resp) => {
				if (resp.data.result.total > 0) {
					var filial = resp.data.result.items[0];
					resolve(new Filial(filial.id, filial.name, filial.region_id, resp.url));
				} else {
					reject();
				}
			}, reject);
	})
}

function rubricGet(id: string): Promise<Rubric> {
	return new Promise<Rubric>((resolve, reject) => {
		callTwoGisAPI("catalog/rubric/get", {id: id, fields: '*'})
			.then((resp) => {
				if (resp.data.result.total > 0) {
					var rubric = resp.data.result.items[0];
					resolve(new Rubric(rubric.id, rubric.name, rubric.region_id, resp.url));
				} else {
					reject();
				}
			}, reject);
	})
}

function getTwoGisFilial(text: string): Promise<string> {
	var asNumber = Number(text);
	if (!isNaN(asNumber) && isLikeFilialId(asNumber)) {
		return pu.promiseMap(
			branchGet(text), 
			(filial: Filial) => `Filial: ${filial}`
		);
	}
	return Promise.reject<string>(new Error("is not filial"));
}

function getTwoGisRubric(text: string): Promise<string> {
	var asNumber = Number(text);
	if (!isNaN(asNumber) && isLikeRubricId(asNumber)) {
		return pu.promiseMap(
			rubricGet(text), 
			(rubric: Rubric) => `Rubric: ${rubric}`
		);
	}
	return Promise.reject<string>(new Error("is not rubric"));
}

function getTwoGisObject(text: string) {
	return pu.positiveRace([getTwoGisFilial(text), getTwoGisRubric(text)]);
}

export = getTwoGisObject;