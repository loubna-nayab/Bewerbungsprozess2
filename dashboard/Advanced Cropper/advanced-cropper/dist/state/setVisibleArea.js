import { __assign } from 'tslib';
import { copyState } from './copyState.js';
import { fitCoordinates } from '../service/fitCoordinates.js';
import { fitVisibleArea } from '../service/fitvisibleArea.js';

function setVisibleArea(state, settings, visibleArea,
                        // If you set safe to `false`, the coordinates will be able to leave the visible area
                        safe) {
    if (safe === void 0) { safe = true; }
    var result = __assign(__assign({}, copyState(state)), { visibleArea: visibleArea });
    // There is no possibility to break visible area limitations.
    result = fitVisibleArea(result, settings);
    if (safe) {
        result = fitCoordinates(result, settings);
    }
    return result;
}

export { setVisibleArea };
