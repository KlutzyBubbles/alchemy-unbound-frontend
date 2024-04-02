export enum RecipeChannel {
    INSERT = 'recipe:insert',
    DELETE = 'recipe:delete',
    GET = 'recipe:get',
    GET_ALL = 'recipe:getAll',
    GET_FOR = 'recipe:getFor',
    SAVE = 'recipe:save',
    HAS_ALL = 'recipe:hasAll',
}

export enum ServerChannel {
    COMBINE = 'server:combine',
    GET_TOKEN = 'server:getToken'
}

export enum ErrorChannel {
    REGISTER = 'error:register',
    GET_ALL = 'error:getAll'
}

export enum ImportExportChannel {
    RESET = 'io:reset',
    IMPORT = 'io:import',
    EXPORT = 'io:export'
}

export enum SettingsChannel {
    LOAD = 'settings:load',
    SET = 'settings:set',
    SET_VALUE = 'settings:setSetting',
    GET = 'settings:get',
    SAVE = 'settings:save'
}

export enum HintChannel {
    LOAD = 'hint:load',
    SAVE = 'hint:save',
    ADD_POINT = 'hint:addPoint',
    GET = 'hint:get',
    GET_MAX = 'hint:getMax',
    GET_LEFT = 'hint:getLeft',
    RESET = 'hint:reset',
    COMPLETE = 'hint:complete',
}

export enum StatsChannel {
    LOAD = 'stats:load',
    SET = 'stats:set',
    SET_VALUE = 'stats:setStat',
    GET = 'stats:get',
    SAVE = 'stats:save'
}

export enum GenericChannel {
    GET_VERSIONS = 'generic:getVersions',
    GET_SYSTEM_INFO = 'generic:getSystemInfo',
    GET_IS_PACKAGED = 'generic:isPackaged',
    QUIT = 'generic:quit',
}

export enum DisplayChannel {
    GET_DISPLAYS = 'display:get',
    GET_DISPLAY = 'display:getCurrent',
    SET_DISPLAY = 'display:set',
    SET_FULLSCREEN = 'display:fullscreen',
}

export enum SteamChannel {
    ACTIVATE_ACHIEVEMENT = 'steam:activateAchievement',
    CHECK_ACHIEVEMENT = 'steam:checkAchievement',
    GET_ID = 'steam:getId',
    GET_LANGUAGE = 'steam:getLanguage',
    CHECK_DLC = 'steam:isDlcInstaled',
}
