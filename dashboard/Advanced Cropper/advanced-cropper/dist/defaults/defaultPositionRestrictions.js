import 'tslib';
import { getTransformedImageSize } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';

function defaultPositionRestrictions(state, settings) {
    var imageSize = getTransformedImageSize(state);
    var limits = {};
    if (settings.imageRestriction && settings.imageRestriction !== 'none') {
        limits = {
            left: 0,
            top: 0,
            right: imageSize.width,
            bottom: imageSize.height,
        };
    }
    return limits;
}

export { defaultPositionRestrictions };
