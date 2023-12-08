import { __assign } from 'tslib';
import { ALL_DIRECTIONS } from '../constants';
import { isLower, isGreater, isNumber, isNumeric, isUndefined, isFunction } from '../utils';

function diff(firstObject, secondObject) {
    return {
        left: firstObject.left - secondObject.left,
        top: firstObject.top - secondObject.top,
    };
}
function getCenter(object) {
    return {
        left: object.left + object.width / 2,
        top: object.top + object.height / 2,
    };
}
function sizeDistance(a, b) {
    return Math.pow(a.width - b.width, 2) + Math.pow(a.height - b.height, 2);
}
function applyDirections(coordinates, directions) {
    return {
        left: coordinates.left - directions.left,
        top: coordinates.top - directions.top,
        width: coordinates.width + directions.left + directions.right,
        height: coordinates.height + directions.top + directions.bottom,
    };
}
function inverseMove(directions) {
    return {
        left: -directions.left,
        top: -directions.top,
    };
}
function applyMove(object, move) {
    return __assign(__assign({}, object), { left: object.left + move.left, top: object.top + move.top });
}
function coordinatesToPositionRestrictions(coordinates) {
    return {
        left: coordinates.left,
        top: coordinates.top,
        right: coordinates.left + coordinates.width,
        bottom: coordinates.top + coordinates.height,
    };
}
function applyScale(object, factor, center, progress) {
    if (factor !== 1) {
        if ('left' in object || 'top' in object) {
            if (center) {
                var currentCenter = getCenter(object);
                return {
                    width: object.width * factor,
                    height: object.height * factor,
                    left: object.left +
                        (object.width * (1 - factor)) / 2 +
                        (center.left - currentCenter.left) * (progress || 1 - factor),
                    top: object.top +
                        (object.height * (1 - factor)) / 2 +
                        (center.top - currentCenter.top) * (progress || 1 - factor),
                };
            }
            else {
                return {
                    width: object.width * factor,
                    height: object.height * factor,
                    left: object.left + (object.width * (1 - factor)) / 2,
                    top: object.top + (object.height * (1 - factor)) / 2,
                };
            }
        }
        else {
            return {
                width: object.width * factor,
                height: object.height * factor,
            };
        }
    }
    else {
        return object;
    }
}
function ratio(object) {
    return object.width / object.height;
}
function maxScale(size, restrictions) {
    return Math.min(restrictions.maxWidth ? restrictions.maxWidth / size.width : Infinity, restrictions.maxHeight ? restrictions.maxHeight / size.height : Infinity);
}
function minScale(size, restrictions) {
    return Math.max(restrictions.minWidth ? restrictions.minWidth / size.width : 0, restrictions.minHeight ? restrictions.minHeight / size.height : 0);
}
function getBrokenRatio(currentAspectRatio, aspectRatio) {
    var ratioBroken;
    if (aspectRatio.minimum && isLower(currentAspectRatio, aspectRatio.minimum)) {
        ratioBroken = aspectRatio.minimum;
    }
    else if (aspectRatio.maximum && isGreater(currentAspectRatio, aspectRatio.maximum)) {
        ratioBroken = aspectRatio.maximum;
    }
    return ratioBroken;
}
function fitToSizeRestrictions(coordinates, sizeRestrictions) {
    var aspectRatio = ratio(coordinates);
    var scale = 1;
    if (sizeRestrictions.minWidth > 0 && sizeRestrictions.minHeight > 0) {
        if (aspectRatio > sizeRestrictions.minWidth / sizeRestrictions.minHeight) {
            if (coordinates.height < sizeRestrictions.minHeight) {
                scale = sizeRestrictions.minHeight / coordinates.height;
            }
        }
        else {
            if (coordinates.width < sizeRestrictions.minWidth) {
                scale = sizeRestrictions.minWidth / coordinates.width;
            }
        }
    }
    else if (sizeRestrictions.minWidth > 0) {
        if (coordinates.width < sizeRestrictions.minWidth) {
            scale = sizeRestrictions.minWidth / coordinates.width;
        }
    }
    else if (sizeRestrictions.minHeight > 0) {
        if (coordinates.height < sizeRestrictions.minHeight) {
            scale = sizeRestrictions.minHeight / coordinates.height;
        }
    }
    if (sizeRestrictions.maxWidth < Infinity && sizeRestrictions.maxHeight < Infinity) {
        if (aspectRatio > sizeRestrictions.maxWidth / sizeRestrictions.maxHeight) {
            if (coordinates.width > sizeRestrictions.maxWidth) {
                scale = sizeRestrictions.maxWidth / coordinates.width;
            }
        }
        else {
            if (coordinates.height > sizeRestrictions.maxHeight) {
                scale = sizeRestrictions.maxHeight / coordinates.height;
            }
        }
    }
    else if (sizeRestrictions.maxWidth < Infinity) {
        if (coordinates.width > sizeRestrictions.maxWidth) {
            scale = sizeRestrictions.maxWidth / coordinates.width;
        }
    }
    else if (sizeRestrictions.maxHeight < Infinity) {
        if (coordinates.height > sizeRestrictions.maxHeight) {
            scale = sizeRestrictions.maxHeight / coordinates.height;
        }
    }
    return scale;
}
function getIntersections(object, positionRestrictions) {
    var intersections = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };
    ALL_DIRECTIONS.forEach(function (direction) {
        var areaLimit = positionRestrictions[direction];
        var objectLimit = coordinatesToPositionRestrictions(object)[direction];
        if (areaLimit !== undefined && objectLimit !== undefined) {
            if (direction === 'left' || direction === 'top') {
                intersections[direction] = Math.max(0, areaLimit - objectLimit);
            }
            else {
                intersections[direction] = Math.max(0, objectLimit - areaLimit);
            }
        }
        else {
            intersections[direction] = 0;
        }
    });
    return intersections;
}
function resizeToSizeRestrictions(coordinates, sizeRestrictions) {
    return applyScale(coordinates, fitToSizeRestrictions(coordinates, sizeRestrictions));
}
function rotateSize(size, angle) {
    var radians = (angle * Math.PI) / 180;
    return {
        width: Math.abs(size.width * Math.cos(radians)) + Math.abs(size.height * Math.sin(radians)),
        height: Math.abs(size.width * Math.sin(radians)) + Math.abs(size.height * Math.cos(radians)),
    };
}
function rotatePoint(point, angle, anchor) {
    var radians = (angle * Math.PI) / 180;
    if (anchor) {
        return {
            left: (point.left - anchor.left) * Math.cos(radians) -
                (point.top - anchor.top) * Math.sin(radians) +
                anchor.left,
            top: (point.left - anchor.left) * Math.sin(radians) +
                (point.top - anchor.top) * Math.cos(radians) +
                anchor.top,
        };
    }
    else {
        return {
            left: point.left * Math.cos(radians) - point.top * Math.sin(radians),
            top: point.left * Math.sin(radians) + point.top * Math.cos(radians),
        };
    }
}
function positionToSizeRestrictions(positionRestrictions) {
    return {
        minWidth: 0,
        minHeight: 0,
        maxWidth: positionRestrictions.right !== undefined && positionRestrictions.left !== undefined
            ? positionRestrictions.right - positionRestrictions.left
            : Infinity,
        maxHeight: positionRestrictions.bottom !== undefined && positionRestrictions.top !== undefined
            ? positionRestrictions.bottom - positionRestrictions.top
            : Infinity,
    };
}
function mergePositionRestrictions(a, b) {
    var restrictions = {};
    ALL_DIRECTIONS.forEach(function (direction) {
        var firstDirection = a[direction];
        var secondDirection = b[direction];
        if (firstDirection !== undefined && secondDirection !== undefined) {
            if (direction === 'left' || direction === 'top') {
                restrictions[direction] = Math.max(firstDirection, secondDirection);
            }
            else {
                restrictions[direction] = Math.min(firstDirection, secondDirection);
            }
        }
        else if (secondDirection !== undefined) {
            restrictions[direction] = secondDirection;
        }
        else if (firstDirection !== undefined) {
            restrictions[direction] = firstDirection;
        }
    });
    return restrictions;
}
function fitToPositionRestrictions(coordinates, positionRestrictions) {
    var directions = {
        left: 0,
        top: 0,
    };
    var intersection = getIntersections(coordinates, positionRestrictions);
    if (intersection.left && intersection.left > 0) {
        directions.left = intersection.left;
    }
    else if (intersection.right && intersection.right > 0) {
        directions.left = -intersection.right;
    }
    if (intersection.top && intersection.top > 0) {
        directions.top = intersection.top;
    }
    else if (intersection.bottom && intersection.bottom > 0) {
        directions.top = -intersection.bottom;
    }
    return directions;
}
function moveToPositionRestrictions(coordinates, positionRestrictions) {
    return applyMove(coordinates, fitToPositionRestrictions(coordinates, positionRestrictions));
}
function aspectRatioIntersection(main, subset) {
    if (!subset) {
        return main;
    }
    else if (!main) {
        return subset;
    }
    else {
        return {
            minimum: Math.min(main.maximum, Math.max(main.minimum, subset.minimum)),
            maximum: Math.max(main.minimum, Math.min(main.maximum, subset.maximum)),
        };
    }
}
function createAspectRatio(aspectRatio) {
    if (aspectRatio === void 0) { aspectRatio = {}; }
    if (isNumber(aspectRatio)) {
        return {
            minimum: aspectRatio,
            maximum: aspectRatio,
        };
    }
    else {
        return {
            minimum: isNumeric(aspectRatio.minimum) ? aspectRatio.minimum : 0,
            maximum: isNumeric(aspectRatio.maximum) ? aspectRatio.maximum : Infinity,
        };
    }
}
function getTransitionStyle(transitions) {
    return transitions ? transitions.timingFunction + " " + (transitions.active ? transitions.duration : 0) + "ms" : 'none';
}
function isConsistentSize(size, restrictions) {
    return ((isUndefined(restrictions.maxWidth) || !isGreater(size.width, restrictions.maxWidth)) &&
        (isUndefined(restrictions.maxHeight) || !isGreater(size.height, restrictions.maxHeight)) &&
        (isUndefined(restrictions.minHeight) || !isLower(size.height, restrictions.minHeight)) &&
        (isUndefined(restrictions.minWidth) || !isLower(size.width, restrictions.minWidth)));
}
function isConsistentPosition(coordinates, restrictions) {
    return ((isUndefined(restrictions.left) || !isLower(coordinates.left, restrictions.left)) &&
        (isUndefined(restrictions.top) || !isLower(coordinates.top, restrictions.top)) &&
        (isUndefined(restrictions.right) || !isGreater(coordinates.left + coordinates.width, restrictions.right)) &&
        (isUndefined(restrictions.bottom) || !isGreater(coordinates.top + coordinates.height, restrictions.bottom)));
}
function getCloserSize(candidates, reference, sizeRestrictions, aspectRatio) {
    var traverse = function (ignoreMinimum) {
        return candidates.reduce(function (minimum, size) {
            var _a = isFunction(sizeRestrictions)
                ? sizeRestrictions(size)
                : sizeRestrictions, maxHeight = _a.maxHeight, maxWidth = _a.maxWidth, minWidth = _a.minWidth, minHeight = _a.minHeight;
            var preparedAspectRatio = createAspectRatio(isFunction(aspectRatio) ? aspectRatio(size) : aspectRatio);
            var preparedSizeRestrictions = ignoreMinimum
                ? { maxWidth: maxWidth, maxHeight: maxHeight }
                : { maxWidth: maxWidth, maxHeight: maxHeight, minWidth: minWidth, minHeight: minHeight };
            if (isConsistentSize(size, preparedSizeRestrictions) &&
                !getBrokenRatio(ratio(size), preparedAspectRatio) &&
                size.width &&
                size.height) {
                return !minimum || isLower(sizeDistance(size, reference), sizeDistance(minimum, reference))
                    ? size
                    : minimum;
            }
            else {
                return minimum;
            }
        }, null);
    };
    return traverse() || traverse(true);
}

export { applyDirections, applyMove, applyScale, aspectRatioIntersection, coordinatesToPositionRestrictions, createAspectRatio, diff, fitToPositionRestrictions, fitToSizeRestrictions, getBrokenRatio, getCenter, getCloserSize, getIntersections, getTransitionStyle, inverseMove, isConsistentPosition, isConsistentSize, maxScale, mergePositionRestrictions, minScale, moveToPositionRestrictions, positionToSizeRestrictions, ratio, resizeToSizeRestrictions, rotatePoint, rotateSize, sizeDistance };
