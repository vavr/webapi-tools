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

function getDGisHashInfo(text: string): Promise<string> {
    var matches = text.match(/(\d+)(_([\w\.]+))?/);

    if (matches) {
        var id = matches[1],
            hash = matches[3];

        if (hash) {
            var hashInfoUrl = `http://service.api.n1.nato/hash?hash=${hash}&format=json`;
            return pu.promiseMap(request(hashInfoUrl), (result: HashDecodeResult) => {
                return formatHashInfo(result[0]);
            })
        } else {
            return getTwoGisObject(id);
        }
    } else {
        return pu.reject("no dgis id")
    }
}

export = getDGisHashInfo;