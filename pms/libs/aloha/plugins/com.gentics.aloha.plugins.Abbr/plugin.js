/*
 * Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH
 * aloha-sales@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
GENTICS.Aloha.Abbr = new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.Abbr");
GENTICS.Aloha.Abbr.languages = ["en", "de"];
GENTICS.Aloha.Abbr.config = ["abbr"];
GENTICS.Aloha.Abbr.init = function () {
    this.createButtons();
    this.subscribeEvents();
    this.bindInteractions()
};
GENTICS.Aloha.Abbr.createButtons = function () {
    var that = this;
    this.formatAbbrButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_abbr",
        size: "small",
        onclick: function () {
            that.formatAbbr()
        },
        tooltip: this.i18n("button.abbr.tooltip"),
        toggle: true
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.formatAbbrButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.format"), 1);
    this.insertAbbrButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_abbr",
        size: "small",
        onclick: function () {
            that.insertAbbr(false)
        },
        tooltip: this.i18n("button.addabbr.tooltip"),
        toggle: false
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.insertAbbrButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.insert"), 1);
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("abbr"), "GENTICS.Aloha.continuoustext");
    this.abbrField = new GENTICS.Aloha.ui.AttributeField({
        width: 320
    });
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("abbr"), this.abbrField, this.i18n("floatingmenu.tab.abbr"), 1)
};
GENTICS.Aloha.Abbr.bindInteractions = function () {
    var that = this;
    this.abbrField.addListener("blur", function (obj, event) {
        if (this.getValue() == "") {
            that.removeAbbr()
        }
    });
    for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
        GENTICS.Aloha.editables[i].obj.keydown(function (e) {
            if (e.metaKey && e.which == 71) {
                if (that.findAbbrMarkup()) {
                    GENTICS.Aloha.FloatingMenu.userActivatedTab = that.i18n("floatingmenu.tab.abbr");
                    GENTICS.Aloha.FloatingMenu.doLayout();
                    that.abbrField.focus()
                } else {
                    that.insertAbbr()
                }
                return false
            }
        })
    }
};
GENTICS.Aloha.Abbr.subscribeEvents = function () {
    var that = this;
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "selectionChanged", function (event, rangeObject) {
        if (GENTICS.Aloha.activeEditable) {
            var config = that.getEditableConfig(GENTICS.Aloha.activeEditable.obj);
            if (jQuery.inArray("abbr", config) != -1) {
                that.formatAbbrButton.show();
                that.insertAbbrButton.show()
            } else {
                that.formatAbbrButton.hide();
                that.insertAbbrButton.hide();
                return
            }
            var foundMarkup = that.findAbbrMarkup(rangeObject);
            if (foundMarkup) {
                that.insertAbbrButton.hide();
                that.formatAbbrButton.setPressed(true);
                GENTICS.Aloha.FloatingMenu.setScope(that.getUID("abbr"));
                that.abbrField.setTargetObject(foundMarkup, "title")
            } else {
                that.formatAbbrButton.setPressed(false);
                that.abbrField.setTargetObject(null)
            }
            GENTICS.Aloha.FloatingMenu.doLayout()
        }
    })
};
GENTICS.Aloha.Abbr.findAbbrMarkup = function (range) {
    if (typeof range == "undefined") {
        var range = GENTICS.Aloha.Selection.getRangeObject()
    }
    if (GENTICS.Aloha.activeEditable) {
        return range.findMarkup(function () {
            return this.nodeName.toLowerCase() == "abbr"
        }, GENTICS.Aloha.activeEditable.obj)
    } else {
        return null
    }
};
GENTICS.Aloha.Abbr.formatAbbr = function () {
    var range = GENTICS.Aloha.Selection.getRangeObject();
    if (GENTICS.Aloha.activeEditable) {
        if (this.findAbbrMarkup(range)) {
            this.removeAbbr()
        } else {
            this.insertAbbr()
        }
    }
};
GENTICS.Aloha.Abbr.insertAbbr = function (extendToWord) {
    if (this.findAbbrMarkup(range)) {
        return
    }
    GENTICS.Aloha.FloatingMenu.userActivatedTab = this.i18n("floatingmenu.tab.abbr");
    var range = GENTICS.Aloha.Selection.getRangeObject();
    if (range.isCollapsed() && extendToWord != false) {
        GENTICS.Utils.Dom.extendToWord(range)
    }
    if (range.isCollapsed()) {
        var abbrText = this.i18n("newabbr.defaulttext");
        var newAbbr = jQuery('<abbr title="">' + abbrText + "</abbr>");
        GENTICS.Utils.Dom.insertIntoDOM(newAbbr, range, jQuery(GENTICS.Aloha.activeEditable.obj));
        range.startContainer = range.endContainer = newAbbr.contents().get(0);
        range.startOffset = 0;
        range.endOffset = abbrText.length
    } else {
        var newAbbr = jQuery('<abbr title=""></abbr>');
        GENTICS.Utils.Dom.addMarkup(range, newAbbr, false)
    }
    range.select();
    this.abbrField.focus()
};
GENTICS.Aloha.Abbr.removeAbbr = function () {
    var range = GENTICS.Aloha.Selection.getRangeObject();
    var foundMarkup = this.findAbbrMarkup();
    if (foundMarkup) {
        GENTICS.Utils.Dom.removeFromDOM(foundMarkup, range, true);
        GENTICS.Aloha.activeEditable.obj[0].focus();
        range.select()
    }
};
GENTICS.Aloha.Abbr.makeClean = function (obj) {};
