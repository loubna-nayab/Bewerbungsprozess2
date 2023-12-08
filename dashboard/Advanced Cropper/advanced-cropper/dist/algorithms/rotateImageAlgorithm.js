import { __assign } from 'tslib';
import { isNumber } from '../utils';
import { rotatePoint, getCenter, diff, resizeToSizeRestrictions, moveToPositionRestrictions, applyMove } from '../service/utils.js';
import { mergeSizeRestrictions } from '../service/sizeRestrictions.js';
import { isInitializedState, getTransformedImageSize, getSizeRestrictions, getAspectRatio, getAreaSizeRestrictions, getPositionRestrictions, getAreaPositionRestrictions } from '../service/helpers.js';
import { copyState } from '../state/copyState.js';
import '../types';
import '../state/setCoordinates.js';
import { approximateSize } from '../service/approximateSize.js';

function rotateImageAlgorithm(state, settings, rotate) {
    if (isInitializedState(state)) {
        var result = copyState(state);
        var angle = isNumber(rotate) ? rotate : rotate.angle;
        var imageCenter = rotatePoint(getCenter(__assign({ left: 0, top: 0 }, getTransformedImageSize(state))), angle);
        result.transforms.rotate += angle;
        result.coordinates = __assign(__assign({}, approximateSize({
            sizeRestrictions: getSizeRestrictions(result, settings),
            aspectRatio: getAspectRatio(result, settings),
            width: result.coordinates.width,
            height: result.coordinates.height,
        })), rotatePoint(getCenter(result.coordinates), angle));
        var center = !isNumber(rotate) && rotate.center ? rotate.center : getCenter(state.coordinates);
        var shift = diff(getCenter(state.coordinates), rotatePoint(getCenter(state.coordinates), angle, center));
        var imageSize = getTransformedImageSize(result);
        result.coordinates.left -= imageCenter.left - imageSize.width / 2 + result.coordinates.width / 2 - shift.left;
        result.coordinates.top -= imageCenter.top - imageSize.height / 2 + result.coordinates.height / 2 - shift.top;
        // Check that visible area doesn't break the area restrictions:
        result.visibleArea = resizeToSizeRestrictions(result.visibleArea, mergeSizeRestrictions(getAreaSizeRestrictions(result, settings), {
            minWidth: result.coordinates.width,
            minHeight: result.coordinates.height,
        }));
        result.coordinates = moveToPositionRestrictions(result.coordinates, getPositionRestrictions(result, settings));
        result.visibleArea = applyMove(result.visibleArea, diff(getCenter(result.coordinates), getCenter(state.coordinates)));
        result.visibleArea = moveToPositionRestrictions(result.visibleArea, getAreaPositionRestrictions(result, settings));
        return result;
    }
    return state;
}

export { rotateImageAlgorithm };
