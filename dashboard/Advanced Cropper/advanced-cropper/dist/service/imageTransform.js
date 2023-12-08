import { isRoughlyEqual, sign, distance } from '../utils';

function calculateGeometricProperties(touches, container) {
    var _a = container.getBoundingClientRect(), left = _a.left, top = _a.top;
    var centerMass = { left: 0, top: 0 };
    var spread = 0;
    touches.forEach(function (touch) {
        centerMass.left += (touch.clientX - left) / touches.length;
        centerMass.top += (touch.clientY - top) / touches.length;
    });
    touches.forEach(function (touch) {
        spread += distance({ left: centerMass.left, top: centerMass.top }, { left: touch.clientX - left, top: touch.clientY - top });
    });
    return { centerMass: centerMass, spread: spread, count: touches.length };
}
function touchesToImageTransform(touches, previousTouches, container, options) {
    if (options === void 0) { options = {}; }
    var move, scale, rotate;
    if (previousTouches.length === 1 && touches.length === 1) {
        if (options.move) {
            move = {
                left: previousTouches[0].clientX - touches[0].clientX,
                top: previousTouches[0].clientY - touches[0].clientY,
            };
        }
    }
    else if (touches.length > 1) {
        var previousProperties = calculateGeometricProperties(previousTouches, container);
        var properties = calculateGeometricProperties(touches, container);
        if (options.rotate && previousTouches.length === 2 && touches.length === 2) {
            var diffs = {
                left: [
                    touches[0].clientX - touches[1].clientX,
                    previousTouches[0].clientX - previousTouches[1].clientX,
                ],
                top: [touches[0].clientY - touches[1].clientY, previousTouches[0].clientY - previousTouches[1].clientY],
            };
            var y = diffs.left[0] * diffs.top[1] - diffs.left[1] * diffs.top[0];
            var x = diffs.left[0] * diffs.left[1] + diffs.top[0] * diffs.top[1];
            if (!isRoughlyEqual(x, 0) && !isRoughlyEqual(y, 0)) {
                var radians = Math.atan2(y, x);
                var angle = -(radians * 180) / Math.PI;
                rotate = {
                    center: properties.centerMass,
                    angle: angle,
                };
            }
        }
        if (options.move) {
            move = {
                left: previousProperties.centerMass.left - properties.centerMass.left,
                top: previousProperties.centerMass.top - properties.centerMass.top,
            };
        }
        if (options.scale) {
            scale = {
                factor: properties.spread / previousProperties.spread,
                center: properties.centerMass,
            };
        }
    }
    return {
        move: move,
        scale: scale,
        rotate: rotate,
    };
}
function wheelEventToImageTransform(event, container, ratio) {
    if (ratio === void 0) { ratio = 0.1; }
    var _a = container.getBoundingClientRect(), left = _a.left, top = _a.top;
    var factor = 1 - ratio * sign((event.deltaY || event.detail || event.wheelDelta));
    var center = {
        left: event.clientX - left,
        top: event.clientY - top,
    };
    return { scale: { factor: factor, center: center } };
}

export { touchesToImageTransform, wheelEventToImageTransform };
