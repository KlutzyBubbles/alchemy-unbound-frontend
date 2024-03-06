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
}
