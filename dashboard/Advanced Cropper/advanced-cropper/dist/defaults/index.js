import { __assign } from 'tslib';
import { isFunction } from '../utils';
import { mergePositionRestrictions, createAspectRatio } from '../service/utils.js';
import { mergeSizeRestrictions } from '../service/sizeRestrictions.js';
import '../types';
import '../state/setCoordinates.js';
import { defaultPositionRestrictions } from './defaultPositionRestrictions.js';
export { defaultPositionRestrictions } from './defaultPositionRestrictions.js';
import { defaultVisibleArea } from './defaultVisibleArea.js';
export { defaultVisibleArea } from './defaultVisibleArea.js';
import { defaultSize } from './defaultSize.js';
export { defaultSize } from './defaultSize.js';
import { pixelsRestrictions } from './defaultSizeRestrictions.js';
export { pixelsRestrictions, retrieveSizeRestrictions } from './defaultSizeRestrictions.js';
import { defaultPosition } from './defaultPosition.js';
export { defaultPosition } from './defaultPosition.js';
import { defaultAreaPositionRestrictions } from './defaultAreaPositionRestrictions.js';
export { defaultAreaPositionRestrictions } from './defaultAreaPositionRestrictions.js';
import { defaultAreaSizeRestrictions } from './defaultAreaSizeRestrictions.js';
export { defaultAreaSizeRestrictions } from './defaultAreaSizeRestrictions.js';
export { fillBoundary, fitBoundary } from './defaultBoundary.js';
export { defaultStencilConstraints } from './defaultStencilConstraints.js';

function withDefaultSizeRestrictions(sizeRestrictions) {
    return function (state, basicSettings) {
        var value = isFunction(sizeRestrictions) ? sizeRestrictions(state, basicSettings) : sizeRestrictions;
        return mergeSizeRestrictions(pixelsRestrictions(state, basicSettings), value);
    };
}
function withDefaultPositionRestrictions(positionRestrictions) {
    return function (state, basicSettings) {
        var value = isFunction(positionRestrictions)
            ? positionRestrictions(state, basicSettings)
            : positionRestrictions;
        return mergePositionRestrictions(defaultPositionRestrictions(state, basicSettings), value);
    };
}
function withDefaultAreaPositionRestrictions(areaPositionRestrictions) {
    return function (state, basicSettings) {
        var value = isFunction(areaPositionRestrictions)
            ? areaPositionRestrictions(state, basicSettings)
            : areaPositionRestrictions;
        return mergePositionRestrictions(defaultAreaPositionRestrictions(state, basicSettings), value);
    };
}
function withDefaultAreaSizeRestrictions(areaSizeRestrictions) {
    return function (state, basicSettings) {
        var value = isFunction(areaSizeRestrictions)
            ? areaSizeRestrictions(state, basicSettings)
            : areaSizeRestrictions;
        return mergeSizeRestrictions(defaultAreaSizeRestrictions(state, basicSettings), value);
    };
}
function createDefaultSettings(params) {
    return __assign(__assign({}, params), { sizeRestrictions: function (state, basicSettings) {
            var restrictions;
            if (params.sizeRestrictions) {
                restrictions = isFunction(params.sizeRestrictions)
                    ? params.sizeRestrictions(state, basicSettings)
                    : params.sizeRestrictions;
            }
            else {
                restrictions = pixelsRestrictions(state, basicSettings);
            }
            return restrictions;
        }, areaPositionRestrictions: function (state, basicSettings) {
            if (params.areaPositionRestrictions) {
                return isFunction(params.areaPositionRestrictions)
                    ? params.areaPositionRestrictions(state, basicSettings)
                    : params.areaPositionRestrictions;
            }
            else {
                return defaultAreaPositionRestrictions(state, basicSettings);
            }
        }, areaSizeRestrictions: function (state, basicSettings) {
            if (params.areaSizeRestrictions) {
                return isFunction(params.areaSizeRestrictions)
                    ? params.areaSizeRestrictions(state, basicSettings)
                    : params.areaSizeRestrictions;
            }
            else {
                return defaultAreaSizeRestrictions(state, basicSettings);
            }
        }, positionRestrictions: function (state, basicSettings) {
            if (params.positionRestrictions) {
                return isFunction(params.positionRestrictions)
                    ? params.positionRestrictions(state, basicSettings)
                    : params.positionRestrictions;
            }
            else {
                return defaultPositionRestrictions(state, basicSettings);
            }
        }, defaultCoordinates: function (state, basicSettings) {
            if (params.defaultCoordinates) {
                return isFunction(params.defaultCoordinates)
                    ? params.defaultCoordinates(state, basicSettings)
                    : params.defaultCoordinates;
            }
            else {
                var defaultSizeAlgorithm = params.defaultSize;
                if (!defaultSizeAlgorithm) {
                    defaultSizeAlgorithm = defaultSize;
                }
                var size = isFunction(defaultSizeAlgorithm)
                    ? defaultSizeAlgorithm(state, basicSettings)
                    : defaultSizeAlgorithm;
                var defaultPositionAlgorithm_1 = params.defaultPosition || defaultPosition;
                return [
                    size,
                    function (state) { return (__assign({}, (isFunction(defaultPositionAlgorithm_1)
                        ? defaultPositionAlgorithm_1(state, basicSettings)
                        : defaultPositionAlgorithm_1))); },
                ];
            }
        }, defaultVisibleArea: function (state, basicSettings) {
            if (params.defaultVisibleArea) {
                return isFunction(params.defaultVisibleArea)
                    ? params.defaultVisibleArea(state, basicSettings)
                    : params.defaultVisibleArea;
            }
            else {
                return defaultVisibleArea(state, basicSettings);
            }
        }, aspectRatio: function (state, basicSettings) {
            return createAspectRatio(isFunction(params.aspectRatio) ? params.aspectRatio(state, basicSettings) : params.aspectRatio);
        } });
}

export { createDefaultSettings, withDefaultAreaPositionRestrictions, withDefaultAreaSizeRestrictions, withDefaultPositionRestrictions, withDefaultSizeRestrictions };
