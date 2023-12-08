import 'tslib';
import { ratio } from '../service/utils.js';
import { getTransformedImageSize } from '../service/helpers.js';
import { ImageRestriction } from '../types';
import '../state/setCoordinates.js';

function defaultAreaPositionRestrictions(state, settings) {
    var visibleArea = state.visibleArea, boundary = state.boundary;
    var imageRestriction = settings.imageRestriction;
    var imageSize = getTransformedImageSize(state);
    var restrictions = {};
    if (imageRestriction === ImageRestriction.fillArea) {
        restrictions = {
            left: 0,
            top: 0,
            right: imageSize.width,
            bottom: imageSize.height,
        };
    }
    else if (imageRestriction === ImageRestriction.fitArea) {
        if (ratio(boundary) > ratio(imageSize)) {
            restrictions = {
                top: 0,
                bottom: imageSize.height,
            };
            if (visibleArea) {
                if (visibleArea.width > imageSize.width) {
                    restrictions.left = -(visibleArea.width - imageSize.width) / 2;
                    restrictions.right = imageSize.width - restrictions.left;
                }
                else {
                    restrictions.left = 0;
                    restrictions.right = imageSize.width;
                }
            }
        }
        else {
            restrictions = {
                left: 0,
                right: imageSize.width,
            };
            if (visibleArea) {
                if (visibleArea.height > imageSize.height) {
                    restrictions.top = -(visibleArea.height - imageSize.height) / 2;
                    restrictions.bottom = imageSize.height - restrictions.top;
                }
                else {
                    restrictions.top = 0;
                    restrictions.bottom = imageSize.height;
                }
            }
        }
    }
    return restrictions;
}

export { defaultAreaPositionRestrictions };
