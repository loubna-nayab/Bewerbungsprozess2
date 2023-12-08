import { __assign } from 'tslib';
import { emptyCoordinates, isUndefined } from '../utils';
import { mergePositionRestrictions, coordinatesToPositionRestrictions, applyScale, maxScale, applyMove, inverseMove, fitToPositionRestrictions } from '../service/utils.js';
import { getAspectRatio, getSizeRestrictions, getPositionRestrictions, getAreaSizeRestrictions } from '../service/helpers.js';
import { copyState } from './copyState.js';
import '../types';
import { approximateSize } from '../service/approximateSize.js';
import { fitVisibleArea } from '../service/fitvisibleArea.js';
import { moveCoordinatesAlgorithm } from '../algorithms/moveCoordinatesAlgorithm.js';

var SetCoordinatesMode;
(function (SetCoordinatesMode) {
    SetCoordinatesMode["limit"] = "limit";
    SetCoordinatesMode["zoom"] = "zoom";
    SetCoordinatesMode["unsafe"] = "unsafe";
})(SetCoordinatesMode || (SetCoordinatesMode = {}));
function setCoordinates(state, settings, transform,
                        // If you set mode to `false`, the coordinates can leave the visible area
                        mode) {
    if (mode === void 0) { mode = true; }
    var currentMode = mode === false ? SetCoordinatesMode.unsafe : mode === true ? SetCoordinatesMode.zoom : mode;
    var aspectRatio = getAspectRatio(state, settings);
    var sizeRestrictions = getSizeRestrictions(state, settings);
    if (state.visibleArea && currentMode === SetCoordinatesMode.limit) {
        sizeRestrictions = __assign(__assign({}, sizeRestrictions), { minWidth: Math.min(state.visibleArea.width, sizeRestrictions.minWidth), minHeight: Math.min(state.visibleArea.height, sizeRestrictions.minHeight), maxWidth: Math.min(state.visibleArea.width, sizeRestrictions.maxWidth), maxHeight: Math.min(state.visibleArea.height, sizeRestrictions.maxHeight) });
    }
    var positionRestrictions = getPositionRestrictions(state, settings);
    if (state.visibleArea && currentMode === SetCoordinatesMode.limit) {
        positionRestrictions = mergePositionRestrictions(positionRestrictions, coordinatesToPositionRestrictions(state.visibleArea));
    }
    var move = function (prevCoordinates, newCoordinates) {
        return moveCoordinatesAlgorithm(prevCoordinates, {
            left: newCoordinates.left - (prevCoordinates.left || 0),
            top: newCoordinates.top - (prevCoordinates.top || 0),
        }, positionRestrictions);
    };
    var resize = function (prevCoordinates, newCoordinates) {
        var coordinates = __assign(__assign(__assign({}, prevCoordinates), approximateSize({
            width: newCoordinates.width,
            height: newCoordinates.height,
            sizeRestrictions: sizeRestrictions,
            aspectRatio: aspectRatio,
        })), { left: 0, top: 0 });
        return move(coordinates, {
            left: prevCoordinates.left || 0,
            top: prevCoordinates.top || 0,
        });
    };
    var coordinates = state.coordinates ? __assign({}, state.coordinates) : emptyCoordinates();
    var transforms = Array.isArray(transform) ? transform : [transform];
    transforms.forEach(function (transform) {
        var changes;
        if (typeof transform === 'function') {
            changes = transform(__assign(__assign({}, state), { coordinates: coordinates }), settings);
        }
        else {
            changes = transform;
        }
        if (changes) {
            if (!isUndefined(changes.width) || !isUndefined(changes.height)) {
                coordinates = resize(coordinates, __assign(__assign({}, coordinates), changes));
            }
            if (!isUndefined(changes.left) || !isUndefined(changes.top)) {
                coordinates = move(coordinates, __assign(__assign({}, coordinates), changes));
            }
        }
    });
    var result = __assign(__assign({}, copyState(state)), { coordinates: coordinates });
    if (result.visibleArea && currentMode === SetCoordinatesMode.zoom) {
        var widthIntersections = Math.max(0, result.coordinates.width - result.visibleArea.width);
        var heightIntersections = Math.max(0, result.coordinates.height - result.visibleArea.height);
        var areaSizeRestrictions = getAreaSizeRestrictions(state, settings);
        var scale = widthIntersections > heightIntersections
            ? result.coordinates.width / result.visibleArea.width
            : result.coordinates.height / result.visibleArea.height;
        if (scale > 1) {
            result.visibleArea = applyScale(result.visibleArea, Math.min(scale, maxScale(result.visibleArea, areaSizeRestrictions)));
        }
        result.visibleArea = applyMove(result.visibleArea, inverseMove(fitToPositionRestrictions(result.coordinates, coordinatesToPositionRestrictions(result.visibleArea))));
        return fitVisibleArea(result, settings);
    }
    else {
        return result;
    }
}

export { SetCoordinatesMode, setCoordinates };
