import { isFunction, emptyCoordinates } from '../utils';
import { createAspectRatio, rotateSize, moveToPositionRestrictions, getBrokenRatio, ratio, isConsistentSize, isConsistentPosition } from './utils.js';
import { calculateAreaSizeRestrictions, calculateSizeRestrictions } from './sizeRestrictions.js';

function isInitializedState(state) {
    return Boolean(state && state.visibleArea && state.coordinates);
}
function getAreaSizeRestrictions(state, settings) {
    return calculateAreaSizeRestrictions(state, settings);
}
function getAreaPositionRestrictions(state, settings) {
    return isFunction(settings.areaPositionRestrictions)
        ? settings.areaPositionRestrictions(state, settings)
        : settings.areaPositionRestrictions;
}
function getSizeRestrictions(state, settings) {
    return calculateSizeRestrictions(state, settings);
}
function getPositionRestrictions(state, settings) {
    return isFunction(settings.positionRestrictions)
        ? settings.positionRestrictions(state, settings)
        : settings.positionRestrictions;
}
function getCoefficient(state) {
    return state.visibleArea ? state.visibleArea.width / state.boundary.width : 0;
}
function getStencilCoordinates(state) {
    if (isInitializedState(state)) {
        var _a = state.coordinates, width = _a.width, height = _a.height, left = _a.left, top_1 = _a.top;
        var coefficient = getCoefficient(state);
        return {
            width: width / coefficient,
            height: height / coefficient,
            left: (left - state.visibleArea.left) / coefficient,
            top: (top_1 - state.visibleArea.top) / coefficient,
        };
    }
    else {
        return emptyCoordinates();
    }
}
function getAspectRatio(state, settings) {
    return createAspectRatio(isFunction(settings.aspectRatio) ? settings.aspectRatio(state, settings) : settings.aspectRatio);
}
function getDefaultCoordinates(state, settings) {
    return isFunction(settings.defaultCoordinates)
        ? settings.defaultCoordinates(state, settings)
        : settings.defaultCoordinates;
}
function getDefaultVisibleArea(state, settings) {
    return isFunction(settings.defaultVisibleArea)
        ? settings.defaultVisibleArea(state, settings)
        : settings.defaultVisibleArea;
}
function getTransformedImageSize(state) {
    if (state.imageSize && state.imageSize.width && state.imageSize.height) {
        return rotateSize(state.imageSize, state.transforms.rotate);
    }
    else {
        return {
            width: 0,
            height: 0,
        };
    }
}
function getMinimumSize(state) {
    // The magic number is the approximation of the handler size
    // Temporary solution that should be improved in the future
    return state.coordinates
        ? Math.min(state.coordinates.width, state.coordinates.height, 20 * getCoefficient(state))
        : 1;
}
function getRoundedCoordinates(state, settings) {
    if (isInitializedState(state)) {
        var sizeRestrictions = getSizeRestrictions(state, settings);
        var positionRestrictions = getPositionRestrictions(state, settings);
        var roundCoordinates = {
            width: Math.round(state.coordinates.width),
            height: Math.round(state.coordinates.height),
            left: Math.round(state.coordinates.left),
            top: Math.round(state.coordinates.top),
        };
        if (roundCoordinates.width > sizeRestrictions.maxWidth) {
            roundCoordinates.width = Math.floor(state.coordinates.width);
        }
        else if (roundCoordinates.width < sizeRestrictions.minWidth) {
            roundCoordinates.width = Math.ceil(state.coordinates.width);
        }
        if (roundCoordinates.height > sizeRestrictions.maxHeight) {
            roundCoordinates.height = Math.floor(state.coordinates.height);
        }
        else if (roundCoordinates.height < sizeRestrictions.minHeight) {
            roundCoordinates.height = Math.ceil(state.coordinates.height);
        }
        return moveToPositionRestrictions(roundCoordinates, positionRestrictions);
    }
    else {
        return null;
    }
}
function isConsistentState(state, settings) {
    if (isInitializedState(state)) {
        return (!getBrokenRatio(ratio(state.coordinates), getAspectRatio(state, settings)) &&
            isConsistentSize(state.visibleArea, getAreaSizeRestrictions(state, settings)) &&
            isConsistentSize(state.coordinates, getSizeRestrictions(state, settings)) &&
            isConsistentPosition(state.visibleArea, getAreaPositionRestrictions(state, settings)) &&
            isConsistentPosition(state.coordinates, getPositionRestrictions(state, settings)));
    }
    else {
        return true;
    }
}

export { getAreaPositionRestrictions, getAreaSizeRestrictions, getAspectRatio, getCoefficient, getDefaultCoordinates, getDefaultVisibleArea, getMinimumSize, getPositionRestrictions, getRoundedCoordinates, getSizeRestrictions, getStencilCoordinates, getTransformedImageSize, isConsistentState, isInitializedState };
