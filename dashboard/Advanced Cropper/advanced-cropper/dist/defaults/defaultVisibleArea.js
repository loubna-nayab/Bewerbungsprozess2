import { __assign } from 'tslib';
import { ratio, resizeToSizeRestrictions, getIntersections, coordinatesToPositionRestrictions, moveToPositionRestrictions } from '../service/utils.js';
import { getTransformedImageSize, getAreaSizeRestrictions } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';

function defaultVisibleArea(state, settings) {
    var coordinates = state.coordinates, boundary = state.boundary;
    var imageSize = getTransformedImageSize(state);
    var boundaryRatio = ratio(boundary);
    if (coordinates) {
        // Visible area will try to fit reference:
        var reference = {
            height: Math.max(coordinates.height, imageSize.height),
            width: Math.max(coordinates.width, imageSize.width),
        };
        var visibleArea = {
            left: 0,
            top: 0,
            width: ratio(reference) > boundaryRatio ? reference.width : reference.height * boundaryRatio,
            height: ratio(reference) > boundaryRatio ? reference.width / boundaryRatio : reference.height,
        };
        // Visible area should correspond its restrictions:
        visibleArea = resizeToSizeRestrictions(visibleArea, getAreaSizeRestrictions(state, settings));
        // Visible area will try to center stencil:
        visibleArea.left = coordinates.left + coordinates.width / 2 - visibleArea.width / 2;
        visibleArea.top = coordinates.top + coordinates.height / 2 - visibleArea.height / 2;
        // TODO: Controversial behavior:
        // If the coordinates are beyond image visible area will be allowed to be beyond image alike:
        var coordinatesIntersection = getIntersections(coordinates, coordinatesToPositionRestrictions(__assign({ left: 0, top: 0 }, imageSize)));
        var restrictions = {};
        if (!coordinatesIntersection.left && !coordinatesIntersection.right && visibleArea.width <= imageSize.width) {
            restrictions.left = 0;
            restrictions.right = imageSize.width;
        }
        if (!coordinatesIntersection.top && !coordinatesIntersection.bottom && visibleArea.height <= imageSize.height) {
            restrictions.top = 0;
            restrictions.bottom = imageSize.height;
        }
        return moveToPositionRestrictions(visibleArea, restrictions);
    }
    else {
        var imageRatio = ratio(imageSize);
        var areaProperties = {
            height: imageRatio < boundaryRatio ? imageSize.height : imageSize.width / boundaryRatio,
            width: imageRatio < boundaryRatio ? imageSize.height * boundaryRatio : imageSize.width,
        };
        return {
            left: imageSize.width / 2 - areaProperties.width / 2,
            top: imageSize.height / 2 - areaProperties.height / 2,
            width: areaProperties.width,
            height: areaProperties.height,
        };
    }
}

export { defaultVisibleArea };
s