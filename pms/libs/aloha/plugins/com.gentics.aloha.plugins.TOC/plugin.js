(function () {
    var deps = GENTICS.Aloha.TOC || {
        jQuery: jQuery
    },
        $ = deps.jQuery;

    function last(a) {
        return a[a.length - 1]
    }
    function head(a) {
        return a[0]
    }
    function tail(a) {
        return a.slice(1)
    }
    function indexOf(a, item) {
        return detect(a, function (cmp) {
            return cmp === item
        })
    }
    function detect(a, f) {
        for (var i = 0; i < a.length; i++) {
            if (f(a[i])) {
                return a[i]
            }
        }
        return null
    }
    function map(a, f) {
        var result = [];
        for (var i = 0; i < a.length; i++) {
            result.push(f(a[i]))
        }
        return result
    }
    function each(a, f) {
        map(a, f)
    }
    var namespace = "com.gentics.aloha.plugins.TOC";
    var TOC = GENTICS.Aloha.TOC = new GENTICS.Aloha.Plugin(namespace);
    GENTICS.Aloha.TOC.languages = ["en", "de"];
    var $containers = null;
    var allTocs = [];
    TOC.init = function () {
        var s = TOC.settings;
        s.updateInterval = s.updateInterval || 5000;
        s.minEntries = s.minEntries || 0;
        TOC.initButtons();
        $(document).ready(function () {
            TOC.spawn()
        })
    };
    TOC.initButtons = function () {
        TOC.insertTocButton = new GENTICS.Aloha.ui.Button({
            iconClass: "GENTICS_button GENTICS_button_ul",
            size: "small",
            onclick: function () {
                TOC.insertAtSelection($containers)
            },
            tooltip: this.i18n("button.addtoc.tooltip"),
            toggle: false
        });
        GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.insertTocButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.insert"), 1)
    };
    TOC.register = function ($c) {
        $containers = $c
    };
    TOC.generateId = function (elemOrText) {
        var validId;
        if (typeof elemOrText == "object") {
            validId = $(elemOrText).text().replace(/[^a-zA-Z-]+/g, "-").replace(/^[^a-zA-Z]+/, "")
        } else {
            if (elemOrText) {
                validId = elemOrText
            }
        }
        for (var uniquifier = 0;; uniquifier++) {
            var uniqueId = validId;
            if (uniquifier) {
                uniqueId += "-" + uniquifier
            }
            var conflict = document.getElementById(uniqueId);
            if (!conflict || (typeof elemOrText == "object" && conflict === elemOrText)) {
                return uniqueId
            }
        }
    };
    TOC.outline = function (ctx) {
        var rootNode = [$()];
        var potentialParents = [rootNode];
        TOC.headings(ctx).each(function () {
            var $heading = $(this);
            var nodeName = this.nodeName.toLowerCase();
            var hLevels = ["h6", "h5", "h4", "h3", "h2", "h1"];
            var currLevel = $.inArray(nodeName, hLevels);
            var higherEq = hLevels.slice(currLevel).join(",");
            var $section = $heading.nextUntil(higherEq).andSelf();
            var node = [$section];
            var parent = detect(potentialParents, function (parent) {
                var parentSection = parent[0];
                return !parentSection.length || detect(parentSection, function (sectionElem) {
                    return $heading.get(0) === sectionElem || $.contains(sectionElem, $heading.get(0))
                })
            });
            parent.push(node);
            potentialParents.splice(0, indexOf(potentialParents, parent), node)
        });
        return rootNode
    };
    TOC.editableContainers = function () {
        return $(map(GENTICS.Aloha.editables, function (editable) {
            return document.getElementById(editable.getId())
        }))
    };
    TOC.headings = function ($ctx) {
        return $ctx.find(":header").add($ctx.filter(":header"))
    };
    TOC.anchorFromLinkId = function ($ctx, linkId) {
        return linkId ? $ctx.find('a[href $= "#' + linkId + '"]') : $()
    };
    TOC.linkIdFromAnchor = function ($anchor) {
        var href = $anchor.attr("href");
        return href ? href.match(/#(.*?)$/)[1] : null
    };
    TOC.insertAtSelection = function ($containers) {
        $containers = $containers || TOC.editableContainers();
        var id = TOC.generateId("toc");
        var $tocElement = $("<ol class='toc_root'></ol>").attr("id", id).attr("contentEditable", "false");
        var range = GENTICS.Aloha.Selection.getRangeObject();
        var tocEditable = GENTICS.Aloha.activeEditable;
        var $tocContainer = $(document.getElementById(tocEditable.getId()));
        GENTICS.Utils.Dom.insertIntoDOM($tocElement, range, $tocContainer);
        TOC.create(id).register($containers).update().tickTock()
    };
    TOC.spawn = function ($ctx, $containers) {
        $ctx = $ctx || $("body");
        $containers = $containers || TOC.editableContainers();
        $ctx.find("ol.toc_root").each(function () {
            var id = $(this).attr("id");
            if (!id) {
                id = TOC.generateId("toc");
                $(this).attr("id", id)
            }
            TOC.create(id).register($containers).tickTock()
        })
    };
    TOC.create = function (id) {
        allTocs.push(this);
        return {
            id: id,
            "$containers": $(),
            root: function () {
                return $(document.getElementById(this.id))
            },
            register: function ($containers) {
                var self = this;
                self.$containers = self.$containers.add($containers);
                self.$containers.filter(function () {
                    return !$(this).data(namespace + "." + self.id + ".listening")
                }).each(function () {
                    var $container = $(this);
                    $container.data(namespace + "." + self.id + ".listening", true);
                    $container.bind("blur", function () {
                        self.cleanupIds($container.get(0));
                        self.update($container)
                    })
                });
                return self
            },
            tickTock: function (interval) {
                var self = this;
                interval = interval || TOC.settings.updateInterval;
                if (!interval) {
                    return
                }
                window.setInterval(function () {
                    self.register(TOC.editableContainers());
                    self.update()
                }, interval);
                return self
            },
            cleanupIds: function (ctx) {
                var ids = [];
                TOC.headings(this.$containers).each(function () {
                    var id = $(this).attr("id");
                    if ((id && -1 != $.inArray(id, ids)) || (ctx && ($.contains(ctx, this) || ctx === this))) {
                        $(this).attr("id", TOC.generateId(this))
                    }
                    ids.push(id)
                });
                return this
            },
            update: function ($ctx) {
                var self = this;
                $ctx = $ctx || self.$containers;
                var outline = TOC.outline(self.$containers);
                var ancestors = [self.root()];
                var prevSiblings = [];
                last(ancestors).empty();
                (function descend(outline) {
                    var prevSiblings = [];
                    each(outline, function (node) {
                        var $section = head(node);
                        var $entry = self.linkSection($section, ancestors, prevSiblings);
                        ancestors.push($entry);
                        descend(tail(node));
                        ancestors.pop();
                        prevSiblings.push($entry)
                    })
                })(tail(outline));
                var minEntries = self.root().attr("data-TOC-minEntries") || TOC.settings.minEntries;
                if (self.root().find("li").length >= minEntries) {
                    self.root().show()
                } else {
                    self.root().hide()
                }
                return this
            },
            linkSection: function ($section, ancestors, prevSiblings) {
                var linkId = $section.eq(0).attr("id");
                if (!linkId) {
                    linkId = TOC.generateId($section.get(0));
                    $section.eq(0).attr("id", linkId)
                }
                var $root = this.root();
                var $entry = TOC.anchorFromLinkId($root, linkId);
                if (!$entry.length) {
                    $entry = $("<li><a/></li>")
                }
                $entry.find("a").attr("href", "#" + linkId).text($section.eq(0).text());
                if (last(prevSiblings)) {
                    last(prevSiblings).after($entry)
                } else {
                    if (last(ancestors).get(0) == $root.get(0)) {
                        $root.append($entry)
                    } else {
                        var $subToc = $("<ol/>").append($entry);
                        last(ancestors).append($subToc)
                    }
                }
                return $entry
            }
        }
    }
}());
