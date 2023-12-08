import 'tslib';
import { ratio } from '../service/utils.js';
import { getTransformedImageSize } from '../service/helpers.js';
import { ImageRestriction } from '../types';
import '../state/setCoordinates.js';

function defaultAreaSizeRestrictions(state, settings) {
    var boundary = state.boundary;
    var imageRestriction = settings.imageRestriction;
    var imageSize = getTransformedImageSize(state);
    var restrictions = {
        minWidth: 0,
        minHeight: 0,
        maxWidth: Infinity,
        maxHeight: Infinity,
    };
    if (imageRestriction === ImageRestriction.fillArea) {
        restrictions.maxWidth = imageSize.width;
        restrictions.maxHeight = imageSize.height;
    }
    else if (imageRestriction === ImageRestriction.fitArea) {
        if (ratio(boundary) > ratio(imageSize)) {
            restrictions.maxHeight = imageSize.height;
            restrictions.maxWidth = imageSize.height * ratio(boundary);
        }
        else {
            restrictions.maxWidth = imageSize.width;
            restrictions.maxHeight = imageSize.width / ratio(boundary);
        }
    }
    return restrictions;
}

export { defaultAreaSizeRestrictions };
