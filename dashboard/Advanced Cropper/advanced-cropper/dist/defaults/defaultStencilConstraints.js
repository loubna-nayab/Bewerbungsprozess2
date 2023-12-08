import 'tslib';
import { isFunction } from '../utils';
import { createAspectRatio } from '../service/utils.js';
import '../types';
import '../state/setCoordinates.js';

function defaultStencilConstraints(rawSettings, stencilProps) {
    if (!rawSettings.aspectRatio) {
        return {
            aspectRatio: createAspectRatio(isFunction(stencilProps.aspectRatio) ? stencilProps.aspectRatio() : stencilProps.aspectRatio),
        };
    }
    return {};
}

export { defaultStencilConstraints };
