import { __assign } from 'tslib';
import { getBrokenRatio, ratio, applyMove, diff, getCenter, moveToPositionRestrictions, mergePositionRestrictions, coordinatesToPositionRestrictions } from '../service/utils.js';
import { mergeSizeRestrictions } from '../advanced-cropper/dist/service/sizeRestrictions.js';
import { isInitializedState, getAspectRatio, getSizeRestrictions, getAreaSizeRestrictions, getAreaPositionRestrictions, getPositionRestrictions } from '../service/helpers.js';
import { copyState } from './copyState.js';
import '../types';
import './setCoordinates.js';
import { approximateSize } from '../service/approximateSize.js';

function reconcileState(state, settings) {
    if (isInitializedState(state)) {
        var result = copyState(state);
        var aspectRatio = getAspectRatio(state, settings);
        var sizeRestrictions = getSizeRestrictions(state, settings);
        var areaSizeRestrictions = getAreaSizeRestrictions(state, settings);
        // Fit the size of coordinates to existing size restrictions and visible area
        var brokenRatio = getBrokenRatio(ratio(state.coordinates), aspectRatio);
        var desiredSize = brokenRatio
            ? {
                height: state.coordinates.height,
                width: state.coordinates.height * brokenRatio,
            }
            : state.coordinates;
        result.coordinates = __assign(__assign({}, result.coordinates), approximateSize({
            width: desiredSize.width,
            height: desiredSize.height,
            aspectRatio: aspectRatio,
            sizeRestrictions: mergeSizeRestrictions(areaSizeRestrictions, sizeRestrictions),
        }));
        // Return the coordinates to the previous center
        result.coordinates = applyMove(result.coordinates, diff(getCenter(state.coordinates), getCenter(result.coordinates)));
        var scaleModifier = Math.max(result.coordinates.width / result.visibleArea.width, result.coordinates.height / result.visibleArea.height, 1);
        // Fit the visible area to its size restrictions and boundary aspect ratio:
        result.visibleArea = __assign(__assign({}, state.visibleArea), approximateSize({
            width: state.visibleArea.width * scaleModifier,
            height: state.visibleArea.height * scaleModifier,
            aspectRatio: {
                minimum: ratio(result.boundary),
                maximum: ratio(result.boundary),
            },
            sizeRestrictions: areaSizeRestrictions,
        }));
        // Return the visible area to previous center
        result.visibleArea = applyMove(result.visibleArea, diff(getCenter(state.visibleArea), getCenter(result.visibleArea)));
        // Fit the visible area to positions restrictions
        result.visibleArea = moveToPositionRestrictions(result.visibleArea, getAreaPositionRestrictions(result, settings));
        // Fit the coordinates to position restrictions and visible area
        result.coordinates = moveToPositionRestrictions(result.coordinates, mergePositionRestrictions(coordinatesToPositionRestrictions(result.visibleArea), getPositionRestrictions(result, settings)));
        return result;
    }
    return state;
}

export { reconcileState };
