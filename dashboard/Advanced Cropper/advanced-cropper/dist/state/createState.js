import 'tslib';
import { getDefaultVisibleArea, getDefaultCoordinates } from '../service/helpers.js';
import { Priority } from '../types';
import { setCoordinates, SetCoordinatesMode } from './setCoordinates.js';
import { setVisibleArea } from './setVisibleArea.js';

function createState(options, settings) {
    var _a, _b;
    var boundary = options.boundary, imageSize = options.imageSize, transforms = options.transforms, priority = options.priority;
    var state = {
        boundary: {
            width: boundary.width,
            height: boundary.height,
        },
        imageSize: {
            width: imageSize.width,
            height: imageSize.height,
        },
        transforms: {
            rotate: (transforms === null || transforms === void 0 ? void 0 : transforms.rotate) || 0,
            flip: {
                horizontal: ((_a = transforms === null || transforms === void 0 ? void 0 : transforms.flip) === null || _a === void 0 ? void 0 : _a.horizontal) || false,
                vertical: ((_b = transforms === null || transforms === void 0 ? void 0 : transforms.flip) === null || _b === void 0 ? void 0 : _b.vertical) || false,
            },
        },
        visibleArea: null,
        coordinates: null,
    };
    if (priority === Priority.visibleArea) {
        state = setVisibleArea(state, settings, getDefaultVisibleArea(state, settings), false);
        state = setCoordinates(state, settings, getDefaultCoordinates(state, settings), SetCoordinatesMode.limit);
    }
    else {
        state = setCoordinates(state, settings, getDefaultCoordinates(state, settings), SetCoordinatesMode.unsafe);
        state = setVisibleArea(state, settings, getDefaultVisibleArea(state, settings), true);
    }
    return state;
}

export { createState };
