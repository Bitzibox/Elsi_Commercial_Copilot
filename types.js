
export var AppMode;
(function (AppMode) {
    AppMode["DASHBOARD"] = "DASHBOARD";
    AppMode["CHAT"] = "CHAT";
    AppMode["VOICE"] = "VOICE";
    AppMode["DOCUMENTS"] = "DOCUMENTS";
    AppMode["QUOTES"] = "QUOTES";
    AppMode["SETTINGS"] = "SETTINGS";
})(AppMode || (AppMode = {}));

export var ArtifactType;
(function (ArtifactType) {
    ArtifactType["QUOTE"] = "QUOTE";
    ArtifactType["ACTION_PLAN"] = "ACTION_PLAN";
    ArtifactType["TABLE"] = "TABLE";
    ArtifactType["REPORT"] = "REPORT";
})(ArtifactType || (ArtifactType = {}));

// Interface definitions are preserved for TS compilation in browser
export {};
