import 'tslib';
import '../types';
import './setCoordinates.js';
import { rotateImageAlgorithm } from '../algorithms/rotateImageAlgorithm.js';
import { flipImageAlgorithm } from '../algorithms/flipImageAlgorithm.js';
import { transformImageAlgorithm } from '../algorithms/transformImageAlgorithm.js';

function transformImage(state, settings, transform) {
    if (transform.rotate) {
        state = rotateImageAlgorithm(state, settings, transform.rotate);
    }
    if (transform.flip) {
        state = flipImageAlgorithm(state, settings, transform.flip.horizontal, transform.flip.vertical);
    }
    if (transform.move || transform.scale) {
        state = transformImageAlgorithm(state, settings, transform);
    }
    return state;
}

export { transformImage };
