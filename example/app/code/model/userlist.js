export default class Userlist {

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    email;

    /**
     * @param {string} name - Category name
     * @param {string} email - Sugested url path
     */
    constructor({ name, path: email }) {
        this.name = name;
        this.path = email;
    }
}