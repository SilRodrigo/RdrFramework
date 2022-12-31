import FrameworkAbstractModel from "../../../../abstract.js";
import UserlistModel from "../model/userlist.js";

export default class Userlist extends FrameworkAbstractModel {

    #paths = {
        provider_url: '/example/mock-api/userlist'
    }

    get paths(){
        return this.#paths;
    }

    /**
     * @type {Array<UserlistModel>}
     */
    users = [];

    userlist_title = 'Lista de usuários';
}