var _R = document;

const rdr = window.rdr = new class Framework {

    CONFIG = {
        DEFAULT_NAME: {
            prefix: 'rdr'
        }
    }

    #prefix = this.CONFIG.DEFAULT_NAME.prefix;

    #isLoaded = false;

    #messages = {
        INVALID_SCOPE: 'Propriedade informada na DOM não existe: ',
        INVALID_FUNCTION: 'Função inválida na DOM, verifique: ',
        MODEL_EXEC_FAILURE: 'Falha de execução no model: '
    }

    #actions = [
        { attribute: `${this.#prefix}-if`, function: 'if', priority: 0 },
        { attribute: `${this.#prefix}-each`, function: 'each', priority: 1 },
        { attribute: `${this.#prefix}-set`, function: 'set', priority: 2 },
        { attribute: `${this.#prefix}-get`, function: 'get', priority: 3 },
    ]

    #base_html_templates = new Map();

    /**
     * @returns {Map} base_html_templates
     */
    get base_html_templates() {
        return this.#base_html_templates;
    }

    /**
     * @param {Map} value
     */
    set base_html_templates(value) {
        this.#base_html_templates = value;
    }

    #models = new Map();

    /**
     * @returns {Map} models
     */
    get models() {
        return this.#models;
    }

    /**
     * @param {Map} value
     */
    set models(value) {
        this.#models = value;
    }

    async #load() {
        for (const key in this) {
            if (!this.isContentLoaded() && document.querySelector('[' + this.#prefix + '-container="' + key + '"]')) {
                let response = await this.#updateProperties(this[key]);
                this.models.set(key, this[key]);
            };
        }
        this.#prepare();
    }

    /**
     * @param {FrameworkAbstractModel} obj
     * @returns boolean
     */
    async #updateProperties(obj) {
        if (obj.update) {
            let response;
            try {
                response = await obj.update();
            } catch (error) {
                console.log(error);
                console.warn(this.#messages.MODEL_EXEC_FAILURE + obj?.constructor.name);
                response = false;
            }
            if (response) obj.loaded_content = true;
            return response;
        }
        return false;

    }

    #prepare() {

        _R.querySelectorAll('[' + this.#prefix + '-container]').forEach(element => {
            let integrity = this[element.getAttribute(this.#prefix + '-container')];
            if (integrity && integrity.loaded_content) {
                this.#base_html_templates.set(element.getAttribute(this.#prefix + '-container'), element.cloneNode(true));
                this.#render(element, element.getAttribute(this.#prefix + '-container'));
                return;
            }
            return element.remove();
        });

        _R.querySelectorAll('[' + this.#prefix + '-function]').forEach(element => {
            this.#applyFunction(element);
        });
    }

    /**
     * @param {HTMLElement} element
     * @param {string} scope
     */
    #render(element, scope) {
        let child = element.querySelector('[' + this.#prefix + '-container]');
        if (child) {
            this.#render(child, scope + '.' + child.getAttribute(this.#prefix + '-container'));
        }
        try {
            this.#process(this.#pre_process(element), scope);
        } catch (error) {
            console.warn(error);
        }
    }

    /**
     * @param {HTMLElement} element
     */
    #pre_process(element) {
        let actions = [];
        this.#actions.forEach(action => {
            let query_elements = element.querySelectorAll(`[${action.attribute}]:not([${this.#prefix}-rendered])`);
            if (query_elements.length === 0) return;
            actions.push({ query_elements: query_elements, function_name: action.function, priority: action.priority });
        });

        actions.sort((a, b) => {
            if (a.priority < b.priority) {
                return -1;
            }
            if (a.priority > b.priority) {
                return 1;
            }
            return 0;
        });
        return actions;
    }

    /**
     * @param {Array<object>} actions
     * @param {string} scope
     */
    #process(actions, scope) {
        actions.forEach(action => {
            action.query_elements.forEach(element => {
                this[action.function_name](element, scope);
            })
        });
    }

    /**
     * @param {object|string} scope
     * @param {string} concatenate
     * @returns {object}
     */
    #retrieveScope(scope, concatenate) {
        if (typeof scope === 'object') {
            if (!concatenate) return scope;

            try {
                let new_scope;
                concatenate = concatenate.split('.');
                concatenate.forEach(suffix_scope => {
                    new_scope = scope[suffix_scope];
                });
                return new_scope;
            } catch (error) {
                console.warn('#retrieveScope error.');
                console.warn('Erro ao recuperar escopo com parâmetro concatenado.');
            }
        };

        if (concatenate) scope += '.' + concatenate;

        let split_scope = scope.split('.'),
            scope_index = this;

        for (let index = 0; index < split_scope.length; index++) {
            try {
                const element = split_scope[index];
                scope_index = scope_index[element];
            } catch (error) {
                console.warn(this.#messages.INVALID_SCOPE + ', elemento:' + element + ', escopo:' + scope);
                scope_index = false;
                break;
            }
        }

        return scope_index;
    }

    /**
     * @param {object} scope
     * @param {string} property
     */
    #evalProperty(scope, property) {
        if (typeof scope !== 'object' || !property || typeof property !== 'string') return;
        property = property.split('.');
        if (property.length === 1) return scope[property];
        property.forEach(p => {
            if (scope) scope = scope[p];
        });
        return scope;
    }

    /**
     * @param {HTMLElement} element
     */
    #applyFunction(element) {
        let function_string = element.getAttribute(this.#prefix + '-function'),
            function_exec = new Function('value', 'return ' + function_string);

        try {
            if (element.tagName.toLowerCase() === 'a') return element.href = function_exec(element.getAttribute("href"));
            if (element.tagName.toLowerCase() === 'img') return element.src = function_exec(element.getAttribute("src"));
            if (element.value != null) return element.value = function_exec(element.value);
            return element.innerText = function_exec(element.innerText);

        } catch (error) {
            console.log(error)
            console.warn(this.#messages.INVALID_FUNCTION + ': ' + function_string);
        }
    }

    /**
     * @param {HTMLElement} element
     * @param {string} value
     */
    #insertValue(element, value) {
        if (element.tagName.toLowerCase() === 'img') return element.src = value;
        if (element.tagName.toLowerCase() === 'a') return element.href = value;
        if (element.value != null) return element.value = value;
        return element.innerText = value || '';
    }

    /**
     * @param {HTMLElement} element
     * @param {string} scope
     */
    #get(element, scope) {
        if (element.hasAttribute(this.#prefix + '-rendered') || !document.body.contains(element)) return;

        /* Strict to 'a' tag */
        if (element.tagName === 'A') {
            let inner_elements = element.querySelectorAll('[' + this.#prefix + '-get]');
            if (inner_elements) inner_elements.forEach(element => this.#get(element, scope));
        }

        let cloned_element = element.cloneNode(true),
            property_name = element.getAttribute(this.#prefix + '-get'),
            obj_scope = this.#retrieveScope(scope),
            property_value = this.#evalProperty(obj_scope, property_name);


        if (!property_value) property_value = '';

        this.#insertValue(cloned_element, property_value);
        cloned_element.setAttribute(this.#prefix + '-rendered', '');
        element.before(cloned_element);
        element.remove();
    }

    /**
     * @param {HTMLElement} element
     * @param {string|object} scope
     */
    #each(element, scope) {
        let _this = this,
            object_list;
        if (!document.body.contains(element)) return;

        object_list = this.#retrieveScope(scope, element.getAttribute(this.#prefix + '-each'));

        if (!object_list || !object_list.forEach || object_list.length === 0) return element.remove();

        object_list.forEach(single_object => populate(single_object, element));

        element.remove();

        function populate(object_properties, iterable_container) {
            let cloned_element = iterable_container.cloneNode(true);
            let actions = _this.#pre_process(cloned_element);
            iterable_container.before(cloned_element);

            actions.forEach(action => {
                action.query_elements.forEach(element => {
                    _this[action.function_name](element, object_properties);
                })
            });

            cloned_element.setAttribute(_this.#prefix + '-rendered', '');
        }
    }

    /**
     * @param {HTMLElement} element
     * @param {string} scope
     */
    #if(element, scope) {
        try {
            let validate_rule = element.getAttribute(this.#prefix + '-if'),
                validation_function = new Function('if (' + validate_rule + ') {return !0} else {return!1}'),
                validation_response = validation_function.apply(this.#retrieveScope(scope));
            if (!validation_response) element.remove();
        } catch (error) {
            element.remove();
            console.warn(this.#messages.INVALID_FUNCTION + ', elemento:' + element + ', escopo:' + scope);
        }
    }

    /**
     * @param {HTMLElement} element
     * @param {string} scope
     */
    #set(element, scope) {
        if (element.hasAttribute(this.#prefix + '-setted')) return;

        let setting_changes = element.getAttribute(this.#prefix + '-set');

        if (!setting_changes) return;

        setting_changes = setting_changes.split(',');

        let scope_properties = this.#retrieveScope(scope);

        try {
            setting_changes.forEach(setting => {
                let split_setting = setting.split(`=`),
                    attribute = split_setting[0].trim(),
                    value = scope_properties[split_setting[1].trim()];

                if (!value) return;

                let FUNCTION_PATTERN = 'element[attribute] = value';
                if (attribute.search('^data-') === 0) FUNCTION_PATTERN = `element.dataset['${attribute.split('-')[1]}'] = value`;

                let function_exec = new Function('element', 'attribute', 'value', FUNCTION_PATTERN);
                function_exec(element, attribute, value);
                element.setAttribute(this.#prefix + '-setted', '');
            });
        } catch (error) {
            console.warn(this.#messages.INVALID_FUNCTION + ', elemento:' + element + ', escopo:' + scope);
            element.remove();
        }
    }

    /**
     * @param {FrameworkAbstractModel} model
     * @param {string} model_name
     */
    async #updateModel(model, model_name) {
        model.loaded_content = false;
        let base_dom = this.base_html_templates.get(model_name).cloneNode(true),
            old_dom = document.querySelector('[' + this.#prefix + '-container="' + model_name + '"]');
        if (!this.isContentLoaded() && old_dom) {
            let response = await this.#updateProperties(model);
            this.models.set(model_name, model);
            old_dom.before(base_dom);
            old_dom.remove();
            this.#render(base_dom, model_name);
            base_dom.querySelectorAll('[' + this.#prefix + '-function]').forEach(func => {
                this.#applyFunction(func);
            })
        };
    }

    #updateAllModels() {
        this.models.forEach((model, key) => {
            this.#updateModel(model, key.toLowerCase());
        })
    }

    constructor() {
        window.addEventListener('load', async () => {
            this.#load();
            this.#isLoaded = true;
        })
    }

    /**
     * @param {FrameworkAbstractModel} injection
     */
    inject(injection) {
        injection.loaded_content = false;
        this[injection.constructor.name.toLowerCase()] = injection;
    }

    isContentLoaded() {
        for (const key in this) {
            if (this[key].loaded_content === false) return false;
        }
        return true;
    }

    get get() {
        return this.#get;
    }

    get each() {
        return this.#each;
    }

    get if() {
        return this.#if;
    }

    get set() {
        return this.#set;
    }

    get prefix() {
        return this.#prefix;
    }

    /**
     * @param {string} model_name
     */
    update(model_name) {
        let model = this.models.get(model_name);
        if (model) return this.#updateModel(model, model_name);
        return this.#updateAllModels();
    }

}

export default rdr;