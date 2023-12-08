import 'tslib';
import { moveToPositionRestrictions, applyMove } from '../service/utils.js';
import '../types';
import '../state/setCoordinates.js';

function moveCoordinatesAlgorithm(coordinates, directions, positionRestrictions) {
    var movedCoordinates = applyMove(coordinates, directions);
    return positionRestrictions ? moveToPositionRestrictions(movedCoordinates, positionRestrictions) : movedCoordinates;
}

export { moveCoordinatesAlgorithm };
