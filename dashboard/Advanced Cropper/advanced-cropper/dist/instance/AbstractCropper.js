import { __assign } from 'tslib';
import { getOptions, deepClone, debounce, isArray, isFunction, deepCompare, isUndefined } from '../utils';
import { getCoefficient, isConsistentState, getStencilCoordinates, getRoundedCoordinates } from '../service/helpers.js';
import { copyState } from '../state/copyState.js';
import { setCoordinates, SetCoordinatesMode } from '../state/setCoordinates.js';
import { setVisibleArea } from '../state/setVisibleArea.js';
import { createState } from '../state/createState.js';
import { moveCoordinates } from '../state/moveCoordinates.js';
import { resizeCoordinates } from '../state/resizeCoordinates.js';
import { setBoundary } from '../state/setBoundary.js';
import { transformImage } from '../state/TransformImage.js';
import { reconcileState } from '../state/reconcileState.js';
import { normalizeImageTransform, normalizeFlip, normalizeMoveDirections, fillMoveDirections, normalizeResizeDirections, fillResizeDirections } from '../service/normalize.js';
import { hasInteractions } from '../service/interactions.js';

function runCallback(callback, getInstance) {
    if (callback && getInstance) {
        var instance = getInstance();
        if (instance) {
            callback(instance);
        }
    }
}
function createCallback(callback, getInstance) {
    return function () {
        runCallback(callback, getInstance);
    };
}
function runCallbacks(callbacks) {
    callbacks.forEach(function (callback) {
        callback();
    });
}
var AbstractCropper = /** @class */ (function () {
    function AbstractCropper() {
        var _this = this;
        this.getTransitions = function () {
            var data = _this.getData();
            var transitions = _this.getProps().transitions;
            return __assign(__assign({}, getOptions(transitions, {
                timingFunction: 'ease-in-out',
                duration: 350,
            })), { active: data.transitions });
        };
        this.getInteractions = function () {
            var interactions = _this.getData().interactions;
            return deepClone(interactions);
        };
        this.hasInteractions = function () {
            var interactions = _this.getData().interactions;
            return hasInteractions(interactions);
        };
        this.disableTransitions = debounce(function () {
            var _a = _this.getProps(), onTransitionsEnd = _a.onTransitionsEnd, getInstance = _a.getInstance;
            _this.setData(__assign(__assign({}, _this.getData()), { transitions: false }));
            runCallback(onTransitionsEnd, getInstance);
        }, function () {
            return _this.getTransitions().duration;
        });
        this.applyPostProcess = function (action, state) {
            var _a = _this.getProps(), settings = _a.settings, postProcess = _a.postProcess;
            var name = action.name, _b = action.interaction, interaction = _b === void 0 ? false : _b, _c = action.transitions, transitions = _c === void 0 ? false : _c, _d = action.immediately, immediately = _d === void 0 ? false : _d;
            var preparedAction = {
                name: name,
                interaction: interaction,
                transitions: transitions,
                immediately: immediately,
            };
            if (isArray(postProcess)) {
                return postProcess.reduce(function (processedState, p) { return p(processedState, settings, preparedAction); }, state);
            }
            else if (isFunction(postProcess)) {
                return postProcess(state, settings, preparedAction);
            }
            else {
                return state;
            }
        };
        this.updateState = function (modifier, options, callbacks) {
            if (options === void 0) { options = {}; }
            if (callbacks === void 0) { callbacks = []; }
            var _a = options.transitions, transitions = _a === void 0 ? false : _a;
            var _b = _this.getProps(), onTransitionsStart = _b.onTransitionsStart, getInstance = _b.getInstance, onChange = _b.onChange, settings = _b.settings;
            var previousData = _this.getData();
            var state = isFunction(modifier) ? modifier(previousData.state, settings) : modifier;
            var tolerance = state ? 1e-3 * getCoefficient(state) : 1e-3;
            var somethingChanged = !deepCompare(previousData.state, state, tolerance);
            var affectTransitionProperties = [
                'coordinates',
                'boundary',
                'visibleArea',
                'imageSize',
                'transforms',
            ].some(function (property) { var _a; return !deepCompare((_a = previousData.state) === null || _a === void 0 ? void 0 : _a[property], state === null || state === void 0 ? void 0 : state[property], tolerance); });
            var currentData = previousData;
            if (somethingChanged) {
                if (transitions && affectTransitionProperties) {
                    _this.disableTransitions();
                }
                currentData = __assign(__assign({}, currentData), { state: copyState(state), transitions: transitions && affectTransitionProperties });
                _this.setData(currentData);
                runCallback(onChange, getInstance);
            }
            if (currentData.transitions && !previousData.transitions) {
                runCallback(onTransitionsStart, getInstance);
            }
            runCallbacks(callbacks.map(function (callback) { return createCallback(callback, getInstance); }));
        };
        this.setInteractions = function (interactions) {
            var _a = _this.getProps(), onInteractionStart = _a.onInteractionStart, onInteractionEnd = _a.onInteractionEnd, getInstance = _a.getInstance;
            var previousInteractions = _this.getInteractions();
            var currentInteractions = __assign(__assign({}, previousInteractions), interactions);
            if (!deepCompare(previousInteractions, currentInteractions)) {
                _this.setData(__assign(__assign({}, _this.getData()), { interactions: currentInteractions }));
            }
            if (hasInteractions(previousInteractions) !== hasInteractions(currentInteractions)) {
                if (!hasInteractions(previousInteractions)) {
                    runCallback(onInteractionStart, getInstance);
                }
                else {
                    var state_1 = _this.getData().state;
                    _this.updateState(function () {
                        return state_1 &&
                            _this.applyPostProcess({
                                name: 'interactionEnd',
                                immediately: true,
                                transitions: true,
                            }, state_1);
                    }, {
                        transitions: true,
                    }, [onInteractionEnd]);
                }
            }
        };
        this.resetState = function (boundary, image) {
            _this.updateState(_this.createDefaultState(boundary, image));
        };
        this.clear = function () {
            _this.updateState(null);
        };
        this.reconcileState = function (options) {
            if (options === void 0) { options = {}; }
            var _a = _this.getProps(), reconcileStateAlgorithm = _a.reconcileStateAlgorithm, settings = _a.settings;
            var state = _this.getData().state;
            var _b = options.transitions, transitions = _b === void 0 ? false : _b;
            if (state && !isConsistentState(state, settings)) {
                var reconciledState = (reconcileStateAlgorithm || reconcileState)(state, settings);
                reconciledState = _this.applyPostProcess({
                    name: 'reconcileState',
                    immediately: true,
                    transitions: transitions,
                }, reconciledState);
                _this.updateState(reconciledState, {
                    transitions: transitions,
                });
            }
        };
        this.transformImage = function (transform, options) {
            if (options === void 0) { options = {}; }
            var _a = options.transitions, transitions = _a === void 0 ? true : _a, _b = options.interaction, interaction = _b === void 0 ? true : _b, _c = options.immediately, immediately = _c === void 0 ? false : _c, _d = options.normalize, normalize = _d === void 0 ? true : _d;
            var _e = _this.getProps(), transformImageAlgorithm = _e.transformImageAlgorithm, onTransformImage = _e.onTransformImage, onTransformImageEnd = _e.onTransformImageEnd, settings = _e.settings;
            var state = _this.getData().state;
            var callbacks = [];
            if (state) {
                if (normalize) {
                    transform = normalizeImageTransform(state, transform);
                }
                var result = _this.applyPostProcess({
                    name: 'transformImage',
                    transitions: transitions,
                    immediately: immediately,
                }, (transformImageAlgorithm || transformImage)(state, settings, transform));
                callbacks.push(onTransformImage);
                if (interaction) {
                    _this.setInteractions({
                        transformImage: {
                            rotate: !isUndefined(transform.rotate),
                            flip: !isUndefined(transform.flip),
                            scale: !isUndefined(transform.scale),
                            move: !isUndefined(transform.move),
                        },
                    });
                }
                else {
                    result = _this.applyPostProcess({
                        name: 'transformImageEnd',
                        transitions: transitions,
                        immediately: true,
                    }, result);
                    callbacks.push(onTransformImageEnd);
                }
                _this.updateState(result, {
                    transitions: immediately && transitions,
                }, callbacks);
            }
        };
        this.transformImageEnd = function (options) {
            if (options === void 0) { options = {}; }
            var _a = options.immediately, immediately = _a === void 0 ? true : _a, _b = options.transitions, transitions = _b === void 0 ? true : _b;
            var state = _this.getData().state;
            var onTransformImageEnd = _this.getProps().onTransformImageEnd;
            _this.updateState(function () { return state && _this.applyPostProcess({ name: 'transformImageEnd', immediately: immediately, transitions: transitions }, state); }, {
                transitions: transitions,
            }, [onTransformImageEnd]);
            _this.setInteractions({
                transformImage: {
                    rotate: false,
                    flip: false,
                    scale: false,
                    move: false,
                },
            });
        };
        this.zoomImage = function (scale, options) {
            if (options === void 0) { options = {}; }
            var _a = options.interaction, interaction = _a === void 0 ? false : _a, _b = options.immediately, immediately = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? true : _c, _d = options.normalize, normalize = _d === void 0 ? false : _d;
            _this.transformImage({
                scale: scale,
            }, { interaction: interaction, immediately: immediately, transitions: transitions, normalize: normalize });
        };
        this.moveImage = function (left, top, options) {
            if (options === void 0) { options = {}; }
            var _a = options.interaction, interaction = _a === void 0 ? false : _a, _b = options.immediately, immediately = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? true : _c, _d = options.normalize, normalize = _d === void 0 ? false : _d;
            _this.transformImage({
                move: {
                    left: left,
                    top: top,
                },
            }, { interaction: interaction, immediately: immediately, transitions: transitions, normalize: normalize });
        };
        this.flipImage = function (horizontal, vertical, options) {
            if (options === void 0) { options = {}; }
            var _a = options.interaction, interaction = _a === void 0 ? false : _a, _b = options.immediately, immediately = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? true : _c, _d = options.normalize, normalize = _d === void 0 ? true : _d;
            var state = _this.getState();
            var flip = {
                horizontal: horizontal,
                vertical: vertical,
            };
            _this.transformImage({
                flip: state && normalize ? normalizeFlip(state, flip) : flip,
            }, { interaction: interaction, immediately: immediately, transitions: transitions });
        };
        this.rotateImage = function (rotate, options) {
            if (options === void 0) { options = {}; }
            var _a = options.interaction, interaction = _a === void 0 ? false : _a, _b = options.immediately, immediately = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? true : _c, _d = options.normalize, normalize = _d === void 0 ? false : _d;
            _this.transformImage({
                rotate: rotate,
            }, { interaction: interaction, immediately: immediately, transitions: transitions, normalize: normalize });
        };
        this.reset = function (boundary, image) {
            _this.resetState(boundary, image);
        };
        this.setState = function (modifier, options) {
            if (options === void 0) { options = {}; }
            var settings = _this.getSettings();
            var state = _this.getData().state;
            var _a = options.transitions, transitions = _a === void 0 ? true : _a, _b = options.immediately, immediately = _b === void 0 ? false : _b, _c = options.interaction, interaction = _c === void 0 ? false : _c, _d = options.postprocess, postprocess = _d === void 0 ? false : _d;
            var newState = modifier && (isFunction(modifier) ? modifier(state, settings) : __assign(__assign({}, state), modifier));
            _this.updateState(function () {
                return postprocess
                    ? newState &&
                    _this.applyPostProcess({
                        name: 'setState',
                        immediately: immediately,
                        transitions: transitions,
                        interaction: interaction,
                    }, newState)
                    : newState;
            }, {
                transitions: transitions,
            });
        };
        this.setCoordinates = function (transforms, options) {
            if (options === void 0) { options = {}; }
            var state = _this.getData().state;
            var _a = _this.getProps(), setCoordinatesAlgorithm = _a.setCoordinatesAlgorithm, settings = _a.settings;
            var _b = options.transitions, transitions = _b === void 0 ? true : _b, _c = options.immediately, immediately = _c === void 0 ? true : _c;
            _this.updateState(function () {
                return state &&
                    _this.applyPostProcess({
                        name: 'setCoordinates',
                        immediately: immediately,
                        transitions: transitions,
                    }, (setCoordinatesAlgorithm || setCoordinates)(state, settings, transforms, SetCoordinatesMode.zoom));
            }, {
                transitions: transitions,
            });
        };
        this.setVisibleArea = function (visibleArea, options) {
            if (options === void 0) { options = {}; }
            var _a = options.transitions, transitions = _a === void 0 ? true : _a, _b = options.immediately, immediately = _b === void 0 ? true : _b;
            var state = _this.getData().state;
            var _c = _this.getProps(), setVisibleAreaAlgorithm = _c.setVisibleAreaAlgorithm, settings = _c.settings;
            _this.updateState(function () {
                return state &&
                    _this.applyPostProcess({ name: 'setVisibleArea', immediately: immediately, transitions: transitions }, (setVisibleAreaAlgorithm || setVisibleArea)(state, settings, visibleArea));
            }, {
                transitions: transitions,
            });
        };
        this.setBoundary = function (boundary, options) {
            if (options === void 0) { options = {}; }
            var state = _this.getData().state;
            var _a = _this.getProps(), setBoundaryAlgorithm = _a.setBoundaryAlgorithm, settings = _a.settings;
            var _b = options.transitions, transitions = _b === void 0 ? false : _b, _c = options.immediately, immediately = _c === void 0 ? true : _c;
            if (boundary) {
                _this.updateState(function () {
                    return state &&
                        _this.applyPostProcess({ name: 'setBoundary', immediately: immediately, transitions: transitions }, (setBoundaryAlgorithm || setBoundary)(state, settings, boundary));
                });
            }
            else {
                _this.updateState(null);
            }
        };
        this.moveCoordinates = function (directions, options) {
            if (options === void 0) { options = {}; }
            var data = _this.getData();
            var _a = _this.getProps(), moveCoordinatesAlgorithm = _a.moveCoordinatesAlgorithm, onMove = _a.onMove, onMoveEnd = _a.onMoveEnd, settings = _a.settings;
            var _b = options.interaction, interaction = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? false : _c, _d = options.immediately, immediately = _d === void 0 ? false : _d, _e = options.normalize, normalize = _e === void 0 ? true : _e;
            var callbacks = [];
            if (!data.transitions && data.state) {
                var normalizedDirections = normalize
                    ? normalizeMoveDirections(data.state, directions)
                    : fillMoveDirections(directions);
                var result = _this.applyPostProcess({ name: 'moveCoordinates', interaction: interaction, immediately: immediately, transitions: transitions }, (moveCoordinatesAlgorithm || moveCoordinates)(data.state, settings, normalizedDirections));
                callbacks.push(onMove);
                if (interaction) {
                    _this.setInteractions({
                        moveCoordinates: true,
                    });
                }
                else {
                    result = _this.applyPostProcess({ name: 'moveCoordinatesEnd', interaction: interaction, immediately: immediately, transitions: transitions }, result);
                    callbacks.push(onMoveEnd);
                }
                _this.updateState(result, {
                    transitions: immediately && transitions,
                }, callbacks);
            }
        };
        this.moveCoordinatesEnd = function (options) {
            if (options === void 0) { options = {}; }
            var state = _this.getData().state;
            var onMoveEnd = _this.getProps().onMoveEnd;
            var _a = options.transitions, transitions = _a === void 0 ? true : _a, _b = options.immediately, immediately = _b === void 0 ? false : _b;
            _this.updateState(function () { return state && _this.applyPostProcess({ name: 'moveCoordinatesEnd', transitions: transitions, immediately: immediately }, state); }, {
                transitions: transitions,
            }, [onMoveEnd]);
            _this.setInteractions({
                moveCoordinates: false,
            });
        };
        this.resizeCoordinates = function (directions, parameters, options) {
            if (parameters === void 0) { parameters = {}; }
            if (options === void 0) { options = {}; }
            var state = _this.getData().state;
            var _a = _this.getProps(), resizeCoordinatesAlgorithm = _a.resizeCoordinatesAlgorithm, onResize = _a.onResize, onResizeEnd = _a.onResizeEnd, settings = _a.settings;
            var _b = options.interaction, interaction = _b === void 0 ? true : _b, _c = options.transitions, transitions = _c === void 0 ? false : _c, _d = options.immediately, immediately = _d === void 0 ? false : _d, _e = options.normalize, normalize = _e === void 0 ? true : _e;
            var transitionsOptions = _this.getTransitions();
            if (!transitionsOptions.active && state) {
                var callbacks = [];
                var normalizedDirections = normalize
                    ? normalizeResizeDirections(state, directions)
                    : fillResizeDirections(directions);
                var result = _this.applyPostProcess({ name: 'resizeCoordinates', interaction: interaction, immediately: immediately, transitions: transitions }, (resizeCoordinatesAlgorithm || resizeCoordinates)(state, settings, normalizedDirections, parameters));
                callbacks.push(onResize);
                if (interaction) {
                    _this.setInteractions({
                        resizeCoordinates: true,
                    });
                }
                else {
                    result = _this.applyPostProcess({ name: 'resizeCoordinatesEnd', interaction: interaction, immediately: immediately, transitions: transitions }, result);
                    callbacks.push(onResizeEnd);
                }
                _this.updateState(result, {
                    transitions: immediately && transitions,
                }, callbacks);
            }
        };
        this.resizeCoordinatesEnd = function (options) {
            if (options === void 0) { options = {}; }
            var onResizeEnd = _this.getProps().onResizeEnd;
            var state = _this.getData().state;
            var _a = options.transitions, transitions = _a === void 0 ? true : _a, _b = options.immediately, immediately = _b === void 0 ? false : _b;
            _this.updateState(function () { return state && _this.applyPostProcess({ name: 'resizeCoordinatesEnd', transitions: transitions, immediately: immediately }, state); }, {
                transitions: transitions,
            }, [onResizeEnd]);
            _this.setInteractions({
                resizeCoordinates: false,
            });
        };
        this.getStencilCoordinates = function () {
            var state = _this.getData().state;
            return getStencilCoordinates(state);
        };
        this.getCoordinates = function (options) {
            if (options === void 0) { options = {}; }
            var state = _this.getData().state;
            var settings = _this.getProps().settings;
            if (state && state.coordinates) {
                var _a = options.round, round = _a === void 0 ? true : _a;
                if (round) {
                    return getRoundedCoordinates(state, settings);
                }
                else {
                    return __assign({}, state.coordinates);
                }
            }
            else {
                return null;
            }
        };
        this.getVisibleArea = function () {
            var state = _this.getData().state;
            if (state) {
                return __assign({}, state.visibleArea);
            }
            else {
                return null;
            }
        };
        this.getSettings = function () {
            var settings = _this.getProps().settings;
            return __assign({}, settings);
        };
        this.getState = function () {
            var state = _this.getData().state;
            return copyState(state);
        };
        this.getTransforms = function () {
            var state = _this.getData().state;
            return state
                ? deepClone(state.transforms)
                : {
                    rotate: 0,
                    flip: {
                        horizontal: false,
                        vertical: false,
                    },
                };
        };
        this.createDefaultState = function (boundary, image) {
            var _a = _this.getProps(), defaultTransforms = _a.defaultTransforms, createStateAlgorithm = _a.createStateAlgorithm, priority = _a.priority, settings = _a.settings;
            var transforms = image.transforms;
            if (defaultTransforms) {
                transforms = isFunction(defaultTransforms) ? defaultTransforms(image) : defaultTransforms;
            }
            return _this.applyPostProcess({
                name: 'createState',
                immediately: true,
                transitions: false,
            }, (createStateAlgorithm || createState)({
                boundary: boundary,
                imageSize: { width: image.width, height: image.height },
                transforms: transforms,
                priority: priority,
            }, settings));
        };
        this.isConsistent = function () {
            var state = _this.getData().state;
            var settings = _this.getProps().settings;
            return state ? isConsistentState(state, settings) : true;
        };
    }
    return AbstractCropper;
}());

export { AbstractCropper };
