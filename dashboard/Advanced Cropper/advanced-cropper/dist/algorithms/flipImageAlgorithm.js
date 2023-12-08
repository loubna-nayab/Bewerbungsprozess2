import 'tslib';
import { rotatePoint, getCenter, applyMove, diff, moveToPositionRestrictions } from '../service/utils.js';
import { isInitializedState, getTransformedImageSize, getAreaPositionRestrictions } from '../service/helpers.js';
import { copyState } from '../state/copyState.js';
import '../types';
import '../state/setCoordinates.js';

function flipImageAlgorithm(state, settings, horizontal, vertical) {
    if (isInitializedState(state)) {
        var result = copyState(state);
        var rotate = state.transforms.rotate;
        var imageSize = getTransformedImageSize(state);
        var changed = {
            horizontal: horizontal,
            vertical: vertical,
        };
        if (changed.horizontal || changed.vertical) {
            var imageCenter = rotatePoint({
                left: imageSize.width / 2,
                top: imageSize.height / 2,
            }, -rotate);
            var oldCenter = rotatePoint(getCenter(result.coordinates), -rotate);
            var newCenter = rotatePoint({
                left: changed.horizontal ? imageCenter.left - (oldCenter.left - imageCenter.left) : oldCenter.left,
                top: changed.vertical ? imageCenter.top - (oldCenter.top - imageCenter.top) : oldCenter.top,
            }, rotate);
            result.coordinates = applyMove(result.coordinates, diff(newCenter, getCenter(result.coordinates)));
            oldCenter = rotatePoint(getCenter(result.visibleArea), -rotate);
            newCenter = rotatePoint({
                left: changed.horizontal ? imageCenter.left - (oldCenter.left - imageCenter.left) : oldCenter.left,
                top: changed.vertical ? imageCenter.top - (oldCenter.top - imageCenter.top) : oldCenter.top,
            }, rotate);
            result.visibleArea = applyMove(result.visibleArea, diff(newCenter, getCenter(result.visibleArea)));
            result.visibleArea = moveToPositionRestrictions(result.visibleArea, getAreaPositionRestrictions(result, settings));
        }
        if (changed.horizontal) {
            result.transforms.flip.horizontal = !state.transforms.flip.horizontal;
        }
        if (changed.vertical) {
            result.transforms.flip.vertical = !state.transforms.flip.vertical;
        }
        return result;
    }
    return state;
}

export { flipImageAlgorithm };
