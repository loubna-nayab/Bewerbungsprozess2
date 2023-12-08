function getDirectionNames(hDirection, vDirection) {
    var camelCase, snakeCase;
    if (hDirection && vDirection) {
        camelCase = "" + hDirection + vDirection[0].toUpperCase() + vDirection.slice(1);
        snakeCase = hDirection + "-" + vDirection;
    }
    else {
        camelCase = hDirection || vDirection;
        snakeCase = hDirection || vDirection;
    }
    return { camelCase: camelCase, snakeCase: snakeCase };
}
function isBlob(url) {
    return /^blob:/.test(url);
}
function isDataUrl(url) {
    return /^data:/.test(url);
}
function isLocal(url) {
    return isBlob(url) || isDataUrl(url);
}
function isCrossOriginURL(url) {
    if (isLocal(url)) {
        return false;
    }
    var pageLocation = window.location;
    var URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/;
    var urlMatch = URL_HOST_PATTERN.exec(url) || [];
    var urlparts = {
        protocol: urlMatch[1] || '',
        host: urlMatch[2] || '',
        port: urlMatch[3] || '',
    };
    var defaultPort = function (protocol) {
        if (protocol === 'http') {
            return 80;
        }
        else {
            return 433;
        }
    };
    var portOf = function (location) {
        return location.port || defaultPort((location.protocol || pageLocation.protocol));
    };
    return !((!urlparts.protocol && !urlparts.host && !urlparts.port) ||
        Boolean(urlparts.protocol &&
            urlparts.protocol == pageLocation.protocol &&
            urlparts.host &&
            urlparts.host == pageLocation.host &&
            urlparts.host &&
            portOf(urlparts) == portOf(pageLocation)));
}
function isArray(value) {
    return Array.isArray(value);
}
function isFunction(value) {
    return typeof value === 'function';
}
function isUndefined(obj) {
    return obj === undefined;
}
var isObject = function (term) {
    return term !== null && typeof term === 'object';
};
// TODO: add the typing
function getOptions(options, defaultScheme, falseScheme) {
    if (falseScheme === void 0) { falseScheme = {}; }
    var result = {};
    if (isObject(options)) {
        Object.keys(defaultScheme).forEach(function (key) {
            if (isUndefined(options[key])) {
                result[key] = defaultScheme[key];
            }
            else if (isObject(defaultScheme[key])) {
                if (isObject(options[key])) {
                    result[key] = getOptions(options[key], defaultScheme[key], falseScheme[key]);
                }
                else {
                    result[key] = options[key] ? defaultScheme[key] : falseScheme[key];
                }
            }
            else if (defaultScheme[key] === true || defaultScheme[key] === false) {
                result[key] = Boolean(options[key]);
            }
            else {
                result[key] = options[key];
            }
        });
        return result;
    }
    else {
        if (options) {
            return defaultScheme;
        }
        else {
            return falseScheme;
        }
    }
}
function parseNumber(number) {
    var parsedNumber = Number(number);
    if (Number.isNaN(parsedNumber)) {
        return number;
    }
    else {
        return parsedNumber;
    }
}
function isNumber(value) {
    return typeof value === 'number';
}
function isString(value) {
    return typeof value === 'string';
}
function isNaN(value) {
    return value !== value;
}
function isNumeric(value) {
    return ((isNumber(value) && !isNaN(value)) ||
        (isString(value) && !Number.isNaN(parseFloat(value)) && isFinite(parseFloat(value))));
}
function distance(firstPoint, secondPoint) {
    return Math.sqrt(Math.pow(firstPoint.left - secondPoint.left, 2) + Math.pow(firstPoint.top - secondPoint.top, 2));
}
function isRoughlyEqual(a, b, tolerance) {
    if (tolerance === void 0) { tolerance = 1e-3; }
    return Math.abs(b - a) < tolerance;
}
function isGreater(a, b, tolerance) {
    return isRoughlyEqual(a, b, tolerance) ? false : a > b;
}
function isLower(a, b, tolerance) {
    return isRoughlyEqual(a, b, tolerance) ? false : a < b;
}
function isArrayBufferLike(value) {
    return value instanceof ArrayBuffer;
}
function getCloserAngle(reference, angle) {
    var turnsCount = Math.floor(reference / 360);
    var firstCandidate = turnsCount * 360 + angle;
    var secondCandidate = (turnsCount + 1) * 360 + angle;
    if (Math.abs(firstCandidate - reference) < Math.abs(secondCandidate - reference)) {
        return firstCandidate;
    }
    else {
        return secondCandidate;
    }
}
function sign(value) {
    var number = +value;
    if (number === 0 || isNaN(number)) {
        return number;
    }
    return number > 0 ? 1 : -1;
}
function promiseTimeout(timeout) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, timeout);
    });
}
// Not performant, small function to reduce the code amount
function deepClone(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var result = {};
    if (Array.isArray(obj)) {
        result = obj.map(function (item) { return deepClone(item); });
    }
    else {
        Object.keys(obj).forEach(function (key) {
            return (result[key] = deepClone(obj[key]));
        });
    }
    return result;
}
function deepCompare(a, b, tolerance) {
    if (tolerance === void 0) { tolerance = 1e-3; }
    if (isNumber(a) && isNumber(b) && isRoughlyEqual(a, b, tolerance))
        return true;
    if (a === b)
        return true;
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor)
            return false;
        var length_1, i = void 0;
        if (Array.isArray(a)) {
            length_1 = a.length;
            if (length_1 != b.length)
                return false;
            for (i = length_1; i-- !== 0;)
                if (!deepCompare(a[i], b[i], tolerance))
                    return false;
            return true;
        }
        if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
        var keys = Object.keys(a);
        length_1 = keys.length;
        if (length_1 !== Object.keys(b).length)
            return false;
        for (i = length_1; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
                return false;
        for (i = length_1; i-- !== 0;) {
            var key = keys[i];
            if (!deepCompare(a[key], b[key], tolerance))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
function isWheelEvent(event) {
    return 'deltaX' in event;
}
function isTouchEvent(event) {
    return 'touches' in event;
}
function isMouseEvent(event) {
    return 'buttons' in event;
}
function emptyCoordinates() {
    return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    };
}
function isCardinalDirection(value) {
    return value === 'west' || value === 'south' || value === 'north' || value === 'east';
}
function isOrdinalDirection(value) {
    return (isCardinalDirection(value) ||
        value === 'westNorth' ||
        value === 'westSouth' ||
        value === 'eastNorth' ||
        value === 'eastSouth');
}
function debounce(callback, delay) {
    var timestamp;
    var timeout;
    function later() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var last = Date.now() - timestamp;
        var delayValue = isFunction(delay) ? delay() : delay || 0;
        if (last < delayValue && last >= 0) {
            timeout = setTimeout(function () { return later.apply(void 0, args); }, delayValue - last);
        }
        else {
            callback.apply(void 0, args);
        }
    }
    function result() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        timestamp = Date.now();
        timeout = setTimeout(function () { return later.apply(void 0, args); }, isFunction(delay) ? delay() : delay || 0);
    }
    result.clear = function () {
        clearTimeout(timeout);
    };
    return result;
}

export { debounce, deepClone, deepCompare, distance, emptyCoordinates, getCloserAngle, getDirectionNames, getOptions, isArray, isArrayBufferLike, isBlob, isCardinalDirection, isCrossOriginURL, isDataUrl, isFunction, isGreater, isLocal, isLower, isMouseEvent, isNaN, isNumber, isNumeric, isObject, isOrdinalDirection, isRoughlyEqual, isString, isTouchEvent, isUndefined, isWheelEvent, parseNumber, promiseTimeout, sign };
