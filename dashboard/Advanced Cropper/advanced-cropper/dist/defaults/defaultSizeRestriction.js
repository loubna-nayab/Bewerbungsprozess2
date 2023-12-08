import { isNumeric, parseNumber } from '../utils';

function retrieveSizeRestrictions(settings) {
    return {
        minWidth: isNumeric(settings.minWidth) ? parseNumber(settings.minWidth) : 0,
        minHeight: isNumeric(settings.minHeight) ? parseNumber(settings.minHeight) : 0,
        maxWidth: isNumeric(settings.maxWidth) ? parseNumber(settings.maxWidth) : Infinity,
        maxHeight: isNumeric(settings.maxHeight) ? parseNumber(settings.maxHeight) : Infinity,
    };
}
function pixelsRestrictions(state, settings) {
    return retrieveSizeRestrictions(settings);
}

export { pixelsRestrictions, retrieveSizeRestrictions };
