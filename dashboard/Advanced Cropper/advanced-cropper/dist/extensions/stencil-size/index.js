import { __assign } from 'tslib';
import { isFunction } from '../../utils';
import { aspectRatioIntersection, createAspectRatio, ratio, applyScale, fitToSizeRestrictions, applyMove, diff, getCenter, moveToPositionRestrictions, mergePositionRestrictions, coordinatesToPositionRestrictions } from '../../service/utils.js';
import { getAreaSizeRestrictions, getSizeRestrictions, getAspectRatio, isInitializedState, getAreaPositionRestrictions } from '../../service/helpers.js';
import { copyState } from '../../state/copyState.js';
import '../../types';
import '../../state/setCoordinates.js';
import { approximateSize } from '../../service/approximateSize.js';
import { defaultStencilConstraints } from '../../defaults/defaultStencilConstraints.js';

function fixedStencilConstraints(rawSettings, stencilOptions) {
    var defaultConstraints = defaultStencilConstraints({}, stencilOptions);
    return {
        stencilSize: function (state, settings) {
            var previousSize = isFunction(rawSettings.stencilSize)
                ? rawSettings.stencilSize(state, settings)
                : rawSettings.stencilSize;
            return approximateSize(__assign(__assign({}, previousSize), { aspectRatio: aspectRatioIntersection(defaultConstraints.aspectRatio, createAspectRatio(ratio(previousSize))) }));
        },
    };
}
function getStencilSize(state, settings) {
    var boundary = state.boundary;
    var size = isFunction(settings.stencilSize) ? settings.stencilSize(state, settings) : settings.stencilSize;
    if (size.width > boundary.width || size.height > boundary.height) {
        size = approximateSize({
            sizeRestrictions: {
                maxWidth: boundary.width,
                maxHeight: boundary.height,
                minWidth: 0,
                minHeight: 0,
            },
            width: size.width,
            height: size.height,
            aspectRatio: {
                minimum: ratio(size),
                maximum: ratio(size),
            },
        });
    }
    return size;
}
function sizeRestrictions(state, settings) {
    var stencilSize = getStencilSize(state, __assign(__assign({}, settings), { stencilSize: settings.stencilSize }));
    var areaRestrictions = getAreaSizeRestrictions(state, settings);
    return {
        maxWidth: (areaRestrictions.maxWidth * stencilSize.width) / state.boundary.width,
        maxHeight: (areaRestrictions.maxHeight * stencilSize.height) / state.boundary.height,
        minWidth: 0,
        minHeight: 0,
    };
}
function defaultSize(state, settings) {
    var imageSize = state.imageSize, visibleArea = state.visibleArea, boundary = state.boundary;
    var sizeRestrictions = getSizeRestrictions(state, settings);
    var aspectRatio = getAspectRatio(state, settings);
    var stencilSize = isFunction(settings.stencilSize) ? settings.stencilSize(state, settings) : settings.stencilSize;
    var area = (visibleArea || imageSize);
    var height, width;
    if (ratio(area) > ratio(boundary)) {
        height = (stencilSize.height * area.height) / boundary.height;
        width = height * ratio(stencilSize);
    }
    else {
        width = (stencilSize.width * area.width) / boundary.width;
        height = width / ratio(stencilSize);
    }
    return approximateSize({
        width: width,
        height: height,
        aspectRatio: aspectRatio,
        sizeRestrictions: sizeRestrictions,
    });
}
function aspectRatio(state, settings) {
    var value = ratio(getStencilSize(state, settings));
    return {
        minimum: value,
        maximum: value,
    };
}
function fixedStencilAlgorithm(state, settings) {
    if (isInitializedState(state)) {
        var result = copyState(state);
        var stencil = getStencilSize(state, settings);
        // First of all try to resize visible area as much as possible:
        result.visibleArea = applyScale(result.visibleArea, (result.coordinates.width * result.boundary.width) / (result.visibleArea.width * stencil.width));
        // Check that visible area doesn't break the area restrictions:
        var scale = fitToSizeRestrictions(result.visibleArea, getAreaSizeRestrictions(result, settings));
        if (scale !== 1) {
            result.visibleArea = applyScale(result.visibleArea, scale);
            result.coordinates = applyScale(result.coordinates, scale);
        }
        result.visibleArea = applyMove(result.visibleArea, diff(getCenter(result.coordinates), getCenter(result.visibleArea)));
        // Center stencil in visible area:
        result.visibleArea = moveToPositionRestrictions(result.visibleArea, getAreaPositionRestrictions(result, settings));
        result.coordinates = moveToPositionRestrictions(result.coordinates, mergePositionRestrictions(coordinatesToPositionRestrictions(result.visibleArea), getAreaPositionRestrictions(result, settings)));
        return result;
    }
    return state;
}
function fixedStencil(state, settings, action) {
    if (action && action.immediately) {
        return fixedStencilAlgorithm(state, settings);
    }
    return state;
}

export { aspectRatio, defaultSize, fixedStencil, fixedStencilAlgorithm, fixedStencilConstraints, getStencilSize, sizeRestrictions };
