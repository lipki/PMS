/*
 * Aloha Editor
 * Author & Copyright (c) 2010 Gentics Software GmbH
 * aloha-sales@gentics.com
 * Licensed unter the terms of http://www.aloha-editor.com/license.html
 */
GENTICS.Aloha.TablePlugin = new GENTICS.Aloha.Plugin("com.gentics.aloha.plugins.Table");
GENTICS.Aloha.TablePlugin.createLayer = undefined;
GENTICS.Aloha.TablePlugin.languages = ["en", "de", "fr", "eo", "fi", "ru", "it", "pl"];
GENTICS.Aloha.TablePlugin.config = ["table"];
GENTICS.Aloha.TablePlugin.TableRegistry = new Array();
GENTICS.Aloha.TablePlugin.activeTable = undefined;
GENTICS.Aloha.TablePlugin.parameters = {
    className: "GENTICS_Aloha_Table",
    classSelectionRow: "GENTICS_Aloha_Table_selectColumn",
    classSelectionColumn: "GENTICS_Aloha_Table_selectRow",
    classLeftUpperCorner: "GENTICS_Aloha_Table_leftUpperCorner",
    classTableWrapper: "GENTICS_Aloha_Table_wrapper",
    classCellSelected: "GENTICS_Aloha_Cell_selected",
    waiRed: "GENTICS_WAI_RED",
    waiGreen: "GENTICS_WAI_GREEN",
    selectionArea: 10
};
GENTICS.Aloha.TablePlugin.init = function () {
    this.createLayer = new GENTICS.Aloha.Table.CreateLayer();
    var that = this;
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableCreated", function (event, editable) {
        editable.obj.bind("mousedown", function (jqEvent) {
            GENTICS.Aloha.TablePlugin.setFocusedTable(undefined)
        });
        editable.obj.find("table").each(function () {
            if (that.isEditableTable(this)) {
                var table = new GENTICS.Aloha.Table(this);
                table.parentEditable = editable;
                GENTICS.Aloha.TablePlugin.TableRegistry.push(table)
            }
        })
    });
    this.initTableButtons();
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "selectionChanged", function (event, rangeObject) {
        if (GENTICS.Aloha.activeEditable) {
            var config = that.getEditableConfig(GENTICS.Aloha.activeEditable.obj);
            if (jQuery.inArray("table", config) != -1 && GENTICS.Aloha.Selection.mayInsertTag("table")) {
                that.createTableButton.show()
            } else {
                that.createTableButton.hide()
            }
            GENTICS.Aloha.TableHelper.unselectCells();
            var table = rangeObject.findMarkup(function () {
                return this.nodeName.toLowerCase() == "table"
            }, GENTICS.Aloha.activeEditable.obj);
            if (table) {
                GENTICS.Aloha.FloatingMenu.setScope(that.getUID(GENTICS.Aloha.TableHelper.selectionType))
            } else {
                if (that.activeTable) {
                    that.activeTable.focusOut()
                }
            }
            GENTICS.Aloha.FloatingMenu.doLayout()
        }
    });
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableActivated", function (event, props) {
        props.editable.obj.find("table").each(function () {
            var tr = GENTICS.Aloha.TablePlugin.TableRegistry;
            for (var i = 0; i < tr.length; i++) {
                if (tr[i].obj.attr("id") == jQuery(this).attr("id")) {
                    tr[i].activate();
                    return true
                }
            }
            if (that.isEditableTable(this)) {
                var table = new GENTICS.Aloha.Table(this);
                table.parentEditable = props.editable;
                table.activate();
                GENTICS.Aloha.TablePlugin.TableRegistry.push(table)
            }
        })
    });
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableDeactivated", function (event, properties) {
        GENTICS.Aloha.TablePlugin.setFocusedTable(undefined);
        GENTICS.Aloha.TableHelper.unselectCells();
        var tr = GENTICS.Aloha.TablePlugin.TableRegistry;
        for (var i = 0; i < tr.length; i++) {
            tr[i].deactivate()
        }
    })
};
GENTICS.Aloha.TablePlugin.isEditableTable = function (table) {
    var parent = jQuery(table.parentNode);
    if (parent.contentEditable() == "true") {
        return true
    } else {
        return false
    }
};
GENTICS.Aloha.TablePlugin.initTableButtons = function () {
    var that = this;
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("row"), "GENTICS.Aloha.global");
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("column"), "GENTICS.Aloha.global");
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("cell"), "GENTICS.Aloha.continuoustext");
    this.createTableButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_table",
        size: "small",
        tooltip: this.i18n("button.createtable.tooltip"),
        onclick: function (element, event) {
            GENTICS.Aloha.TablePlugin.createDialog(element.btnEl.dom)
        }
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", this.createTableButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.insert"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("column"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_addColumnLeft",
        size: "small",
        tooltip: this.i18n("button.addcolleft.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                that.activeTable.addColumnsLeft()
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("column"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_addColumnRight",
        size: "small",
        tooltip: this.i18n("button.addcolright.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                that.activeTable.addColumnsRight()
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("column"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_deleteColumns",
        size: "small",
        tooltip: this.i18n("button.delcols.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                var aTable = that.activeTable;
                GENTICS.Aloha.showMessage(new GENTICS.Aloha.Message({
                    title: GENTICS.Aloha.i18n(that, "Table"),
                    text: GENTICS.Aloha.i18n(that, "deletecolumns.confirm"),
                    type: GENTICS.Aloha.Message.Type.CONFIRM,
                    callback: function (sel) {
                        if (sel == "yes") {
                            aTable.deleteColumns()
                        }
                    }
                }))
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("row"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_addRowBefore",
        size: "small",
        tooltip: this.i18n("button.addrowbefore.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                that.activeTable.addRowsBefore(true)
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("row"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_addRowAfter",
        size: "small",
        tooltip: this.i18n("button.addrowafter.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                that.activeTable.addRowsAfter(true)
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("row"), new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_deleteRows",
        size: "small",
        tooltip: this.i18n("button.delrows.tooltip"),
        onclick: function () {
            if (that.activeTable) {
                var aTable = that.activeTable;
                GENTICS.Aloha.showMessage(new GENTICS.Aloha.Message({
                    title: GENTICS.Aloha.i18n(that, "Table"),
                    text: GENTICS.Aloha.i18n(that, "deleterows.confirm"),
                    type: GENTICS.Aloha.Message.Type.CONFIRM,
                    callback: function (sel) {
                        if (sel == "yes") {
                            aTable.deleteRows()
                        }
                    }
                }))
            }
        }
    }), GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    this.captionButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_table_caption",
        size: "small",
        tooltip: this.i18n("button.caption.tooltip"),
        toggle: true,
        onclick: function () {
            if (that.activeTable) {
                if (that.activeTable.obj.children("caption").is("caption")) {
                    that.activeTable.obj.children("caption").remove()
                } else {
                    var captionText = that.i18n("empty.caption");
                    var c = jQuery("<caption></caption>");
                    that.activeTable.obj.append(c);
                    that.makeCaptionEditable(c, captionText);
                    var cDiv = c.find("div").eq(0);
                    var captionContent = cDiv.contents().eq(0);
                    if (captionContent.length > 0) {
                        var newRange = new GENTICS.Utils.RangeObject();
                        newRange.startContainer = newRange.endContainer = captionContent.get(0);
                        newRange.startOffset = 0;
                        newRange.endOffset = captionContent.text().length;
                        that.activeTable.obj.find("div.GENTICS_Table_Cell_editable").blur();
                        cDiv.focus();
                        newRange.select();
                        GENTICS.Aloha.Selection.updateSelection()
                    }
                }
            }
        }
    });
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("cell"), this.captionButton, GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1);
    this.summary = new GENTICS.Aloha.ui.AttributeField({
        width: 350
    });
    this.summary.addListener("keyup", function (obj, event) {
        that.activeTable.checkWai()
    });
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("cell"), this.summary, GENTICS.Aloha.i18n(this, "floatingmenu.tab.table"), 1)
};
GENTICS.Aloha.TablePlugin.makeCaptionEditable = function (caption, captionText) {
    var that = this;
    var cSpan = caption.children("div").eq(0);
    if (cSpan.length == 0) {
        cSpan = jQuery("<div></div>");
        if (caption.contents().length > 0) {
            caption.contents().wrap(cSpan)
        } else {
            if (captionText) {
                cSpan.text(captionText)
            }
            caption.append(cSpan)
        }
    }
    cSpan.contentEditable(true);
    cSpan.unbind("mousedown");
    cSpan.bind("mousedown", function (jqEvent) {
        cSpan.focus();
        jqEvent.preventDefault();
        jqEvent.stopPropagation();
        return false
    })
};
GENTICS.Aloha.TablePlugin.createDialog = function (callingElement) {
    this.createLayer.set("target", callingElement);
    this.createLayer.show()
};
GENTICS.Aloha.TablePlugin.createTable = function (cols, rows) {
    if (GENTICS.Aloha.activeEditable != null && typeof GENTICS.Aloha.activeEditable.obj != "undefined") {
        var table = document.createElement("table");
        var tableId = table.id = GENTICS.Aloha.TableHelper.getNewTableID();
        var tbody = document.createElement("tbody");
        for (var i = 0; i < rows; i++) {
            var tr = document.createElement("tr");
            for (var j = 0; j < cols; j++) {
                var text = document.createTextNode("\u00a0");
                var td = document.createElement("td");
                td.appendChild(text);
                tr.appendChild(td)
            }
            tbody.appendChild(tr)
        }
        table.appendChild(tbody);
        GENTICS.Utils.Dom.insertIntoDOM(jQuery(table), GENTICS.Aloha.Selection.getRangeObject(), jQuery(GENTICS.Aloha.activeEditable.obj));
        var tableReloadedFromDOM = document.getElementById(tableId);
        var tableObj = new GENTICS.Aloha.Table(tableReloadedFromDOM);
        tableObj.parentEditable = GENTICS.Aloha.activeEditable;
        tableObj.activate();
        if (jQuery.browser.msie) {
            window.setTimeout(function () {
                tableObj.cells[0].wrapper.get(0).focus()
            }, 20)
        } else {
            tableObj.cells[0].wrapper.get(0).focus()
        }
        GENTICS.Aloha.TablePlugin.TableRegistry.push(tableObj)
    } else {
        this.error("There is no active Editable where the table can be inserted!")
    }
};
GENTICS.Aloha.TablePlugin.setFocusedTable = function (focusTable) {
    var that = this;
    for (var i = 0; i < GENTICS.Aloha.TablePlugin.TableRegistry.length; i++) {
        GENTICS.Aloha.TablePlugin.TableRegistry[i].hasFocus = false
    }
    if (typeof focusTable != "undefined") {
        this.summary.setTargetObject(focusTable.obj, "summary");
        if (focusTable.obj.children("caption").is("caption")) {
            that.captionButton.setPressed(true);
            var c = focusTable.obj.children("caption");
            that.makeCaptionEditable(c)
        }
        focusTable.hasFocus = true
    }
    GENTICS.Aloha.TablePlugin.activeTable = focusTable
};
GENTICS.Aloha.TablePlugin.error = function (msg) {
    GENTICS.Aloha.Log.error(this, msg)
};
GENTICS.Aloha.TablePlugin.debug = function (msg) {
    GENTICS.Aloha.Log.debug(this, msg)
};
GENTICS.Aloha.TablePlugin.info = function (msg) {
    GENTICS.Aloha.Log.info(this, msg)
};
GENTICS.Aloha.TablePlugin.log = function (msg) {
    GENTICS.Aloha.log("log", this, msg)
};
GENTICS.Aloha.TablePlugin.get = function (property) {
    if (this.config[property]) {
        return this.config[property]
    }
    if (this.parameters[property]) {
        return this.parameters[property]
    }
    return undefined
};
GENTICS.Aloha.TablePlugin.set = function (key, value) {
    if (this.config[key]) {
        this.config[key] = value
    } else {
        this.parameters[key] = value
    }
};
GENTICS.Aloha.TablePlugin.makeClean = function (obj) {
    obj.find("table").each(function () {
        var table = new GENTICS.Aloha.Table(this);
        table.deactivate()
    })
};
GENTICS.Aloha.TablePlugin.toString = function () {
    return this.prefix
};
GENTICS.Aloha.Table = function (table) {
    this.obj = jQuery(table);
    if (!this.obj.attr("id")) {
        this.obj.attr("id", GENTICS.Utils.guid())
    }
    var rows = this.obj.find("tr");
    var firstRow = jQuery(rows.get(0));
    this.numCols = firstRow.children("td, th").length;
    this.numRows = rows.length;
    this.cells = new Array();
    var rows = this.obj.find("tr");
    for (var i = 0; i < rows.length; i++) {
        var row = jQuery(rows[i]);
        var cols = row.children();
        for (var j = 0; j < cols.length; j++) {
            var col = cols[j];
            var Cell = new GENTICS.Aloha.Table.Cell(col, this);
            this.cells.push(Cell)
        }
    }
};
GENTICS.Aloha.Table.prototype.obj = undefined;
GENTICS.Aloha.Table.prototype.tableWrapper = undefined;
GENTICS.Aloha.Table.prototype.cells = undefined;
GENTICS.Aloha.Table.prototype.numRows = undefined;
GENTICS.Aloha.Table.prototype.numCols = undefined;
GENTICS.Aloha.Table.prototype.isActive = false;
GENTICS.Aloha.Table.prototype.hasFocus = false;
GENTICS.Aloha.Table.prototype.parentEditable = undefined;
GENTICS.Aloha.Table.prototype.mousedown = false;
GENTICS.Aloha.Table.prototype.clickedColumnId = -1;
GENTICS.Aloha.Table.prototype.clickedRowId = -1;
GENTICS.Aloha.Table.prototype.columnsToSelect = new Array();
GENTICS.Aloha.Table.prototype.rowsToSelect = new Array();
GENTICS.Aloha.Table.prototype.fmPluginId = undefined;
GENTICS.Aloha.Table.prototype.get = function (property) {
    return GENTICS.Aloha.TablePlugin.get(property)
};
GENTICS.Aloha.Table.prototype.set = function (key, value) {
    GENTICS.Aloha.TablePlugin.set(key, value)
};
GENTICS.Aloha.Table.prototype.activate = function () {
    if (this.isActive) {
        return
    }
    var that = this;
    this.obj.addClass(this.get("className"));
    this.obj.contentEditable(false);
    if (this.obj.attr("id") == "") {
        this.obj.attr("id", GENTICS.Aloha.TableHelper.getNewTableID())
    }
    GENTICS.Aloha.TableHelper.selectionType = undefined;
    this.obj.bind("keydown", function (jqEvent) {
        if (!jqEvent.ctrlKey && !jqEvent.shiftKey) {
            if (GENTICS.Aloha.TableHelper.selectedCells.length > 0 && GENTICS.Aloha.TableHelper.selectedCells[0].length > 0) {
                GENTICS.Aloha.TableHelper.selectedCells[0][0].firstChild.focus()
            }
        }
    });
    this.obj.bind("mousedown", function (jqEvent) {
        if (!that.hasFocus) {
            that.focus()
        }
        jqEvent.stopPropagation();
        jqEvent.preventDefault();
        return false
    });
    var tableWrapper = jQuery('<div class="' + this.get("classTableWrapper") + '"></div>');
    tableWrapper.contentEditable(false);
    this.obj.wrap(tableWrapper);
    var htmlTableWrapper = this.obj.parents("." + this.get("classTableWrapper"));
    htmlTableWrapper.get(0).onresizestart = function (e) {
        return false
    };
    htmlTableWrapper.get(0).oncontrolselect = function (e) {
        return false
    };
    this.tableWrapper = this.obj.parents("." + this.get("classTableWrapper")).get(0);
    jQuery(this.cells).each(function () {
        this.activate()
    });
    this.attachSelectionColumn();
    this.attachSelectionRow();
    this.attachLastCellEvents();
    this.makeCaptionEditable();
    this.checkWai();
    this.isActive = true;
    GENTICS.Aloha.EventRegistry.trigger(new GENTICS.Aloha.Event("tableActivated", GENTICS.Aloha, [this]))
};
GENTICS.Aloha.Table.prototype.makeCaptionEditable = function () {
    var caption = this.obj.find("caption").eq(0);
    if (caption) {
        GENTICS.Aloha.TablePlugin.makeCaptionEditable(caption)
    }
};
GENTICS.Aloha.Table.prototype.checkWai = function () {
    var w = this.wai;
    w.removeClass(this.get("waiGreen"));
    w.removeClass(this.get("waiRed"));
    if (this.obj[0].summary.length > 5) {
        w.addClass(this.get("waiGreen"))
    } else {
        w.addClass(this.get("waiRed"))
    }
};
GENTICS.Aloha.Table.prototype.attachSelectionColumn = function () {
    var emptyCell = jQuery("<td>");
    emptyCell.html("\u00a0");
    var that = this;
    var rows = this.obj.context.rows;
    for (var i = 0; i < rows.length; i++) {
        var rowObj = jQuery(rows[i]);
        var columnToInsert = emptyCell.clone();
        columnToInsert.addClass(this.get("classSelectionColumn"));
        columnToInsert.css("width", this.get("selectionArea") + "px");
        rowObj.find("td:first").before(columnToInsert);
        var rowIndex = i + 1;
        this.attachRowSelectionEventsToCell(columnToInsert)
    }
};
GENTICS.Aloha.Table.prototype.attachRowSelectionEventsToCell = function (cell) {
    var that = this;
    cell.unbind("mousedown");
    cell.unbind("mouseover");
    cell.get(0).onselectstart = function () {
        return false
    };
    cell.bind("mousedown", function (e) {
        that.mousedown = true;
        return that.rowSelectionMouseDown(e)
    });
    cell.bind("mouseover", function (e) {
        if (that.mousedown) {
            return that.rowSelectionMouseOver(e)
        }
    })
};
GENTICS.Aloha.Table.prototype.rowSelectionMouseDown = function (jqEvent) {
    this.focus();
    if (GENTICS.Aloha.TableHelper.selectedCells.length == 0) {
        this.rowsToSelect = new Array()
    }
    this.clickedRowId = jqEvent.currentTarget.parentNode.rowIndex;
    if (jqEvent.metaKey) {
        var arrayIndex = jQuery.inArray(this.clickedRowId, this.rowsToSelect);
        if (arrayIndex >= 0) {
            this.rowsToSelect.splice(arrayIndex, 1)
        } else {
            this.rowsToSelect.push(this.clickedRowId)
        }
    } else {
        if (jqEvent.shiftKey) {
            this.rowsToSelect.sort(function (a, b) {
                return a - b
            });
            var start = this.rowsToSelect[0];
            var end = this.clickedRowId;
            if (start > end) {
                start = end;
                end = this.rowsToSelect[0]
            }
            this.rowsToSelect = new Array();
            for (var i = start; i <= end; i++) {
                this.rowsToSelect.push(i)
            }
        } else {
            this.rowsToSelect = [this.clickedRowId]
        }
    }
    this.selectRows();
    jqEvent.preventDefault();
    jqEvent.stopPropagation();
    return false
};
GENTICS.Aloha.Table.prototype.rowSelectionMouseOver = function (jqEvent) {
    var rowIndex = jqEvent.currentTarget.parentNode.rowIndex;
    if (this.mousedown && this.clickedRowId >= 0) {
        var indexInArray = jQuery.inArray(rowIndex, this.rowsToSelect);
        var start = (rowIndex < this.clickedRowId) ? rowIndex : this.clickedRowId;
        var end = (rowIndex < this.clickedRowId) ? this.clickedRowId : rowIndex;
        this.rowsToSelect = new Array();
        for (var i = start; i <= end; i++) {
            this.rowsToSelect.push(i)
        }
        this.selectRows();
        jqEvent.preventDefault();
        jqEvent.stopPropagation();
        return false
    }
};
GENTICS.Aloha.Table.prototype.attachSelectionRow = function () {
    var that = this;
    var emptyCell = jQuery("<td>");
    emptyCell.html("\u00a0");
    var numColumns = this.obj.context.rows[0].cells.length;
    var selectionRow = jQuery("<tr>");
    selectionRow.addClass(this.get("classSelectionRow"));
    selectionRow.css("height", this.get("selectionArea") + "px");
    for (var i = 0; i < numColumns; i++) {
        var columnToInsert = emptyCell.clone();
        if (i > 0) {
            this.attachColumnSelectEventsToCell(columnToInsert)
        } else {
            var columnToInsert = jQuery("<td>").clone();
            columnToInsert.addClass(this.get("classLeftUpperCorner"));
            this.wai = jQuery("<div/>");
            this.wai.width(25);
            this.wai.height(12);
            this.wai.click(function (e) {
                that.focus();
                GENTICS.Aloha.FloatingMenu.userActivatedTab = GENTICS.Aloha.TablePlugin.i18n("floatingmenu.tab.table");
                GENTICS.Aloha.FloatingMenu.doLayout();
                GENTICS.Aloha.TablePlugin.summary.focus();
                e.stopPropagation();
                e.preventDefault();
                return false
            });
            columnToInsert.append(this.wai)
        }
        selectionRow.append(columnToInsert)
    }
    jQuery(document).bind("mouseup", function (e) {
        that.mousedown = false;
        that.clickedColumnId = -1;
        that.clickedRowId = -1
    });
    this.obj.find("tr:first").before(selectionRow)
};
GENTICS.Aloha.Table.prototype.attachColumnSelectEventsToCell = function (cell) {
    var that = this;
    cell.unbind("mousedown");
    cell.unbind("mouseover");
    cell.get(0).onselectstart = function () {
        return false
    };
    cell.bind("mousedown", function (e) {
        that.mousedown = true;
        that.columnSelectionMouseDown(e)
    });
    cell.bind("mouseover", function (e) {
        if (that.mousedown) {
            that.columnSelectionMouseOver(e)
        }
    })
};
GENTICS.Aloha.Table.prototype.columnSelectionMouseDown = function (jqEvent) {
    this.focus();
    if (GENTICS.Aloha.TableHelper.selectedCells.length == 0) {
        this.columnsToSelect = new Array()
    }
    this.clickedColumnId = jqEvent.currentTarget.cellIndex;
    if (jqEvent.metaKey) {
        var arrayIndex = jQuery.inArray(this.clickedColumnId, this.columnsToSelect);
        if (arrayIndex >= 0) {
            this.columnsToSelect.splice(arrayIndex, 1)
        } else {
            this.columnsToSelect.push(this.clickedColumnId)
        }
    } else {
        if (jqEvent.shiftKey) {
            this.columnsToSelect.sort(function (a, b) {
                return a - b
            });
            var start = this.columnsToSelect[0];
            var end = this.clickedColumnId;
            if (start > end) {
                start = end;
                end = this.columnsToSelect[0]
            }
            this.columnsToSelect = new Array();
            for (var i = start; i <= end; i++) {
                this.columnsToSelect.push(i)
            }
        } else {
            this.columnsToSelect = [this.clickedColumnId]
        }
    }
    this.selectColumns();
    jqEvent.preventDefault();
    jqEvent.stopPropagation();
    return false
};
GENTICS.Aloha.Table.prototype.columnSelectionMouseOver = function (jqEvent) {
    var colIndex = jqEvent.currentTarget.cellIndex;
    if (this.mousedown && this.clickedColumnId > 0) {
        var indexInArray = jQuery.inArray(colIndex, this.columnsToSelect);
        var start = (colIndex < this.clickedColumnId) ? colIndex : this.clickedColumnId;
        var end = (colIndex < this.clickedColumnId) ? this.clickedColumnId : colIndex;
        this.columnsToSelect = new Array();
        for (var i = start; i <= end; i++) {
            this.columnsToSelect.push(i)
        }
        this.selectColumns()
    }
};
GENTICS.Aloha.Table.prototype.releaseLastCellEvents = function () {
    this.obj.find("tr:last td:last").unbind()
};
GENTICS.Aloha.Table.prototype.attachLastCellEvents = function () {
    var that = this;
    this.obj.find("tr:last td:last").bind("keydown", function (jqEvent) {
        that.lastCellKeyDown(jqEvent)
    })
};
GENTICS.Aloha.Table.prototype.lastCellKeyDown = function (jqEvent) {
    var KEYCODE_TAB = 9;
    if (KEYCODE_TAB == jqEvent.keyCode && !jqEvent.altKey && !jqEvent.shiftKey && !jqEvent.ctrlKey) {
        this.addRowsAfter(false);
        jqEvent.stopPropagation();
        if (jQuery.browser.msie) {
            this.obj.find("tr:last td:nth-child(1) div.GENTICS_Table_Cell_editable").get(0).focus();
            return false
        }
    }
};
GENTICS.Aloha.Table.prototype.deleteRows = function () {
    var rowIDs = new Array();
    var deleteTable = false;
    if (GENTICS.Aloha.TableHelper.selectedCells.length > 0) {
        for (var i = 0; i < GENTICS.Aloha.TableHelper.selectedCells.length; i++) {
            rowIDs.push(GENTICS.Aloha.TableHelper.selectedCells[i][0].parentNode.rowIndex)
        }
    } else {
        if (typeof GENTICS.Aloha.Table.Cell.lastActiveCell != "undefined") {
            rowIDs.push(GENTICS.Aloha.Table.Cell.lastActiveCell.obj.context.parentNode.rowIndex)
        }
    }
    if (rowIDs.length == this.numRows) {
        deleteTable = true
    }
    if (deleteTable) {
        var that = this;
        GENTICS.Aloha.showMessage(new GENTICS.Aloha.Message({
            title: GENTICS.Aloha.i18n(GENTICS.Aloha.TablePlugin, "Table"),
            text: GENTICS.Aloha.i18n(GENTICS.Aloha.TablePlugin, "deletetable.confirm"),
            type: GENTICS.Aloha.Message.Type.CONFIRM,
            callback: function (sel) {
                if (sel == "yes") {
                    that.deleteTable()
                }
            }
        }))
    } else {
        rowIDs.sort(function (a, b) {
            return a - b
        });
        var focusRowId = rowIDs[0];
        if (focusRowId > (this.numRows - rowIDs.length)) {
            focusRowId--
        }
        this.releaseLastCellEvents();
        var rows = this.obj.find("tr");
        var rows2delete = new Array();
        for (var i = 0; i < rowIDs.length; i++) {
            rows2delete.push(jQuery(rows[rowIDs[i]]))
        }
        for (var i = 0; i < rows2delete.length; i++) {
            var cols = rows2delete[i].children("td").toArray();
            for (var j = 0; j < cols.length; j++) {
                for (var m = 0; m < this.cells.length; m++) {
                    if (cols[j] == this.cells[m].obj.get(0)) {
                        this.cells.splice(m, 1);
                        m = this.cells.length
                    }
                }
            }
        }
        for (var i = 0; i < rows2delete.length; i++) {
            rows2delete[i].remove()
        }
        this.numRows -= rows2delete.length;
        if (jQuery.browser.msie) {
            setTimeout(this.obj.find("tr:nth-child(" + (focusRowId + 1) + ") td:nth-child(2) div.GENTICS_Table_Cell_editable").get(0).focus, 5)
        } else {
            this.obj.find("tr:nth-child(" + (focusRowId + 1) + ") td:nth-child(2) div.GENTICS_Table_Cell_editable").get(0).focus()
        }
        this.attachLastCellEvents();
        GENTICS.Aloha.TableHelper.unselectCells()
    }
};
GENTICS.Aloha.Table.prototype.deleteColumns = function () {
    var colIDs = new Array();
    var deleteTable = false;
    if (GENTICS.Aloha.TableHelper.selectedCells.length > 0) {
        for (var i = 0; i < GENTICS.Aloha.TableHelper.selectedCells[0].length; i++) {
            colIDs.push(GENTICS.Aloha.TableHelper.selectedCells[0][i].cellIndex)
        }
    } else {
        if (typeof GENTICS.Aloha.Table.Cell.lastActiveCell != "undefined") {
            colIDs.push(GENTICS.Aloha.Table.Cell.lastActiveCell.obj.context.cellIndex)
        }
    }
    if (colIDs.length == this.numCols) {
        deleteTable = true
    }
    if (deleteTable) {
        var that = this;
        GENTICS.Aloha.showMessage(new GENTICS.Aloha.Message({
            title: GENTICS.Aloha.i18n(GENTICS.Aloha.TablePlugin, "Table"),
            text: GENTICS.Aloha.i18n(GENTICS.Aloha.TablePlugin, "deletetable.confirm"),
            type: GENTICS.Aloha.Message.Type.CONFIRM,
            callback: function (sel) {
                if (sel == "yes") {
                    that.deleteTable()
                }
            }
        }))
    } else {
        colIDs.sort(function (a, b) {
            return a - b
        });
        var focusColID = colIDs[0];
        if (focusColID > (this.numCols - colIDs.length)) {
            focusColID--
        }
        this.releaseLastCellEvents();
        var rows = this.obj.find("tr");
        var cols2delete = new Array();
        for (var i = 0; i < rows.length; i++) {
            var cells = jQuery(rows[i]).children("td").toArray();
            for (var j = 0; j < colIDs.length; j++) {
                cols2delete.push(cells[colIDs[j]])
            }
        }
        for (var i = 0; i < cols2delete.length; i++) {
            for (var j = 0; j < this.cells.length; j++) {
                if (cols2delete[i] == this.cells[j].obj.get(0)) {
                    this.cells.splice(j, 1);
                    j = this.cells.length
                }
            }
        }
        for (var i = 0; i < cols2delete.length; i++) {
            jQuery(cols2delete[i]).remove()
        }
        this.numCols -= colIDs.length;
        if (jQuery.browser.msie) {
            setTimeout(this.obj.find("tr:nth-child(2) td:nth-child(" + (focusColID + 1) + ") div.GENTICS_Table_Cell_editable").get(0).focus, 5)
        } else {
            this.obj.find("tr:nth-child(2) td:nth-child(" + (focusColID + 1) + ") div.GENTICS_Table_Cell_editable").get(0).focus()
        }
        this.attachLastCellEvents();
        GENTICS.Aloha.TableHelper.unselectCells()
    }
};
GENTICS.Aloha.Table.prototype.deleteTable = function () {
    var deleteIndex = -1;
    for (var i = 0; i < GENTICS.Aloha.TablePlugin.TableRegistry.length; i++) {
        if (GENTICS.Aloha.TablePlugin.TableRegistry[i].obj.attr("id") == this.obj.attr("id")) {
            deleteIndex = i;
            break
        }
    }
    if (deleteIndex >= 0) {
        this.deactivate();
        GENTICS.Aloha.TableHelper.selectionType = undefined;
        GENTICS.Aloha.TablePlugin.TableRegistry.splice(i, 1);
        var newRange = GENTICS.Aloha.Selection.rangeObject;
        newRange.startContainer = newRange.endContainer = this.obj.get(0).parentNode;
        newRange.startOffset = newRange.endOffset = GENTICS.Utils.Dom.getIndexInParent(this.obj.get(0).parentNode);
        newRange.clearCaches();
        this.obj.remove();
        this.parentEditable.obj.focus();
        newRange.correctRange();
        newRange.select()
    }
};
GENTICS.Aloha.Table.prototype.addRowsBefore = function (highlightNewRows) {
    this.addRows("before", highlightNewRows)
};
GENTICS.Aloha.Table.prototype.addRowsAfter = function (highlightNewRows) {
    this.addRows("after", highlightNewRows)
};
GENTICS.Aloha.Table.prototype.addRows = function (position, highlightNewRows) {
    if (typeof GENTICS.Aloha.TablePlugin.activeTable != "undefined") {
        this.releaseLastCellEvents();
        var that = this;
        var numCols = this.numCols;
        var rowsToInsert = 1;
        var rowId = 1;
        if (GENTICS.Aloha.TableHelper.selectedCells.length > 0) {
            rowsToInsert = GENTICS.Aloha.TableHelper.selectedCells.length;
            switch (position) {
            case "before":
                if (GENTICS.Aloha.TableHelper.selectedCells[0].length) {
                    rowId = GENTICS.Aloha.TableHelper.selectedCells[0][0].parentNode.rowIndex
                }
                break;
            case "after":
                var lastRow = GENTICS.Aloha.TableHelper.selectedCells.length - 1;
                if (GENTICS.Aloha.TableHelper.selectedCells[lastRow].length) {
                    rowId = GENTICS.Aloha.TableHelper.selectedCells[lastRow][0].parentNode.rowIndex
                }
                break
            }
        } else {
            if (typeof GENTICS.Aloha.Table.Cell.lastActiveCell != "undefined") {
                rowId = GENTICS.Aloha.Table.Cell.lastActiveCell.obj.context.parentNode.rowIndex
            }
        }
        var newRowIndex = rowId;
        if (position == "after") {
            newRowIndex += 1
        }
        var rowIdArray = new Array();
        for (var j = 0; j < rowsToInsert; j++) {
            rowIdArray.push(newRowIndex);
            var insertionRow = jQuery("<tr>");
            var selectionColumn = jQuery("<td>");
            selectionColumn.addClass(this.get("classSelectionColumn"));
            this.attachRowSelectionEventsToCell(selectionColumn);
            insertionRow.append(selectionColumn);
            for (i = 0; i < numCols; i++) {
                var newCol = jQuery("<td>");
                newCol.html("\u00a0");
                var cell = new GENTICS.Aloha.Table.Cell(newCol.get(0), GENTICS.Aloha.TablePlugin.activeTable);
                cell.activate();
                this.cells.push(cell);
                insertionRow.append(cell.obj)
            }
            var currentRow = jQuery(GENTICS.Aloha.TablePlugin.activeTable.obj.find("tr").get(rowId));
            switch (position) {
            case "before":
                currentRow.before(insertionRow);
                break;
            case "after":
                currentRow.after(insertionRow);
                break;
            default:
                this.warn(this, "Wrong call of GENTICS.Aloha.Table.prototype.addRow!")
            }
            newRowIndex++;
            this.numRows++
        }
        GENTICS.Aloha.TableHelper.unselectCells();
        this.rowsToSelect = rowIdArray;
        if (highlightNewRows) {
            this.selectRows()
        }
        this.attachLastCellEvents()
    }
};
GENTICS.Aloha.Table.prototype.addColumnsRight = function () {
    this.addColumns("right")
};
GENTICS.Aloha.Table.prototype.addColumnsLeft = function () {
    this.addColumns("left")
};
GENTICS.Aloha.Table.prototype.addColumns = function (position) {
    if (typeof GENTICS.Aloha.TablePlugin.activeTable != "undefined") {
        this.releaseLastCellEvents();
        var that = this;
        var columnsToInsert = 1;
        var colId = 1;
        if (GENTICS.Aloha.TableHelper.selectedCells.length > 0) {
            columnsToInsert = GENTICS.Aloha.TableHelper.selectedCells[0].length;
            switch (position) {
            case "left":
                if (GENTICS.Aloha.TableHelper.selectedCells[0].length) {
                    colId = GENTICS.Aloha.TableHelper.selectedCells[0][0].cellIndex
                }
                break;
            case "right":
                var lastColumn = GENTICS.Aloha.TableHelper.selectedCells[0].length - 1;
                if (GENTICS.Aloha.TableHelper.selectedCells[0].length) {
                    colId = GENTICS.Aloha.TableHelper.selectedCells[0][lastColumn].cellIndex
                }
                break
            }
        } else {
            if (typeof GENTICS.Aloha.Table.Cell.lastActiveCell != "undefined") {
                colId = GENTICS.Aloha.Table.Cell.lastActiveCell.obj.context.cellIndex
            }
        }
        var newColId = colId;
        var emptyCell = jQuery("<td>");
        var rows = this.obj.find("tr");
        var colIdArray = new Array();
        for (var i = 0; i < rows.length; i++) {
            var currentColId = newColId;
            var row = rows[i];
            for (var j = 0; j < columnsToInsert; j++) {
                var cell = emptyCell.clone();
                cell.html("\u00a0");
                if (i == 0) {
                    this.attachColumnSelectEventsToCell(cell)
                } else {
                    cellObj = new GENTICS.Aloha.Table.Cell(cell.get(0), GENTICS.Aloha.TablePlugin.activeTable);
                    this.cells.push(cellObj);
                    cellObj.activate();
                    cell = cellObj.obj
                }
                var insertionColumn = jQuery(jQuery(row).find("td").get(newColId));
                switch (position) {
                case "left":
                    if (jQuery.inArray(currentColId, colIdArray) < 0) {
                        colIdArray.push(currentColId)
                    }
                    insertionColumn.before(cell);
                    break;
                case "right":
                    if (jQuery.inArray((currentColId + 1), colIdArray) < 0) {
                        colIdArray.push(currentColId + 1)
                    }
                    insertionColumn.after(cell);
                    break
                }
                currentColId++
            }
        }
        this.numCols += columnsToInsert;
        GENTICS.Aloha.TableHelper.unselectCells();
        this.columnsToSelect = colIdArray;
        this.selectColumns();
        this.attachLastCellEvents()
    }
};
GENTICS.Aloha.Table.prototype.focus = function () {
    if (!this.hasFocus) {
        if (!this.parentEditable.isActive) {
            this.parentEditable.obj.focus()
        }
        GENTICS.Aloha.TablePlugin.setFocusedTable(this)
    }
};
GENTICS.Aloha.Table.prototype.focusOut = function () {
    if (this.hasFocus) {
        GENTICS.Aloha.TablePlugin.setFocusedTable(undefined);
        GENTICS.Aloha.TableHelper.selectionType = undefined
    }
};
GENTICS.Aloha.Table.prototype.selectColumns = function () {
    var selectClass = this.get("classCellSelected");
    GENTICS.Aloha.TableHelper.unselectCells();
    GENTICS.Aloha.TableHelper.selectionType = "column";
    GENTICS.Aloha.FloatingMenu.setScope(GENTICS.Aloha.TablePlugin.getUID("column"));
    this.columnsToSelect.sort(function (a, b) {
        return a - b
    });
    var rows = this.obj.find("tr").toArray();
    rows.shift();
    var toSelect = new Array();
    for (var i = 0; i < rows.length; i++) {
        var rowCells = rows[i].cells;
        var selectedCellsInCol = new Array();
        for (var j = 0; j < this.columnsToSelect.length; j++) {
            var colIndex = this.columnsToSelect[j];
            var cell = rowCells[colIndex];
            toSelect.push(cell);
            selectedCellsInCol.push(cell)
        }
        GENTICS.Aloha.TableHelper.selectedCells.push(selectedCellsInCol)
    }
    this.obj.find("div.GENTICS_Table_Cell_editable").blur();
    jQuery(toSelect).addClass(selectClass)
};
GENTICS.Aloha.Table.prototype.selectRows = function () {
    var selectClass = this.get("classCellSelected");
    GENTICS.Aloha.TableHelper.unselectCells();
    this.rowsToSelect.sort(function (a, b) {
        return a - b
    });
    for (var i = 0; i < this.rowsToSelect.length; i++) {
        var rowId = this.rowsToSelect[i];
        var rowCells = jQuery(this.obj.find("tr").get(rowId).cells).toArray();
        rowCells.shift();
        GENTICS.Aloha.TableHelper.selectedCells.push(rowCells);
        jQuery(rowCells).addClass(this.get("classCellSelected"))
    }
    GENTICS.Aloha.TableHelper.selectionType = "row";
    GENTICS.Aloha.FloatingMenu.setScope(GENTICS.Aloha.TablePlugin.getUID("row"));
    this.obj.find("div.GENTICS_Table_Cell_editable").blur()
};
GENTICS.Aloha.Table.prototype.deactivate = function () {
    this.obj.removeClass(this.get("className"));
    if (GENTICS.Aloha.trim(this.obj.attr("class")) == "") {
        this.obj.removeAttr("class")
    }
    if (this.obj.parents("." + this.get("classTableWrapper")).length) {
        this.obj.unwrap()
    }
    this.obj.find("tr." + this.get("classSelectionRow") + ":first").remove();
    var that = this;
    jQuery.each(this.obj.context.rows, function () {
        jQuery(this).children("td." + that.get("classSelectionColumn")).remove()
    });
    this.obj.find("td, th").removeClass(this.get("classCellSelected"));
    this.obj.unbind();
    for (var i = 0; i < this.cells.length; i++) {
        var Cell = this.cells[i];
        Cell.deactivate()
    }
    this.obj.find("caption div").each(function () {
        jQuery(this).contents().unwrap()
    });
    this.isActive = false
};
GENTICS.Aloha.Table.prototype.toString = function () {
    return "GENTICS.Aloha.Table"
};
GENTICS.Aloha.Table.Cell = function (originalTd, tableObj) {
    this.obj = jQuery(originalTd);
    this.tableObj = tableObj
};
GENTICS.Aloha.Table.Cell.prototype.tableObj = undefined;
GENTICS.Aloha.Table.Cell.prototype.obj = undefined;
GENTICS.Aloha.Table.Cell.prototype.wrapper = undefined;
GENTICS.Aloha.Table.Cell.prototype.hasFocus = false;
GENTICS.Aloha.Table.Cell.activeCell = undefined;
GENTICS.Aloha.Table.Cell.lastActiveCell = undefined;
GENTICS.Aloha.Table.Cell.prototype.editableFocus = function (e) {
    if (!this.hasFocus) {
        this.tableObj.focus();
        GENTICS.Aloha.Table.Cell.activeCell = this;
        GENTICS.Aloha.Table.Cell.lastActiveCell = this;
        this.obj.addClass("GENTICS_Table_Cell_active");
        this.hasFocus = true;
        this.selectAll(this.wrapper.get(0));
        GENTICS.Aloha.TableHelper.selectionType = "cell"
    }
};
GENTICS.Aloha.Table.Cell.prototype.editableBlur = function (jqEvent) {
    GENTICS.Aloha.Table.Cell.activeCell = undefined;
    this.hasFocus = false;
    this.obj.removeClass("GENTICS_Table_Cell_active")
};
GENTICS.Aloha.Table.Cell.prototype.activate = function () {
    this.obj.wrapInner("<div/>");
    var wrapper = this.obj.children("div").eq(0);
    wrapper.contentEditable(true);
    wrapper.addClass("GENTICS_Table_Cell_editable");
    var that = this;
    wrapper.bind("focus", function (jqEvent) {
        if (jqEvent.currentTarget) {
            jqEvent.currentTarget.indexOf = function () {
                return -1
            }
        }
        that.editableFocus(jqEvent)
    });
    wrapper.bind("mousedown", function (jqEvent) {
        if (jqEvent.currentTarget) {
            jqEvent.currentTarget.indexOf = function () {
                return -1
            }
        }
        that.editableMouseDown(jqEvent)
    });
    wrapper.bind("blur", function (jqEvent) {
        that.editableBlur(jqEvent)
    });
    wrapper.bind("keyup", function (jqEvent) {
        that.editableKeyUp(jqEvent)
    });
    wrapper.bind("keydown", function (jqEvent) {
        that.editableKeyDown(jqEvent)
    });
    wrapper.GENTICS_contentEditableSelectionChange(function (event) {
        GENTICS.Aloha.Selection.onChange(wrapper, event);
        return wrapper
    });
    this.obj.bind("mousedown", function (jqEvent) {
        setTimeout(function () {
            that.wrapper.trigger("focus")
        }, 1);
        GENTICS.Aloha.TableHelper.unselectCells();
        jqEvent.stopPropagation()
    });
    this.obj.get(0).onselectstart = function (jqEvent) {
        return false
    };
    this.wrapper = this.obj.children();
    this.wrapper.get(0).onselectstart = function () {
        window.event.cancelBubble = true
    };
    return this
};
GENTICS.Aloha.Table.Cell.prototype.deactivate = function () {
    var wrapper = this.obj.children(".GENTICS_Table_Cell_editable");
    if (wrapper.length) {
        var innerHtml = wrapper.html();
        wrapper.unbind();
        wrapper.remove();
        this.obj.unbind("click");
        if (GENTICS.Aloha.trim(this.obj.attr("class")) == "") {
            this.obj.removeAttr("class")
        }
        this.obj.html(innerHtml)
    }
};
GENTICS.Aloha.Table.Cell.prototype.toString = function () {
    return "GENTICS.Aloha.Table.Cell"
};
GENTICS.Aloha.Table.Cell.prototype.selectAll = function (editableNode) {
    var e = (editableNode.jquery) ? editableNode.get(0) : editableNode;
    if (!jQuery.browser.msie) {
        var s = window.getSelection();
        if (s.setBaseAndExtent) {
            s.setBaseAndExtent(e, 0, e, e.innerText.length - 1)
        } else {
            if (window.opera && e.innerHTML.substring(e.innerHTML.length - 4) == "<BR>") {
                e.innerHTML = e.innerHTML + "&#160;"
            }
            var r = document.createRange();
            r.selectNodeContents(e);
            s.removeAllRanges();
            s.addRange(r)
        }
    } else {
        if (document.getSelection) {
            var s = document.getSelection();
            var r = document.createRange();
            r.selectNodeContents(e);
            s.removeAllRanges();
            s.addRange(r)
        } else {
            if (document.selection) {
                var r = document.body.createTextRange();
                r.moveToElementText(e);
                r.select()
            }
        }
    }
    GENTICS.Aloha.Selection.updateSelection(editableNode)
};
GENTICS.Aloha.Table.Cell.prototype.editableMouseDown = function (jqEvent) {
    GENTICS.Aloha.TableHelper.unselectCells();
    if (this.tableObj.hasFocus) {
        jqEvent.stopPropagation()
    }
};
GENTICS.Aloha.Table.Cell.prototype.editableKeyUp = function (jqEvent) {
    this.checkForEmptyEvent(jqEvent)
};
GENTICS.Aloha.Table.Cell.prototype.editableKeyDown = function (jqEvent) {
    this.checkForEmptyEvent(jqEvent);
    if (!jqEvent.ctrlKey && !jqEvent.shiftKey) {
        if (GENTICS.Aloha.TableHelper.selectedCells.length > 0 && GENTICS.Aloha.TableHelper.selectedCells[0].length > 0) {
            GENTICS.Aloha.TableHelper.selectedCells[0][0].firstChild.focus();
            GENTICS.Aloha.TableHelper.unselectCells();
            jqEvent.stopPropagation()
        }
    } else {
        if (jqEvent.shiftKey && GENTICS.Aloha.TableHelper.selectedCells.length > 0) {
            var KEYCODE_ARROWLEFT = 37;
            var KEYCODE_ARROWUP = 38;
            var KEYCODE_ARROWRIGHT = 39;
            var KEYCODE_ARROWDOWN = 40;
            switch (GENTICS.Aloha.TableHelper.selectionType) {
            case "row":
                switch (jqEvent.keyCode) {
                case KEYCODE_ARROWUP:
                    var firstSelectedRow = GENTICS.Aloha.TableHelper.selectedCells[0][0].parentNode.rowIndex;
                    if (firstSelectedRow > 1) {
                        this.tableObj.rowsToSelect.push(firstSelectedRow - 1)
                    }
                    break;
                case KEYCODE_ARROWDOWN:
                    var lastRowIndex = GENTICS.Aloha.TableHelper.selectedCells.length - 1;
                    var lastSelectedRow = GENTICS.Aloha.TableHelper.selectedCells[lastRowIndex][0].parentNode.rowIndex;
                    if (lastSelectedRow < this.tableObj.numRows) {
                        this.tableObj.rowsToSelect.push(lastSelectedRow + 1)
                    }
                    break
                }
                this.tableObj.selectRows();
                break;
            case "column":
                switch (jqEvent.keyCode) {
                case KEYCODE_ARROWLEFT:
                    var firstColSelected = GENTICS.Aloha.TableHelper.selectedCells[0][0].cellIndex;
                    if (firstColSelected > 1) {
                        this.tableObj.columnsToSelect.push(firstColSelected - 1)
                    }
                    break;
                case KEYCODE_ARROWRIGHT:
                    var lastColIndex = GENTICS.Aloha.TableHelper.selectedCells[0].length - 1;
                    var lastColSelected = GENTICS.Aloha.TableHelper.selectedCells[0][lastColIndex].cellIndex;
                    if (lastColSelected < this.tableObj.numCols) {
                        this.tableObj.columnsToSelect.push(lastColSelected + 1)
                    }
                    break
                }
                this.tableObj.selectColumns();
                break
            }
            jqEvent.stopPropagation();
            jqEvent.preventDefault();
            return false
        }
    }
};
GENTICS.Aloha.Table.Cell.prototype.checkForEmptyEvent = function (jqEvent) {
    if (jQuery(this.wrapper).children().length > 0) {
        return
    }
    var text = this.wrapper.text();
    if (text == "") {
        this.wrapper.text("\u00a0");
        this.wrapper.get(0).blur();
        this.wrapper.get(0).focus()
    }
};
GENTICS.Aloha.Table.CreateLayer = function () {};
GENTICS.Aloha.Table.CreateLayer.prototype.parameters = {
    elemId: "GENTICS_Aloha_Table_createLayer",
    className: "GENTICS_Table_Createdialog",
    numX: 10,
    numY: 10,
    layer: undefined,
    target: undefined
};
GENTICS.Aloha.Table.CreateLayer.prototype.config = new Object();
GENTICS.Aloha.Table.CreateLayer.prototype.visible = false;
GENTICS.Aloha.Table.CreateLayer.prototype.show = function () {
    var layer = this.get("layer");
    if (layer == null) {
        this.create()
    } else {
        this.setPosition(layer);
        layer.find("td").removeClass("hover");
        layer.show()
    }
    this.visible = true
};
GENTICS.Aloha.Table.CreateLayer.prototype.create = function () {
    var that = this;
    var layer = jQuery("<div></div>");
    layer.id = this.get("elemId");
    layer.addClass(this.get("className"));
    var table = jQuery("<table></table>");
    table.css("width", (this.get("numX") + 6) * 15);
    var tr;
    var td;
    for (var i = 0; i < this.get("numY"); i++) {
        tr = jQuery("<tr></tr>");
        for (var j = 0; j < this.get("numX"); j++) {
            td = jQuery("<td>\u00a0</td>");
            if (i == 0 && j == 0) {
                td.addClass("hover")
            }
            td.bind("mouseover", {
                rowId: i,
                colId: j
            }, function (e) {
                that.handleMouseOver(e, table)
            });
            td.bind("click", {
                rowId: i,
                colId: j
            }, function (e) {
                var rows = e.data.rowId + 1;
                var cols = e.data.colId + 1;
                GENTICS.Aloha.TablePlugin.createTable(cols, rows);
                that.hide()
            });
            tr.append(td)
        }
        table.append(tr)
    }
    layer.append(table);
    this.set("layer", layer);
    this.setPosition();
    layer.bind("click", function (e) {
        e.stopPropagation()
    }).mousedown(function (e) {
        e.stopPropagation()
    });
    jQuery("body").append(layer).bind("click", function (e) {
        if (e.target != that.get("target") && that.visible) {
            that.hide()
        }
    })
};
GENTICS.Aloha.Table.CreateLayer.prototype.handleMouseOver = function (e, table) {
    var rowId = e.data.rowId;
    var colId = e.data.colId;
    var innerRows = table.find("tr");
    for (var n = 0; n <= innerRows.length; n++) {
        var innerCells = jQuery(innerRows[n]).find("td");
        for (var k = 0; k <= innerCells.length; k++) {
            if (n <= rowId && k <= colId) {
                jQuery(innerCells[k]).addClass("hover")
            } else {
                jQuery(innerCells[k]).removeClass("hover")
            }
        }
    }
};
GENTICS.Aloha.Table.CreateLayer.prototype.setPosition = function () {
    var targetObj = jQuery(this.get("target"));
    var pos = targetObj.offset();
    this.get("layer").css("left", pos.left + "px");
    this.get("layer").css("top", (pos.top + targetObj.height()) + "px")
};
GENTICS.Aloha.Table.CreateLayer.prototype.hide = function () {
    this.get("layer").hide();
    this.visible = false
};
GENTICS.Aloha.Table.CreateLayer.prototype.get = function (property) {
    if (this.config[property]) {
        return this.config[property]
    }
    if (this.parameters[property]) {
        return this.parameters[property]
    }
    return undefined
};
GENTICS.Aloha.Table.CreateLayer.prototype.set = function (key, value) {
    if (this.config[key]) {
        this.config[key] = value
    } else {
        this.parameters[key] = value
    }
};
GENTICS.Aloha.TableHelper = function () {};
GENTICS.Aloha.TableHelper.prototype.selectionType = undefined;
GENTICS.Aloha.TableHelper.prototype.selectedCells = new Array();
GENTICS.Aloha.TableHelper.prototype.unselectCells = function () {
    if (this.selectedCells.length > 0) {
        for (var i = 0; i < this.selectedCells.length; i++) {
            jQuery(this.selectedCells[i]).removeClass(GENTICS.Aloha.TablePlugin.get("classCellSelected"))
        }
        this.selectedCells = new Array();
        this.selectionType = undefined
    }
};
GENTICS.Aloha.TableHelper.prototype.getNewTableID = function () {
    var idPrefix = "GENTICS_Table_";
    var factor = 1000000;
    for (this.tableCounter; true; this.tableCounter++) {
        var id = idPrefix + (Math.ceil(Math.random() * factor));
        for (var j = id.length; j < idPrefix.length + factor.toString().length; j++) {
            id += "0"
        }
        if (!jQuery("#" + id).length) {
            return id
        }
    }
};
GENTICS.Aloha.TableHelper = new GENTICS.Aloha.TableHelper();