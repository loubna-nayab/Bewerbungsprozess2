import { __assign } from 'tslib';
import { applyMove, diff, getCenter, moveToPositionRestrictions, mergePositionRestrictions, coordinatesToPositionRestrictions } from './utils.js';
import { getAspectRatio, getSizeRestrictions, getPositionRestrictions } from './helpers.js';
import { copyState } from '../state/copyState.js';
import '../types';
import '../state/setCoordinates.js';
import { approximateSize } from './approximateSize.js';

function fitCoordinates(state, settings) {
    if (state.coordinates) {
        var result = copyState(state);
        var aspectRatio = getAspectRatio(state, settings);
        var sizeRestrictions = getSizeRestrictions(state, settings);
        // Fit the size of coordinates to existing size restrictions and visible area
        result.coordinates = __assign(__assign({}, state.coordinates), approximateSize({
            width: state.coordinates.width,
            height: state.coordinates.height,
            aspectRatio: aspectRatio,
            sizeRestrictions: state.visibleArea
                ? {
                    maxWidth: Math.min(state.visibleArea.width, sizeRestrictions.maxWidth),
                    maxHeight: Math.min(state.visibleArea.height, sizeRestrictions.maxHeight),
                    minHeight: Math.min(state.visibleArea.height, sizeRestrictions.minHeight),
                    minWidth: Math.min(state.visibleArea.width, sizeRestrictions.minWidth),
                }
                : sizeRestrictions,
        }));
        // Return the coordinates to the previous center
        result.coordinates = applyMove(result.coordinates, diff(getCenter(state.coordinates), getCenter(result.coordinates)));
        // Fit the coordinates to position restrictions and visible area
        result.coordinates = moveToPositionRestrictions(result.coordinates, state.visibleArea
            ? mergePositionRestrictions(coordinatesToPositionRestrictions(state.visibleArea), getPositionRestrictions(result, settings))
            : getPositionRestrictions(result, settings));
        return result;
    }
    return state;
}

export { fitCoordinates };
