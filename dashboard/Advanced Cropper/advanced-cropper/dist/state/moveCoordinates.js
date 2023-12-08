import 'tslib';
import { applyMove, moveToPositionRestrictions, mergePositionRestrictions, coordinatesToPositionRestrictions } from '../service/utils.js';
import { isInitializedState, getPositionRestrictions } from '../service/helpers.js';
import { copyState } from './copyState.js';
import '../types';
import './setCoordinates.js';

function moveCoordinates(state, settings, directions) {
    if (isInitializedState(state)) {
        var result = copyState(state);
        result.coordinates = applyMove(result.coordinates, directions);
        result.coordinates = moveToPositionRestrictions(result.coordinates, mergePositionRestrictions(coordinatesToPositionRestrictions(result.visibleArea), getPositionRestrictions(result, settings)));
        return result;
    }
    return state;
}

export { moveCoordinates };
