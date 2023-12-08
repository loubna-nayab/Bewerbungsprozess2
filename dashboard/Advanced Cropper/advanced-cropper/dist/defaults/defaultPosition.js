import 'tslib';
import { getTransformedImageSize } from '../service/helpers.js';
import '../types';
import '../state/setCoordinates.js';

function defaultPosition(state) {
    var visibleArea = state.visibleArea, coordinates = state.coordinates;
    var area = visibleArea || getTransformedImageSize(state);
    return {
        left: (visibleArea ? visibleArea.left : 0) + area.width / 2 - (coordinates ? coordinates.width / 2 : 0),
        top: (visibleArea ? visibleArea.top : 0) + area.height / 2 - (coordinates ? coordinates.height / 2 : 0),
    };
}

export { defaultPosition };
