import { isNumber } from '../utils';
import { getCoefficient } from './helpers.js';

function normalizeResizeDirections(state, directions) {
    var coefficient = getCoefficient(state);
    return {
        left: isNumber(directions.left) ? directions.left * coefficient : 0,
        top: isNumber(directions.top) ? directions.top * coefficient : 0,
        right: isNumber(directions.right) ? directions.right * coefficient : 0,
        bottom: isNumber(directions.bottom) ? directions.bottom * coefficient : 0,
    };
}
function normalizeCenter(state, center) {
    var coefficient = getCoefficient(state);
    if (state.visibleArea) {
        return {
            left: center.left * coefficient + state.visibleArea.left,
            top: center.top * coefficient + state.visibleArea.top,
        };
    }
    return center;
}
function normalizeFlip(state, flip) {
    if (state) {
        var normalizedAngle = Math.abs(state.transforms.rotate % 180);
        if (normalizedAngle <= 45 || normalizedAngle >= 135) {
            return flip;
        }
        else {
            return {
                horizontal: flip.vertical,
                vertical: flip.horizontal,
            };
        }
    }
    return flip;
}
function fillMoveDirections(directions) {
    return {
        left: isNumber(directions.left) ? directions.left : 0,
        top: isNumber(directions.top) ? directions.top : 0,
    };
}
function fillResizeDirections(directions) {
    return {
        left: isNumber(directions.left) ? directions.left : 0,
        top: isNumber(directions.top) ? directions.top : 0,
        right: isNumber(directions.right) ? directions.right : 0,
        bottom: isNumber(directions.bottom) ? directions.bottom : 0,
    };
}
function normalizeMoveDirections(state, directions) {
    var coefficient = getCoefficient(state);
    return {
        left: isNumber(directions.left) ? directions.left * coefficient : 0,
        top: isNumber(directions.top) ? directions.top * coefficient : 0,
    };
}
function normalizeImageTransform(state, transform) {
    if (transform.scale) {
        transform.scale = {
            factor: isNumber(transform.scale) ? transform.scale : transform.scale.factor,
            center: !isNumber(transform.scale) && transform.scale.center
                ? normalizeCenter(state, transform.scale.center)
                : undefined,
        };
    }
    if (transform.rotate) {
        transform.rotate = {
            angle: isNumber(transform.rotate) ? transform.rotate : transform.rotate.angle,
            center: !isNumber(transform.rotate) && transform.rotate.center
                ? normalizeCenter(state, transform.rotate.center)
                : undefined,
        };
    }
    if (transform.move) {
        transform.move = normalizeMoveDirections(state, transform.move);
    }
    return transform;
}

export { fillMoveDirections, fillResizeDirections, normalizeCenter, normalizeFlip, normalizeImageTransform, normalizeMoveDirections, normalizeResizeDirections };
