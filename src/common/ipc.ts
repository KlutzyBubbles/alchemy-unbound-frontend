export enum RecipeChannel {
    INSERT = 'recipe:insert',
    DELETE = 'recipe:delete',
    GET = 'recipe:get',
    GET_ALL = 'recipe:getAll',
    GET_FOR = 'recipe:getFor',
    SAVE = 'recipe:save',
    HAS_ALL = 'recipe:hasAll',
    HAS_ATLEAST = 'recipe:hasAtleast',
    SYNC_INFO = 'recipe:syncInfo',
    COUNT_BASE_RECIPES = 'recipe:countBaseRecipes',
    COUNT_BASE_RESULTS = 'recipe:countBaseResults',
}

export enum ServerChannel {
    COMBINE = 'server:combine',
    ADD_ITEM = 'server:addItem',
    GET_TOKEN = 'server:getToken',
    GET_VERSION = 'server:getVersion',
    GET_ENDPOINT = 'server:getEndpoint',
    INIT_TRANSACTION = 'server:initTransaction',
    FINALIZE_TRANSACTION = 'server:finalizeTransaction',
    GET_USER_INFO = 'server:getUserInfo',
    CHECK_DLC = 'server:checkDLC',
    RESTORE_PURCHASES = 'server:restore',
    GET_MISSION = 'server:getMission'
}

export enum ErrorChannel {
    REGISTER = 'error:register',
    GET_ALL = 'error:getAll'
}

export enum ProfileChannel {
    SWITCH = 'profile:switch'
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
    FILL = 'hint:fill',
}

export enum StatsChannel {
    LOAD = 'stats:load',
    SET = 'stats:set',
    SET_VALUE = 'stats:setStat',
    GET = 'stats:get',
    SAVE = 'stats:save'
}

export enum InfoChannel {
    LOAD = 'info:load',
    SET = 'info:set',
    SET_VALUE = 'info:setInfoKey',
    GET = 'info:get',
    SAVE = 'info:save',
    ADD_THEME = 'info:addTheme',
    REMOVE_THEME = 'info:removeTheme'
}

export enum GenericChannel {
    GET_VERSIONS = 'generic:getVersions',
    GET_FILE_VERSIONS = 'generic:getFileVersions',
    GET_SYSTEM_INFO = 'generic:getSystemInfo',
    GET_IS_PACKAGED = 'generic:isPackaged',
    QUIT = 'generic:quit',
}

export enum DisplayChannel {
    GET_DISPLAYS = 'display:get',
    GET_DISPLAY = 'display:getCurrent',
    SET_DISPLAY = 'display:set',
    SET_FULLSCREEN = 'display:fullscreen',
    GET_FULLSCREEN = 'display:isFullscreen'
}

export enum SteamChannel {
    ACTIVATE_ACHIEVEMENT = 'steam:activateAchievement',
    CHECK_ACHIEVEMENT = 'steam:checkAchievement',
    GET_ID = 'steam:getId',
    GET_LANGUAGE = 'steam:getLanguage',
    CHECK_DLC = 'steam:isDlcInstaled',
    GET_NAME = 'steam:getName',
    OPEN_DLC = 'steam:openDLC'
}
