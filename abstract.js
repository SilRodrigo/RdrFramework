/**
 * Abstract Class FrameworkAbstractModel.
 * You must extend this class to use this framework
 *
 * @class FrameworkAbstractModel
 */
export default class FrameworkAbstractModel {

    #paths = {
        provider_url: '/consume/path'
    }

    #headers = {
        'content-type': 'application/json'
    }

    #module_name = this.constructor.name.toLowerCase();

    #loaded_content = false;

    get loaded_content() {
        return this.#loaded_content;
    }

    /**
     * @param {boolean} value
     */
    set loaded_content(value) {
        this.#loaded_content = value;
    }

    /**
     * @param {JSON} data
     * @returns boolean
     */
    #populate(data) {
        if (typeof data !== 'object') return false;
        for (const key in data) { this[key] = data[key] };
        return true;
    }

    constructor() {
        if (this.constructor == FrameworkAbstractModel) {
            throw new Error("Abstract classes can't be instantiated.");
        }
        this.loaded_content = false;
    }

    /**
     * @returns JSON
     */
    get paths() {
        return this.#paths;
    }

    /**
     * @returns JSON
     */
    get headers() {
        return this.#headers;
    }


    /**
     * @returns boolean
     */
    get populate() {
        return this.#populate;
    }

    /**
     * @returns string
     */
    get module_name() {
        return this.#module_name;
    }

    startLoading() {
        document.querySelectorAll(`[${framework.prefix}-container="${this.#module_name}"]`).forEach(element => {
            if (element.hasAttribute(framework.prefix + '-load')) element.classList.add('loading');
        })
    }

    stopLoading() {
        document.querySelectorAll(`[${framework.prefix}-container="${this.#module_name}"]`).forEach(element => {
            if (element.hasAttribute(framework.prefix + '-load')) element.classList.remove('loading');
        })
    }

    /**
     * @returns boolean
     */
    async update() {
        this.startLoading();
        let response = await this.consume();
        this.stopLoading();
        return response;
    }

    /**
     * @returns boolean
     */
    async consume() {
        if (!this.paths.provider_url) return true;
        let response = await fetch(this.paths.provider_url);
        if (response.status !== 200) return false;
        response = await response.json();
        return this.populate(typeof response === 'string' ? JSON.parse(response) : response);
    }
}