import { __assign } from 'tslib';
import { isFunction, isNumeric, parseNumber } from '../utils';
import { ratio } from './utils.js';
import { getPositionRestrictions } from './helpers.js';

function reconcileSizeRestrictions(sizeRestrictions) {
    var restrictions = __assign({}, sizeRestrictions);
    // Process the border cases when minimum height / width larger than maximum height / width
    if (restrictions.minWidth > restrictions.maxWidth) {
        restrictions.minWidth = restrictions.maxWidth;
    }
    if (restrictions.minHeight > restrictions.maxHeight) {
        restrictions.minHeight = restrictions.maxHeight;
    }
    return restrictions;
}
function mergeSizeRestrictions(a, b) {
    var first = a;
    var second = __assign({ minWidth: 0, minHeight: 0, maxWidth: Infinity, maxHeight: Infinity }, b);
    return reconcileSizeRestrictions({
        maxHeight: Math.min(first.maxHeight, second.maxHeight),
        minHeight: Math.max(first.minHeight, second.minHeight),
        maxWidth: Math.min(first.maxWidth, second.maxWidth),
        minWidth: Math.max(first.minWidth, second.minWidth),
    });
}
function calculateSizeRestrictions(state, settings) {
    var sizeRestrictions = isFunction(settings.sizeRestrictions)
        ? settings.sizeRestrictions(state, settings)
        : settings.sizeRestrictions;
    var positionRestrictions = getPositionRestrictions(state, settings);
    // User can forget to set some of restrictions, so we should initialize them by default values
    var restrictions = {
        minWidth: isNumeric(sizeRestrictions.minWidth) ? parseNumber(sizeRestrictions.minWidth) : 0,
        minHeight: isNumeric(sizeRestrictions.minHeight) ? parseNumber(sizeRestrictions.minHeight) : 0,
        maxWidth: isNumeric(sizeRestrictions.maxWidth) ? parseNumber(sizeRestrictions.maxWidth) : Infinity,
        maxHeight: isNumeric(sizeRestrictions.maxHeight) ? parseNumber(sizeRestrictions.maxHeight) : Infinity,
    };
    // The situation, when stencil can't be positioned in cropper due to positionRestrictions should be avoided
    if (positionRestrictions.left !== undefined && positionRestrictions.right !== undefined) {
        restrictions.maxWidth = Math.min(restrictions.maxWidth, positionRestrictions.right - positionRestrictions.left);
    }
    if (positionRestrictions.bottom !== undefined && positionRestrictions.top !== undefined) {
        restrictions.maxHeight = Math.min(restrictions.maxHeight, positionRestrictions.bottom - positionRestrictions.top);
    }
    return reconcileSizeRestrictions(restrictions);
}
function calculateAreaSizeRestrictions(state, settings) {
    var sizeRestrictions = isFunction(settings.areaSizeRestrictions)
        ? settings.areaSizeRestrictions(state, settings)
        : settings.areaSizeRestrictions;
    if (sizeRestrictions.maxWidth < Infinity && sizeRestrictions.maxHeight < Infinity) {
        if (ratio(state.boundary) > sizeRestrictions.maxWidth / sizeRestrictions.maxHeight) {
            sizeRestrictions.maxHeight = sizeRestrictions.maxWidth / ratio(state.boundary);
        }
        else {
            sizeRestrictions.maxWidth = sizeRestrictions.maxHeight * ratio(state.boundary);
        }
    }
    return reconcileSizeRestrictions(sizeRestrictions);
}

export { calculateAreaSizeRestrictions, calculateSizeRestrictions, mergeSizeRestrictions, reconcileSizeRestrictions };
