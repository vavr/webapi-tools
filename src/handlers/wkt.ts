/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />

import request = require('../utils/request');
import pu = require('../utils/promise');
import ui = require('../ui/helper');

function isWkt(text: string) {
    return text.match(/(MULTI)?(POINT|LINESTRING|STRING|POLYGON)\s*\([\d\s\.,\(\)]+\)/);
}

function getWktMap(text: string): Promise<string> {
    var detected;
    if (detected = isWkt(text)) {
        var url = `http://klpx.github.io/wktmap/inline.html#${detected[0]}`;
        return Promise.resolve(`<iframe src="${url}" width="350" height="250"/>`)
    } else {
        return pu.reject<string>("it is not a WKT");
    }
}

export = getWktMap;
