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
	entityType: string;
	apiLink: string;
	
	constructor(id: string, type: string, apiLink: string) {
		this.id = id;
		this.entityType = type;
		this.apiLink = apiLink;
	}
	
	getExternalLinkHtml() {
		return ui.getExternalLinkCode(this.apiLink);
	}
}

class ApiObject extends Entity {
	name: string;
	projectId: number;
	
	constructor(id: string, type: string, name: string, projectId: number, apiLink: string) {
		super(id, type, apiLink);
		this.name = name;
		this.projectId = projectId;
	}
	
	toString() {
		return `${this.entityType} ${this.name}, pj. ${this.projectId} ${this.getExternalLinkHtml()}`;
	}
}

class Rubric extends Entity {
	name: string;
	projectId: number;
	
	constructor(id: string, name: string, projectId: number, apiLink: string) {
		super(id, `rubric`, apiLink);
		this.name = name;
		this.projectId = projectId;
	}
	
	toString() {
		return `${this.entityType} ${this.name}, pj. ${this.projectId} ${this.getExternalLinkHtml()}`;
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

function isLikeApiObjectId(n: number) {
	return (n >> 32) > 0;
}

function isLikeRubricId(n: number) {
	return n > 0;
}

function buildParamString(params: any) {
	return Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
}

function callTwoGisAPI(method: string, params: any): Promise<ApiResult> {
	return new Promise<ApiResult>((resolve, reject) => {
		params.key = API_KEY;
		var requestUrl = `${API_URL}/${method}?${buildParamString(params)}`
		var xhr = new XMLHttpRequest();
		xhr.open('GET',
			requestUrl,
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

function apiObjectGet(id: string): Promise<ApiObject> {
	return new Promise<ApiObject>((resolve, reject) => {
		callTwoGisAPI("3.0/items/byid", {id: id, fields: 'items.region_id'})
			.then((resp) => {
				if (resp.data.result.total > 0) {
					var apiObj = resp.data.result.items[0];
					resolve(new ApiObject(apiObj.id, apiObj.type, apiObj.name, apiObj.region_id, resp.url));
				} else {
					reject();
				}
			}, reject);
	})
}

function rubricGet(id: string): Promise<Rubric> {
	return new Promise<Rubric>((resolve, reject) => {
		callTwoGisAPI("2.0/catalog/rubric/get", {id: id, region_id: 1})
			.then((resp) => {
				if (resp.data.result.total > 0) {
					var rubric = resp.data.result.items[0];
					resolve(new Rubric(rubric.id, rubric.name, 1, resp.url));
				} else {
					reject();
				}
			}, reject);
	})
}

function getTwoGisApiObject(text: string): Promise<string> {
	var asNumber = Number(text);
	if (!isNaN(asNumber) && isLikeApiObjectId(asNumber)) {
		return pu.promiseMap(
			apiObjectGet(text),
			(apiObject: ApiObject) => apiObject.toString()
		);
	}
	return pu.reject<string>(new Error("is not filial"));
}

function getTwoGisRubric(text: string): Promise<string> {
	var asNumber = Number(text);
	if (!isNaN(asNumber) && isLikeRubricId(asNumber)) {
		return pu.promiseMap(
			rubricGet(text), 
			(rubric: Rubric) => rubric.toString()
		);
	}
	return pu.reject<string>(new Error("is not rubric"));
}

function getTwoGisObject(text: string) {
	return pu.positiveRace([getTwoGisApiObject(text), getTwoGisRubric(text)]);
}

export = getTwoGisObject;