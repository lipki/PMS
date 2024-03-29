/*
 * Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH
 * aloha-sales@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
GENTICS.Aloha.Link = new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.Link");
GENTICS.Aloha.Link.languages = ["en", "de", "fr", "ru", "pl"];
GENTICS.Aloha.Link.config = ["a"];
GENTICS.Aloha.Link.targetregex = "";
GENTICS.Aloha.Link.target = "";
GENTICS.Aloha.Link.cssclassregex = "";
GENTICS.Aloha.Link.cssclass = "";
GENTICS.Aloha.Link.objectTypeFilter = [];
GENTICS.Aloha.Link.onHrefChange = null;
GENTICS.Aloha.Link.init = function () {
    if (GENTICS.Aloha.Link.settings.targetregex != undefined) {
        GENTICS.Aloha.Link.targetregex = GENTICS.Aloha.Link.settings.targetregex
    }
    if (GENTICS.Aloha.Link.settings.target != undefined) {
        GENTICS.Aloha.Link.target = GENTICS.Aloha.Link.settings.target
    }
    if (GENTICS.Aloha.Link.settings.cssclassregex != undefined) {
        GENTICS.Aloha.Link.cssclassregex = GENTICS.Aloha.Link.settings.cssclassregex
    }
    if (GENTICS.Aloha.Link.settings.cssclass != undefined) {
        GENTICS.Aloha.Link.cssclass = GENTICS.Aloha.Link.settings.cssclass
    }
    if (GENTICS.Aloha.Link.settings.objectTypeFilter != undefined) {
        GENTICS.Aloha.Link.objectTypeFilter = GENTICS.Aloha.Link.settings.objectTypeFilter
    }
    if (GENTICS.Aloha.Link.settings.onHrefChange != undefined) {
        GENTICS.Aloha.Link.onHrefChange = GENTICS.Aloha.Link.settings.onHrefChange
    }
    this.createButtons();
    this.subscribeEvents();
    this.bindInteractions()
};
GENTICS.Aloha.Link.createButtons = function () {
    var that = this;
    this.formatLinkButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_a",
        size: "small",
        onclick: function () {
            that.formatLink()
        },
        tooltip: this.i18n("button.addlink.tooltip"),
        toggle: true
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.formatLinkButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.format"), 1);
    this.insertLinkButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_a",
        size: "small",
        onclick: function () {
            that.insertLink(false)
        },
        tooltip: this.i18n("button.addlink.tooltip"),
        toggle: false
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.insertLinkButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.insert"), 1);
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("link"), "GENTICS.Aloha.continuoustext");
    this.browser = new GENTICS.Aloha.ui.Browser();
    this.browser.setObjectTypeFilter(GENTICS.Aloha.Link.objectTypeFilter);
    this.browser.onSelect = function (item) {
        that.hrefField.setItem(item);
        that.hrefChange()
    };
    this.repositoryButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button_big GENTICS_button_tree",
        size: "large",
        onclick: function () {
            that.browser.show()
        },
        tooltip: this.i18n("button.addlink.tooltip"),
        toggle: false
    });
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("link"), this.repositoryButton, this.i18n("floatingmenu.tab.link"), 1);
    this.hrefField = new GENTICS.Aloha.ui.AttributeField({
        width: 320
    });
    this.hrefField.setObjectTypeFilter(GENTICS.Aloha.Link.objectTypeFilter);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("link"), this.hrefField, this.i18n("floatingmenu.tab.link"), 1);
    this.removeLinkButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_a_remove",
        size: "small",
        onclick: function () {
            that.removeLink()
        },
        tooltip: this.i18n("button.removelink.tooltip")
    });
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("link"), this.removeLinkButton, this.i18n("floatingmenu.tab.link"), 1)
};
GENTICS.Aloha.Link.bindInteractions = function () {
    var that = this;
    this.hrefField.addListener("keyup", function (obj, event) {
        if (event.keyCode == 27) {
            var curval = that.hrefField.getQueryValue();
            if (curval[0] == "/" || curval.match(/^.*\.([a-z]){2,4}$/i) || curval[0] == "#" || curval.match(/^htt.*/i)) {} else {}
        }
        that.hrefChange()
    });
    this.hrefField.addListener("blur", function (obj, event) {
        if (this.getValue() == "") {
            that.removeLink()
        }
    });
    for (var i = 0; i < GENTICS.Aloha.editables.length; i++) {
        GENTICS.Aloha.editables[i].obj.keydown(function (e) {
            if (e.metaKey && e.which == 76) {
                if (that.findLinkMarkup()) {
                    GENTICS.Aloha.FloatingMenu.userActivatedTab = that.i18n("floatingmenu.tab.link");
                    GENTICS.Aloha.FloatingMenu.doLayout();
                    that.hrefField.focus()
                } else {
                    that.insertLink()
                }
                return false
            }
        });
        GENTICS.Aloha.editables[i].obj.find("a").each(function (i) {
            jQuery(this).mouseenter(function (e) {
                GENTICS.Aloha.Log.debug(GENTICS.Aloha.Link, "mouse over link.");
                that.mouseOverLink = this;
                that.updateMousePointer()
            });
            jQuery(this).mouseleave(function (e) {
                GENTICS.Aloha.Log.debug(GENTICS.Aloha.Link, "mouse left link.");
                that.mouseOverLink = null;
                that.updateMousePointer()
            });
            jQuery(this).click(function (e) {
                if (e.metaKey) {
                    GENTICS.Aloha.activeEditable.blur();
                    setTimeout(function () {
                        location.href = e.target
                    }, 0);
                    e.stopPropagation();
                    return false
                }
            })
        })
    }
    jQuery(document).keydown(function (e) {
        GENTICS.Aloha.Log.debug(GENTICS.Aloha.Link, "Meta key down.");
        that.metaKey = e.metaKey;
        that.updateMousePointer()
    });
    jQuery(document).keyup(function (e) {
        GENTICS.Aloha.Log.debug(GENTICS.Aloha.Link, "Meta key up.");
        that.metaKey = e.metaKey;
        that.updateMousePointer()
    })
};
GENTICS.Aloha.Link.updateMousePointer = function () {
    if (this.metaKey && this.mouseOverLink) {
        GENTICS.Aloha.Log.debug(GENTICS.Aloha.Link, "set pointer");
        jQuery(this.mouseOverLink).removeClass("GENTICS_link_text");
        jQuery(this.mouseOverLink).addClass("GENTICS_link_pointer")
    } else {
        jQuery(this.mouseOverLink).removeClass("GENTICS_link_pointer");
        jQuery(this.mouseOverLink).addClass("GENTICS_link_text")
    }
};
GENTICS.Aloha.Link.subscribeEvents = function () {
    var that = this;
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "selectionChanged", function (event, rangeObject) {
        if (GENTICS.Aloha.activeEditable) {
            var config = that.getEditableConfig(GENTICS.Aloha.activeEditable.obj);
            if (jQuery.inArray("a", config) != -1) {
                that.formatLinkButton.show();
                that.insertLinkButton.show()
            } else {
                that.formatLinkButton.hide();
                that.insertLinkButton.hide();
                return
            }
            var foundMarkup = that.findLinkMarkup(rangeObject);
            if (foundMarkup) {
                that.insertLinkButton.hide();
                that.formatLinkButton.setPressed(true);
                GENTICS.Aloha.FloatingMenu.setScope(that.getUID("link"));
                that.hrefField.setTargetObject(foundMarkup, "href")
            } else {
                that.formatLinkButton.setPressed(false);
                that.hrefField.setTargetObject(null)
            }
            GENTICS.Aloha.FloatingMenu.doLayout()
        }
    })
};
GENTICS.Aloha.Link.findLinkMarkup = function (range) {
    if (typeof range == "undefined") {
        var range = GENTICS.Aloha.Selection.getRangeObject()
    }
    if (GENTICS.Aloha.activeEditable) {
        return range.findMarkup(function () {
            return this.nodeName.toLowerCase() == "a"
        }, GENTICS.Aloha.activeEditable.obj)
    } else {
        return null
    }
};
GENTICS.Aloha.Link.formatLink = function () {
    var range = GENTICS.Aloha.Selection.getRangeObject();
    if (GENTICS.Aloha.activeEditable) {
        if (this.findLinkMarkup(range)) {
            this.removeLink()
        } else {
            this.insertLink()
        }
    }
};
GENTICS.Aloha.Link.insertLink = function (extendToWord) {
    if (this.findLinkMarkup(range)) {
        return
    }
    GENTICS.Aloha.FloatingMenu.userActivatedTab = this.i18n("floatingmenu.tab.link");
    var range = GENTICS.Aloha.Selection.getRangeObject();
    if (range.isCollapsed() && extendToWord != false) {
        GENTICS.Utils.Dom.extendToWord(range)
    }
    if (range.isCollapsed()) {
        var linkText = this.i18n("newlink.defaulttext");
        var newLink = jQuery('<a href="">' + linkText + "</a>");
        GENTICS.Utils.Dom.insertIntoDOM(newLink, range, jQuery(GENTICS.Aloha.activeEditable.obj));
        range.startContainer = range.endContainer = newLink.contents().get(0);
        range.startOffset = 0;
        range.endOffset = linkText.length
    } else {
        var newLink = jQuery('<a href=""></a>');
        GENTICS.Utils.Dom.addMarkup(range, newLink, false)
    }
    range.select();
    this.hrefField.focus();
    this.hrefChange()
};
GENTICS.Aloha.Link.removeLink = function () {
    var range = GENTICS.Aloha.Selection.getRangeObject();
    var foundMarkup = this.findLinkMarkup();
    if (foundMarkup) {
        GENTICS.Utils.Dom.removeFromDOM(foundMarkup, range, true);
        GENTICS.Aloha.activeEditable.obj[0].focus();
        range.select()
    }
};
GENTICS.Aloha.Link.hrefChange = function () {
    this.hrefField.setAttribute("target", this.target, this.targetregex, this.hrefField.getQueryValue());
    this.hrefField.setAttribute("class", this.cssclass, this.cssclassregex, this.hrefField.getQueryValue());
    if (typeof this.onHrefChange == "function") {
        this.onHrefChange.call(this, this.hrefField.getTargetObject(), this.hrefField.getQueryValue(), this.hrefField.getItem())
    }
    GENTICS.Aloha.EventRegistry.trigger(new GENTICS.Aloha.Event("hrefChanged", GENTICS.Aloha, {
        obj: this.hrefField.getTargetObject(),
        href: this.hrefField.getQueryValue(),
        item: this.hrefField.getItem()
    }))
};
GENTICS.Aloha.Link.makeClean = function (obj) {
    obj.find("a").each(function () {
        jQuery(this).removeClass("GENTICS_link_pointer");
        jQuery(this).removeClass("GENTICS_link_text")
    })
};
