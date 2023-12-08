import { __assign } from 'tslib';
import { positionToSizeRestrictions, ratio } from '../service/utils.js';
import { getSizeRestrictions, getAspectRatio, getPositionRestrictions } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';
import { approximateSize } from '../service/approximateSize.js';

function defaultSize(state, settings) {
    var imageSize = state.imageSize, visibleArea = state.visibleArea;
    var sizeRestrictions = getSizeRestrictions(state, settings);
    var aspectRatio = getAspectRatio(state, settings);
    var area;
    if (visibleArea) {
        area = visibleArea;
    }
    else {
        var sizeRestrictions_1 = positionToSizeRestrictions(getPositionRestrictions(state, settings));
        area = {
            width: Math.max(sizeRestrictions_1.minWidth, Math.min(sizeRestrictions_1.maxWidth, imageSize.width)),
            height: Math.max(sizeRestrictions_1.minHeight, Math.min(sizeRestrictions_1.maxHeight, imageSize.height)),
        };
    }
    var optimalRatio = Math.min(aspectRatio.maximum || Infinity, Math.max(aspectRatio.minimum || 0, ratio(area)));
    var size = area.width < area.height
        ? {
            width: area.width * 0.8,
            height: (area.width * 0.8) / optimalRatio,
        }
        : {
            height: area.height * 0.8,
            width: area.height * 0.8 * optimalRatio,
        };
    return approximateSize(__assign(__assign({}, size), { aspectRatio: aspectRatio, sizeRestrictions: sizeRestrictions }));
}

export { defaultSize };
