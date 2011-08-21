/*
 * Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH
 * aloha-sales@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
GENTICS.Aloha.HighlightEditables = new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.highlighteditables");
GENTICS.Aloha.HighlightEditables.init = function () {
    var that = this;
    GENTICS.Utils.Position.addMouseMoveCallback(function () {
        for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
            var editable = GENTICS.Aloha.editables[i];
            if (!GENTICS.Aloha.activeEditable && !editable.isDisabled()) {
                editable.obj.addClass("GENTICS_editable_highlight")
            }
        }
    });
    GENTICS.Utils.Position.addMouseStopCallback(function () {
        that.fade()
    });
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableActivated", function (jEvent, aEvent) {
        aEvent.editable.obj.addClass("GENTICS_editable_active");
        that.fade()
    });
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableDeactivated", function (jEvent, aEvent) {
        aEvent.editable.obj.removeClass("GENTICS_editable_active")
    })
};
GENTICS.Aloha.HighlightEditables.fade = function () {
    for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
        var editable = GENTICS.Aloha.editables[i].obj;
        if (editable.hasClass("GENTICS_editable_highlight")) {
            editable.removeClass("GENTICS_editable_highlight").css("outline", "5px solid #FFE767").animate({
                outlineWidth: "0px"
            }, 300, "swing", function () {
                jQuery(this).css("outline", "")
            })
        }
    }
};
