/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

import getTwoGisObject = require('./twogis');
import pu = require('../utils/promise');
import request = require('../utils/request');
import ui = require('../ui/helper');


interface IApiKeyInfo {
    id: number;
    key: string;
    domain: string;
    name: string;
}

function formatApiKeyInfo(i: IApiKeyInfo, link: string) {
    return `key: ${i.key} ${ui.getExternalLinkCode(link)}<br>` +
            `name: ${i.name}<br>` +
            `domain: ${i.domain}`;
}

function getApiKeyInfoURL(serviceHost: string, key: string) {
    return `http://${serviceHost}/apiUsers/default/info?key=${key}`;
}

function getApiKeyInfoURLById(serviceHost: string, id: number) {
    return `http://${serviceHost}/apiUsers/default/view?id=${id}`;
}

var DEFAULT_SERVICE_HOST = 'service.api.m1.nato';

function getApiKeyInfo(text: string): Promise<string> {
    var matches = text.match(/(ru[a-z]{4}[0-9]{4})/);

    if (matches) {
        var key = matches[1];

        var apiKeyInfoPromise: Promise<any>;
        var catalogMatch: RegExpMatchArray;
        if (catalogMatch = location.hostname.match('/^catalog\.(.+)/')) {
            apiKeyInfoPromise = pu.positiveRace([
                request(getApiKeyInfoURL(DEFAULT_SERVICE_HOST, key)),
                request(getApiKeyInfoURL('service.' + catalogMatch[1], key))
            ])
        } else {
            apiKeyInfoPromise = request(getApiKeyInfoURL(DEFAULT_SERVICE_HOST, key))
        }

        return pu.promiseMap(
            pu.filter(
                apiKeyInfoPromise,
                (result: IApiKeyInfo) => result && Object.keys(result).length > 0
            ),
            (result: IApiKeyInfo) => {
                var link = getApiKeyInfoURLById(DEFAULT_SERVICE_HOST, result.id);
                return formatApiKeyInfo(result, link);
            }
        )
    } else {
        return pu.reject("no api key")
    }
}

export = getApiKeyInfo;