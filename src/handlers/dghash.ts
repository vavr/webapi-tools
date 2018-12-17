/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

import getTwoGisObject = require('./twogis');
import pu = require('../utils/promise');
import request = require('../utils/request');

interface IHashParam {
    value: string;
    human?: string;
}

interface IHashParams {
    [key: string]: IHashParam;
}

interface IHashInfo {
    hash: string;
    baseHash: string;
    params: IHashParams;
}

class HashDecodeResult extends Array<IHashInfo> {}

function getValueOfHashParam(p: IHashParam) {
    return p.human || p.value;
}

function formatHashInfo(i: IHashInfo) {
    var formattedParams = "";
    for (var k in i.params) {
        if (!i.params.hasOwnProperty(k)) {
            continue;
        }
        var v = i.params[k];
        formattedParams += `<tr><td>${k}</td><td>${getValueOfHashParam(v)}</td></tr>`;
    }

    formattedParams = `<table>${formattedParams}</table>`;
    return `base: ${i.baseHash}${formattedParams}`;
}

function getHashInfoUrl(serviceHost: string, hash: string) {
    return `https://${serviceHost}/hash?hash=${hash}&format=json`;
}

var DEFAULT_SERVICE_HOST = 'service.api.2gis.ru';

function getDGisHashInfo(text: string): Promise<string> {
    var matches = text.match(/([\w\\\/]{30,})/);

    if (matches) {
        var hash = matches[1];

        var hashInfoPromise: Promise<any>;
        var catalogMatch: RegExpMatchArray;
        if (catalogMatch = location.hostname.match('/^catalog\.(.+)/')) {
            hashInfoPromise = pu.positiveRace([
                request(getHashInfoUrl(DEFAULT_SERVICE_HOST, hash)),
                request(getHashInfoUrl('service.' + catalogMatch[1], hash))
            ])
        } else {
            hashInfoPromise = request(getHashInfoUrl(DEFAULT_SERVICE_HOST, hash))
        }

        return pu.promiseMap(
            pu.filter(
                hashInfoPromise,
                (result: HashDecodeResult) => result[0] && Object.keys(result[0].params).length > 0
            ),
            (result: HashDecodeResult) => formatHashInfo(result[0])
        )
    } else {
        return pu.reject("no dgis id")
    }
}

export = getDGisHashInfo;