import Core from './provider/core.js';

/**
 * @param {Array<FrameworkAbstractModel>} model_list
 */
export default (...model_list) => {
    if (!model_list || !model_list.length) return;

    model_list.forEach(model => {
        Core.inject(new model);
    })
}