import { deepClone } from '../utils';

function copyState(state) {
    return deepClone(state);
}

export { copyState };
