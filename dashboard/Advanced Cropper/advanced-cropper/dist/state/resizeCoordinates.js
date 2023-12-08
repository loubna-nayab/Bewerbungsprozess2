import { __assign } from 'tslib';
import { mergePositionRestrictions, coordinatesToPositionRestrictions } from '../service/utils.js';
import { getMinimumSize, getSizeRestrictions, isInitializedState, getPositionRestrictions, getAspectRatio } from '../service/helpers.js';
import { copyState } from './copyState.js';
import '../types';
import './setCoordinates.js';
import { resizeCoordinatesAlgorithm } from '../algorithms/resizeCoordinatesAlgorithm.js';

function resizeCoordinates(state, settings, directions, options) {
    var minimumSize = getMinimumSize(state);
    var sizeRestrictions = getSizeRestrictions(state, settings);
    return isInitializedState(state)
        ? __assign(__assign({}, copyState(state)), { coordinates: resizeCoordinatesAlgorithm(state.coordinates, directions, options, {
                positionRestrictions: mergePositionRestrictions(getPositionRestrictions(state, settings), coordinatesToPositionRestrictions(state.visibleArea)),
                sizeRestrictions: {
                    maxWidth: Math.min(sizeRestrictions.maxWidth, state.visibleArea.width),
                    maxHeight: Math.min(sizeRestrictions.maxHeight, state.visibleArea.height),
                    minWidth: Math.max(Math.min(sizeRestrictions.minWidth, state.visibleArea.width), minimumSize),
                    minHeight: Math.max(Math.min(sizeRestrictions.minHeight, state.visibleArea.height), minimumSize),
                },
                aspectRatio: getAspectRatio(state, settings),
            }) }) : state;
}

export { resizeCoordinates };
