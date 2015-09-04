/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
var minDate = (new Date(2000, 1, 1, 0, 0, 0, 0)).valueOf();
var maxDate = 0xFFFFFFFF * 1000;
function isCorrectUnixtimeMs(x) {
    return x > minDate && x < maxDate;
}
function renderDate(time) {
    var d = new Date(time);
    var dateString = d.getFullYear() + "." + d.getMonth() + "." + d.getDate();
    var timeString = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    if (d.getMilliseconds() != 0) {
        timeString += "." + d.getMilliseconds();
    }
    return dateString + " " + timeString;
}
function getDetectedUnixtime(text) {
    text = text.replace(/[^0-9]+/g, '');
    var parsedNumber = Number(text);
    if (!isNaN(parsedNumber)) {
        if (isCorrectUnixtimeMs(parsedNumber)) {
            return Promise.resolve("Unixtime (ms): " + renderDate(parsedNumber));
        }
        parsedNumber *= 1000.0;
        if (isCorrectUnixtimeMs(parsedNumber)) {
            return Promise.resolve("Unixtime: " + renderDate(parsedNumber));
        }
    }
    return Promise.reject(null);
}
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
function promiseMap(promise, callback) {
    return new Promise(function (resolve, reject) {
        promise.then(function (value) {
            resolve(callback(value));
        }, reject);
    });
}
function getResolvedPromises(promises) {
    return new Promise(function (resolve, reject) {
        var resolved = [];
        var completed = 0;
        var total = promises.length;
        function checkComplete() {
            completed++;
            if (completed == total) {
                resolve(resolved);
            }
        }
        promises.map(function (promise) {
            promise.then(function (value) {
                resolved.push(value);
                checkComplete();
            }, checkComplete);
        });
    });
}
function positiveRace(promises) {
    return new Promise(function (resolve, reject) {
        var resolved = [];
        var completed = 0;
        var total = promises.length;
        var isCompleted = false;
        function checkComplete() {
            completed++;
            if (completed == total && !isCompleted) {
                reject();
            }
        }
        function complete(value) {
            if (!isCompleted) {
                resolve(value);
                isCompleted = true;
            }
            checkComplete();
        }
        promises.map(function (promise) {
            promise.then(complete, checkComplete);
        });
    });
}
/// <reference path="../../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../utils/promise.ts" />
var API_KEY = "rugalt6554";
var API_URL = "http://catalog.api.2gis.ru";
var Filial = (function () {
    function Filial(id, name) {
        this.id = id;
        this.name = name;
    }
    return Filial;
})();
var Rubric = (function () {
    function Rubric(id, name) {
        this.id = id;
        this.name = name;
    }
    return Rubric;
})();
function isLikeFilialId(n) {
    return (n >> 32) > 0;
}
function isLikeRubricId(n) {
    return isLikeFilialId(n);
}
function buildParamString(params) {
    return Object.keys(params).map(function (key) { return (key + "=" + params[key]); }).join('&');
}
function callTwoGisAPI(method, params) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', API_URL + "/2.0/" + method + "?key=" + API_KEY + "&" + buildParamString(params), true);
        xhr.onreadystatechange = function (ev) {
            if (xhr.readyState == xhr.DONE) {
                if (xhr.status == 200) {
                    try {
                        var resp = JSON.parse(xhr.responseText);
                        if (resp.meta.code == 200) {
                            resolve(resp);
                            return;
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                reject();
            }
        };
        xhr.send();
    });
}
function branchGet(id) {
    return new Promise(function (resolve, reject) {
        callTwoGisAPI("catalog/branch/get", { id: id })
            .then(function (resp) {
            if (resp.result.total > 0) {
                var filial = resp.result.items[0];
                resolve(new Filial(filial.id, filial.name));
            }
            else {
                reject();
            }
        }, reject);
    });
}
function rubricGet(id) {
    return new Promise(function (resolve, reject) {
        callTwoGisAPI("catalog/rubric/get", { id: id })
            .then(function (resp) {
            if (resp.result.total > 0) {
                var rubric = resp.result.items[0];
                resolve(new Rubric(rubric.id, rubric.name));
            }
            else {
                reject();
            }
        }, reject);
    });
}
function getTwoGisFilial(text) {
    var filialId = Number(text);
    if (!isNaN(filialId) && isLikeFilialId(filialId)) {
        return promiseMap(branchGet(filialId), function (filial) {
            return "Filial: " + filial.name;
        });
    }
    return Promise.reject("is not filial");
}
function getTwoGisRubric(text) {
    var rubricId = Number(text);
    if (!isNaN(rubricId) && isLikeRubricId(rubricId)) {
        return promiseMap(rubricGet(rubricId), function (rubric) {
            return "Rubric: " + rubric.name;
        });
    }
    return Promise.reject("is not rubric");
}
function getTwoGisObject(text) {
    return positiveRace([getTwoGisFilial(text), getTwoGisRubric(text)]);
}
var TipManager = (function () {
    function TipManager(id) {
        this.element = null;
        this.id = id;
    }
    TipManager.prototype.isElementCreated = function () {
        return this.element !== null;
    };
    TipManager.prototype.getElement = function () {
        var _this = this;
        if (this.isElementCreated()) {
            return this.element;
        }
        else {
            var el = document.createElement("div");
            el.id = this.id;
            document.body.appendChild(el);
            el.addEventListener("click", function (ev) { return _this.hide(); });
            return this.element = el;
        }
    };
    TipManager.prototype.show = function (text, nearRect) {
        var tip = this.getElement();
        tip.innerText = text;
        tip.style.display = "inline-block";
        tip.style.top = (nearRect.top + window.pageYOffset).toString() + "px";
        tip.style.left = (nearRect.right + window.pageXOffset + 10).toString() + "px";
    };
    TipManager.prototype.hide = function () {
        if (this.isElementCreated()) {
            this.element.style.display = "none";
        }
    };
    return TipManager;
})();
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="handlers/unixtime.ts" />
/// <reference path="handlers/twogis.ts" />
/// <reference path="utils/promise.ts" />
/// <reference path="tipManager.ts" />
var handlers = [
    getDetectedUnixtime,
    getTwoGisObject
];
var tipManager = new TipManager("__chrome_extension_webapi_tools_tip");
function onSelectionChange() {
    var selection = window.getSelection();
    var selectedText = selection.toString();
    if (selection.rangeCount == 1 && selectedText.length > 0) {
        getResolvedPromises(handlers.map(function (_) { return _(selectedText); }))
            .then(function (tips) {
            if (tips.length) {
                tipManager.show(tips.join(","), selection.getRangeAt(0).getBoundingClientRect());
            }
            else {
                tipManager.hide();
            }
        }, tipManager.hide);
    }
    else {
        tipManager.hide();
    }
}
function isArrowKeyCode(keyCode) {
    return keyCode >= 37 && keyCode <= 40;
}
document.addEventListener("keyup", function (ev) {
    if (ev.shiftKey && isArrowKeyCode(ev.keyCode)) {
        onSelectionChange();
    }
});
document.addEventListener("mouseup", function (ev) {
    onSelectionChange();
});
