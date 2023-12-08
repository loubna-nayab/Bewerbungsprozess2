import { __assign } from 'tslib';
import { ratio, applyMove, diff, getCenter, moveToPositionRestrictions } from './utils.js';
import { getAreaSizeRestrictions, getAreaPositionRestrictions } from './helpers.js';
import { copyState } from '../state/copyState.js';
import '../types';
import '../state/setCoordinates.js';
import { approximateSize } from './approximateSize.js';

function fitVisibleArea(state, settings) {
    var result = copyState(state);
    if (state.visibleArea) {
        var areaSizeRestrictions = getAreaSizeRestrictions(state, settings);
        // Fit the visible area to its size restrictions and boundary aspect ratio:
        result.visibleArea = __assign(__assign({}, state.visibleArea), approximateSize({
            width: state.visibleArea.width,
            height: state.visibleArea.height,
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
    }
    return result;
}

export { fitVisibleArea };
