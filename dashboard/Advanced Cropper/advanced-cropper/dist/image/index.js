import { __assign } from 'tslib';
import { isCrossOriginURL, isBlob, isLocal } from '../utils';
import { getTransformedImageSize, getCoefficient } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';

var XHR_DONE = 4;
function base64ToArrayBuffer(base64) {
    base64 = base64.replace(/^data:([^;]+);base64,/gim, '');
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}
function objectURLToBlob(url, callback) {
    var http = new XMLHttpRequest();
    http.open('GET', url, true);
    http.responseType = 'blob';
    http.onload = function () {
        if (this.status == 200 || this.status === 0) {
            callback(this.response);
        }
    };
    http.send();
}
function getTransforms(orientation) {
    var result = {
        flip: {
            horizontal: false,
            vertical: false,
        },
        rotate: 0,
    };
    if (orientation) {
        switch (orientation) {
            case 2:
                result.flip.horizontal = true;
                break;
            case 3:
                result.rotate = -180;
                break;
            case 4:
                result.flip.vertical = true;
                break;
            case 5:
                result.rotate = 90;
                result.flip.vertical = true;
                break;
            case 6:
                result.rotate = 90;
                break;
            case 7:
                result.rotate = 90;
                result.flip.horizontal = true;
                break;
            case 8:
                result.rotate = -90;
                break;
        }
    }
    return result;
}
function getImageData(img) {
    return new Promise(function (resolve, reject) {
        try {
            if (img) {
                if (/^data:/i.test(img)) {
                    // Data URL
                    resolve(base64ToArrayBuffer(img));
                }
                else if (/^blob:/i.test(img)) {
                    // Blob
                    var fileReader_1 = new FileReader();
                    fileReader_1.onload = function (e) {
                        var _a;
                        resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result);
                    };
                    objectURLToBlob(img, function (blob) {
                        fileReader_1.readAsArrayBuffer(blob);
                    });
                }
                else {
                    // Simple URL
                    var http_1 = new XMLHttpRequest();
                    http_1.onreadystatechange = function () {
                        if (http_1.readyState !== XHR_DONE)
                            return;
                        if (http_1.status === 200 || http_1.status === 0) {
                            resolve(http_1.response);
                        }
                        else {
                            reject('Warning: could not load an image to parse its orientation');
                        }
                    };
                    http_1.onprogress = function () {
                        // Abort the request directly if it not a JPEG image for better performance
                        if (http_1.getResponseHeader('content-type') !== 'image/jpeg') {
                            http_1.abort();
                        }
                    };
                    http_1.withCredentials = false;
                    http_1.open('GET', img, true);
                    http_1.responseType = 'arraybuffer';
                    http_1.send(null);
                }
            }
            else {
                reject('Error: the image is empty');
            }
        }
        catch (e) {
            reject(e);
        }
    });
}
function getStyleTransforms(_a) {
    var rotate = _a.rotate, flip = _a.flip, scale = _a.scale;
    var transform = '';
    transform += " rotate(" + rotate + "deg) ";
    transform += " scaleX(" + scale * (flip.horizontal ? -1 : 1) + ") ";
    transform += " scaleY(" + scale * (flip.vertical ? -1 : 1) + ") ";
    return transform;
}
function getStringFromCharCode(dataView, start, length) {
    var str = '';
    var i;
    for (i = start, length += start; i < length; i++) {
        str += String.fromCharCode(dataView.getUint8(i));
    }
    return str;
}
function resetAndGetOrientation(arrayBuffer) {
    try {
        var dataView = new DataView(arrayBuffer);
        var orientation_1;
        var exifIDCode = void 0;
        var tiffOffset = void 0;
        var littleEndian = void 0;
        var app1Start = void 0;
        var ifdStart = void 0;
        // Only handle JPEG image (start by 0xFFD8)
        if (dataView.getUint8(0) === 0xff && dataView.getUint8(1) === 0xd8) {
            var length_1 = dataView.byteLength;
            var offset = 2;
            while (offset + 1 < length_1) {
                if (dataView.getUint8(offset) === 0xff && dataView.getUint8(offset + 1) === 0xe1) {
                    app1Start = offset;
                    break;
                }
                offset++;
            }
        }
        if (app1Start) {
            exifIDCode = app1Start + 4;
            tiffOffset = app1Start + 10;
            if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
                var endianness = dataView.getUint16(tiffOffset);
                littleEndian = endianness === 0x4949;
                if (littleEndian || endianness === 0x4d4d /* bigEndian */) {
                    if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002a) {
                        var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
                        if (firstIFDOffset >= 0x00000008) {
                            ifdStart = tiffOffset + firstIFDOffset;
                        }
                    }
                }
            }
        }
        if (ifdStart) {
            var length_2 = dataView.getUint16(ifdStart, littleEndian);
            for (var i = 0; i < length_2; i++) {
                var offset = ifdStart + i * 12 + 2;
                if (dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */) {
                    // 8 is the offset of the current tag's value
                    offset += 8;
                    // Get the original orientation value
                    orientation_1 = dataView.getUint16(offset, littleEndian);
                    // Override the orientation with its default value
                    dataView.setUint16(offset, 1, littleEndian);
                    break;
                }
            }
        }
        return orientation_1;
    }
    catch (error) {
        return null;
    }
}
function arrayBufferToDataURL(arrayBuffer) {
    var chunks = [];
    // Chunk Typed Array for better performance
    var chunkSize = 8192;
    var uint8 = new Uint8Array(arrayBuffer);
    while (uint8.length > 0) {
        var value = uint8.subarray(0, chunkSize);
        chunks.push(String.fromCharCode.apply(null, (Array.from ? Array.from(value) : value.slice())));
        uint8 = uint8.subarray(chunkSize);
    }
    return "data:image/jpeg;base64," + btoa(chunks.join(''));
}
function getImage(_a) {
    var src = _a.src, _b = _a.arrayBuffer, arrayBuffer = _b === void 0 ? null : _b, _c = _a.orientation, orientation = _c === void 0 ? null : _c;
    var options = {
        src: src,
        arrayBuffer: arrayBuffer,
        revoke: false,
        transforms: {
            flip: {
                horizontal: false,
                vertical: false,
            },
            rotate: 0,
        },
    };
    if (arrayBuffer && orientation && orientation > 1) {
        if (isBlob(src) || !isLocal(src)) {
            options.src = URL.createObjectURL(new Blob([arrayBuffer]));
            options.revoke = true;
        }
        else {
            options.src = arrayBufferToDataURL(arrayBuffer);
        }
    }
    else {
        options.src = src;
    }
    if (orientation) {
        options.transforms = getTransforms(orientation);
    }
    return options;
}
function parseImage(src, settings) {
    if (settings === void 0) { settings = {}; }
    var checkOrientation = settings.checkOrientation, parse = settings.parse;
    return new Promise(function (resolve) {
        if (checkOrientation || parse) {
            getImageData(src)
                .then(function (data) {
                    var orientation = resetAndGetOrientation(data);
                    resolve(getImage(data
                        ? { src: src, arrayBuffer: data, orientation: orientation }
                        : { src: src, arrayBuffer: null, orientation: null }));
                })
                .catch(function (error) {
                    console.warn(error);
                    resolve(getImage({ src: src }));
                });
        }
        else {
            resolve(getImage({ src: src }));
        }
    });
}
function createImage(src, settings) {
    if (settings === void 0) { settings = {}; }
    return new Promise(function (resolve, reject) {
        var image = document.createElement('img');
        if (settings.crossOrigin) {
            image.crossOrigin = settings.crossOrigin !== true ? settings.crossOrigin : 'anonymous';
        }
        image.src = src;
        image.style.visibility = 'hidden';
        image.style.position = 'fixed';
        document.body.appendChild(image);
        if (image.complete) {
            resolve(image);
            document.body.removeChild(image);
        }
        else {
            image.addEventListener('load', function () {
                resolve(image);
                document.body.removeChild(image);
            });
            image.addEventListener('error', function () {
                reject(null);
                document.body.removeChild(image);
            });
        }
    });
}
function loadImage(src, settings) {
    if (settings === void 0) { settings = {}; }
    return parseImage(src, __assign(__assign({}, settings), { crossOrigin: isCrossOriginURL(src) && settings.crossOrigin })).then(function (options) {
        return new Promise(function (resolve, reject) {
            createImage(options.src, settings)
                .then(function (image) {
                    resolve(__assign(__assign({}, options), { width: image.naturalWidth, height: image.naturalHeight }));
                })
                .catch(function () {
                    reject(null);
                });
        });
    });
}
function getImageStyle(image, state, area, coefficient, transitions) {
    if (transitions === void 0) { transitions = null; }
    var optimalImageSize = image.width > image.height
        ? {
            width: Math.min(512, image.width),
            height: Math.min(512, image.width) / (image.width / image.height),
        }
        : {
            height: Math.min(512, image.height),
            width: Math.min(512, image.height) * (image.width / image.height),
        };
    var actualImageSize = getTransformedImageSize(state);
    var imageTransforms = {
        rotate: state.transforms.rotate,
        flip: {
            horizontal: state.transforms.flip.horizontal,
            vertical: state.transforms.flip.vertical,
        },
        translateX: area.left / coefficient,
        translateY: area.top / coefficient,
        scale: 1 / coefficient,
    };
    var compensations = {
        rotate: {
            left: (optimalImageSize.width - actualImageSize.width) / (2 * coefficient),
            top: (optimalImageSize.height - actualImageSize.height) / (2 * coefficient),
        },
        scale: {
            left: ((1 - 1 / coefficient) * optimalImageSize.width) / 2,
            top: ((1 - 1 / coefficient) * optimalImageSize.height) / 2,
        },
    };
    var transforms = __assign(__assign({}, imageTransforms), { scale: imageTransforms.scale * (image.width / optimalImageSize.width) });
    var result = {
        width: optimalImageSize.width + "px",
        height: optimalImageSize.height + "px",
        left: '0px',
        top: '0px',
        transition: 'none',
        transform: "translate3d(" + (-compensations.rotate.left - compensations.scale.left - imageTransforms.translateX) + "px, " + (-compensations.rotate.top - compensations.scale.top - imageTransforms.translateY) + "px, 0px)" + getStyleTransforms(transforms),
        willChange: 'none',
    };
    if (transitions && transitions.active) {
        result.willChange = 'transform';
        result.transition = transitions.duration + "ms " + transitions.timingFunction;
    }
    return result;
}
function getBackgroundStyle(image, state, transitions) {
    if (transitions === void 0) { transitions = null; }
    if (image && state && state.visibleArea) {
        return getImageStyle(image, state, state.visibleArea, getCoefficient(state), transitions);
    }
    else {
        return {};
    }
}
function getPreviewStyle(image, state, coefficient, transitions) {
    if (transitions === void 0) { transitions = null; }
    if (image && state && state.visibleArea && state.coordinates) {
        return getImageStyle(image, state, state.coordinates, coefficient, transitions);
    }
    else {
        return {};
    }
}

export { createImage, getBackgroundStyle, getImageStyle, getPreviewStyle, getStyleTransforms, loadImage };
