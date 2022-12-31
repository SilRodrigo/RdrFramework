import FrameworkAbstractModel from './abstract.js';
import Core from './provider/core.js';

/**
 * @param {Array<FrameworkAbstractModel>} model_list
 */
export default (...model_list) => {
    if (!model_list || !model_list.length) return;

    model_list.forEach(model => {
        if (!model instanceof FrameworkAbstractModel) {
            console.warn(model);
            throw ('A injeção informada deve extender FrameworkAbstractModel');
        }
        Core.inject(new model);
    })
}