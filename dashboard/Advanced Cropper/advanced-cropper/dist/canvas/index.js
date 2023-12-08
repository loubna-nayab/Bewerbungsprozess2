import { __assign } from 'tslib';
import { isNumeric } from '../utils';
import { rotateSize, rotatePoint, getCenter } from '../service/utils.js';
import { isInitializedState } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';
import { approximateSize } from '../service/approximateSize.js';

function prepareSource(canvas, image, _a) {
    var rotate = _a.rotate, flip = _a.flip;
    var originalSize = {
        width: 'naturalWidth' in image ? image.naturalWidth : image.width,
        height: 'naturalHeight' in image ? image.naturalHeight : image.height,
    };
    var transformedSize = rotateSize(originalSize, rotate);
    var ctx = canvas.getContext('2d');
    canvas.height = transformedSize.height;
    canvas.width = transformedSize.width;
    if (ctx) {
        ctx.save();
        // Rotation:
        var canvasCenter = rotatePoint(getCenter(__assign({ left: 0, top: 0 }, originalSize)), rotate);
        ctx.translate(-(canvasCenter.left - transformedSize.width / 2), -(canvasCenter.top - transformedSize.height / 2));
        ctx.rotate((rotate * Math.PI) / 180);
        // Reflection;
        ctx.translate(flip.horizontal ? originalSize.width : 0, flip.vertical ? originalSize.height : 0);
        ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
        ctx.drawImage(image, 0, 0, originalSize.width, originalSize.height);
        ctx.restore();
    }
    return canvas;
}
function updateCanvas(canvas, source, coordinates, resultSize, options) {
    canvas.width = resultSize ? resultSize.width : coordinates.width;
    canvas.height = resultSize ? resultSize.height : coordinates.height;
    var ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (options) {
            if (options.imageSmoothingEnabled) {
                ctx.imageSmoothingEnabled = options.imageSmoothingEnabled;
            }
            if (options.imageSmoothingQuality) {
                ctx.imageSmoothingQuality = options.imageSmoothingQuality;
            }
            if (options.fillColor) {
                ctx.fillStyle = options.fillColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.save();
            }
        }
        ctx.drawImage(source, coordinates.left, coordinates.top, coordinates.width, coordinates.height, 0, 0, canvas.width, canvas.height);
    }
    return canvas;
}
function drawCroppedArea(state, image, resultCanvas, spareCanvas, options) {
    if (isInitializedState(state)) {
        var transforms = state.transforms, coordinates = state.coordinates;
        var imageTransformed = transforms.rotate !== 0 || transforms.flip.horizontal || transforms.flip.vertical;
        var source = imageTransformed ? prepareSource(spareCanvas, image, transforms) : image;
        var params = __assign({ minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity, maxArea: Infinity, imageSmoothingEnabled: true, imageSmoothingQuality: 'high', fillColor: 'transparent' }, options);
        var firstNumeric = function (array) { return array.find(function (el) { return isNumeric(el); }); };
        var size = approximateSize({
            sizeRestrictions: {
                minWidth: firstNumeric([params.width, params.minWidth]) || 0,
                minHeight: firstNumeric([params.height, params.minHeight]) || 0,
                maxWidth: firstNumeric([params.width, params.maxWidth]) || Infinity,
                maxHeight: firstNumeric([params.height, params.maxHeight]) || Infinity,
            },
            width: coordinates.width,
            height: coordinates.height,
            aspectRatio: {
                minimum: coordinates.width / coordinates.height,
                maximum: coordinates.width / coordinates.height,
            },
        });
        if (params.maxArea && size.width * size.height > params.maxArea) {
            var scale = Math.sqrt(params.maxArea / (size.width * size.height));
            size = {
                width: Math.round(scale * size.width),
                height: Math.round(scale * size.height),
            };
        }
        return updateCanvas(resultCanvas, source, coordinates, size, params);
    }
    else {
        return null;
    }
}

export { drawCroppedArea, prepareSource, updateCanvas };
