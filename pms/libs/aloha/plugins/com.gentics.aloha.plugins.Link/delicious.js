/*
 * Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH
 * aloha-sales@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
if (!GENTICS.Aloha.Repositories) {
    GENTICS.Aloha.Repositories = {}
}
GENTICS.Aloha.Repositories.delicious = new GENTICS.Aloha.Repository("com.gentics.aloha.repositories.delicious");
GENTICS.Aloha.Repositories.delicious.settings.username = "draftkraft";
GENTICS.Aloha.Repositories.delicious.settings.weight = 0.35;
GENTICS.Aloha.Repositories.delicious.init = function () {
    var that = this;
    if (this.settings.weight + 0.15 > 1) {
        this.settings.weight = 1 - 0.15
    }
    this.deliciousURL = "http://feeds.delicious.com/v2/json/";
    if (this.settings.username) {
        this.deliciousURL += this.settings.username + "/";
        this.repositoryName = "deliciuos/" + this.settings.username;
        this.tags = [];
        jQuery.ajax({
            type: "GET",
            dataType: "jsonp",
            url: "http://feeds.delicious.com/v2/json/tags/" + that.settings.username,
            success: function (data) {
                for (var tag in data) {
                    that.tags.push(tag)
                }
            }
        })
    } else {
        this.repositoryName = "deliciuos/" + popular;
        this.deliciousURL += "tag/"
    }
};
GENTICS.Aloha.Repositories.delicious.query = function (p, callback) {
    var that = this;
    if (p.objectTypeFilter && jQuery.inArray("website", p.objectTypeFilter) == -1) {
        callback.call(this, [])
    } else {
        var tags = [];
        if (this.settings.username) {
            var queryTags = p.queryString ? p.queryString.split(" ") : [];
            for (var i = 0; i < queryTags.length; i++) {
                var queryTag = queryTags[i].trim();
                if (jQuery.inArray(queryTag, that.tags) == -1) {
                    var newtags = that.tags.filter(function (e, i, a) {
                        var r = new RegExp(queryTag, "i");
                        return (e.match(r))
                    });
                    if (newtags.length > 0) {
                        tags.push(newtags[0])
                    }
                } else {
                    tags.push(queryTag)
                }
            }
        } else {
            tags = p.queryString.split(" ")
        }
        var folderTags = p.inFolderId ? p.inFolderId.split("+") : [];
        jQuery.extend(tags, folderTags);
        if (p.queryString && tags.length == 0) {
            callback.call(that, []);
            return
        }
        jQuery.ajax({
            type: "GET",
            dataType: "jsonp",
            url: that.deliciousURL + tags.join("+"),
            success: function (data) {
                var items = [];
                for (var i = 0; i < data.length; i++) {
                    if (typeof data[i] != "function") {
                        items.push(new GENTICS.Aloha.Repository.Document({
                            id: data[i].u,
                            name: data[i].d,
                            repositoryId: that.repositoryId,
                            type: "website",
                            url: data[i].u,
                            weight: that.settings.weight + (15 - 1) / 100
                        }))
                    }
                }
                callback.call(that, items)
            }
        })
    }
};
GENTICS.Aloha.Repositories.delicious.getChildren = function (p, callback) {
    var that = this;
    if (this.settings.username) {
        var items = [];
        if (p.inFolderId == this.repositoryId) {
            for (var i = 0; i < this.tags.length; i++) {
                if (typeof this.tags[i] != "function") {
                    items.push(new GENTICS.Aloha.Repository.Folder({
                        id: this.tags[i],
                        name: this.tags[i],
                        repositoryId: this.repositoryId,
                        type: "tag",
                        url: "http://feeds.delicious.com/v2/rss/tags/" + that.settings.username + "/" + this.tags[i]
                    }))
                }
            }
            callback.call(this, items)
        } else {
            jQuery.ajax({
                type: "GET",
                dataType: "jsonp",
                url: "http://feeds.delicious.com/v2/json/tags/" + that.settings.username + "/" + p.inFolderId,
                success: function (data) {
                    var items = [];
                    for (var tag in data) {
                        var id = (p.inFolderId) ? p.inFolderId + "+" + tag : tag;
                        if (typeof data[tag] != "function") {
                            items.push(new GENTICS.Aloha.Repository.Folder({
                                id: id,
                                name: tag,
                                repositoryId: that.repositoryId,
                                type: "tag",
                                url: "http://feeds.delicious.com/v2/rss/tags/" + that.settings.username + "/" + id,
                                hasMoreItems: true
                            }))
                        }
                    }
                    callback.call(that, items)
                }
            })
        }
    } else {
        callback.call(this, [])
    }
};
