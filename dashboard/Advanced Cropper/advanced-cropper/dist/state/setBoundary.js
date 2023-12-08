import { __assign } from 'tslib';
import { ratio, applyScale, resizeToSizeRestrictions, inverseMove, fitToPositionRestrictions, coordinatesToPositionRestrictions, applyMove, moveToPositionRestrictions } from '../service/utils.js';
import { getSizeRestrictions, getAreaSizeRestrictions, getAreaPositionRestrictions } from '../service/helpers.js';
import { copyState } from './copyState.js';
import '../types';
import './setCoordinates.js';
import { fitCoordinates } from '../service/fitCoordinates.js';

function setBoundary(state, settings, boundary) {
    var result = __assign(__assign({}, copyState(state)), { boundary: boundary });
    if (result.visibleArea && result.coordinates && state.visibleArea) {
        // Scale visible area size to fit new boundary:
        result.visibleArea.height = result.visibleArea.width / ratio(boundary);
        result.visibleArea.top += (state.visibleArea.height - result.visibleArea.height) / 2;
        // Scale visible area to prevent overlap coordinates (and its minimum size)
        var sizeRestrictions = getSizeRestrictions(result, settings);
        if (Math.max(sizeRestrictions.minHeight, result.coordinates.height) - result.visibleArea.height > 0 ||
            Math.max(sizeRestrictions.minWidth, result.coordinates.width) - result.visibleArea.width > 0) {
            result.visibleArea = applyScale(result.visibleArea, Math.max(Math.max(sizeRestrictions.minHeight, result.coordinates.height) / result.visibleArea.height, Math.max(sizeRestrictions.minWidth, result.coordinates.width) / result.visibleArea.width));
        }
        // Scale visible area to prevent overlap area restrictions
        result.visibleArea = resizeToSizeRestrictions(result.visibleArea, getAreaSizeRestrictions(result, settings));
        // Move visible are to prevent moving of the coordinates:
        var move = inverseMove(fitToPositionRestrictions(result.coordinates, coordinatesToPositionRestrictions(result.visibleArea)));
        if (result.visibleArea.width < result.coordinates.width) {
            move.left = 0;
        }
        if (result.visibleArea.height < result.coordinates.height) {
            move.top = 0;
        }
        result.visibleArea = applyMove(result.visibleArea, move);
        // Move visible area to prevent overlap the area restrictions
        result.visibleArea = moveToPositionRestrictions(result.visibleArea, getAreaPositionRestrictions(result, settings));
        result = fitCoordinates(result, settings);
    }
    return result;
}

export { setBoundary };
