/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />

import pu = require('../utils/promise');

var kibanaUrlTemplate = 'https://kibana.web-staging.2gis.ru/app/kibana#/discover?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-24h,mode:quick,to:now))&_a=(columns:!(request_uri,message,body,dc,ok),index:\'k8s-production-*-webapi-*\',interval:auto,query:(language:lucene,query:\'request_id:{request_id}\'),sort:!(\'@timestamp\',asc))';


function parseRequestId(x: string): string {
	var match = x.match(/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/);

	if (match)
		return match[0];
	else
		return '';
}

function renderRequestIdLink(requestId: string): string {
	return `<table><tr><td><a href="${kibanaUrlTemplate.replace('{request_id}', requestId)}" target="_blank">kibana</a></td></tr></table>`
}

function getRequestId(text: string): Promise<string> {
	var requestId = parseRequestId(text);

	if (requestId !== "") {
		return Promise.resolve(renderRequestIdLink(requestId));
	}
	return pu.reject<string>();
}

export = getRequestId;