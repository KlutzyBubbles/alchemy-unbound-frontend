export enum RecipeChannel {
    INSERT = 'recipe:insert',
    DELETE = 'recipe:delete',
    GET = 'recipe:get',
    COMBINE = 'recipe:combine',
    GET_ALL = 'recipe:getAll',
    SAVE = 'recipe:save'
}

export enum SettingsChannel {
    LOAD = 'settings:load',
    SET = 'settings:set',
    SET_VALUE = 'settings:setSetting',
    GET = 'settings:get',
    SAVE = 'settings:save'
}
