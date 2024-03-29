if (typeof EXAMPLE == "undefined" || !EXAMPLE) {
    var EXAMPLE = {}
}
EXAMPLE.Product = new GENTICS.Aloha.Plugin("com.example.aloha.plugins.Product");
EXAMPLE.Product.languages = ["en", "de", "fr"];
EXAMPLE.Product.productField = null;
EXAMPLE.Product.init = function () {
    var that = this;
    jQuery("head").append('<link rel="stylesheet" type="text/css" href="' + GENTICS.Aloha.settings.base + '/plugins/com.example.aloha.plugins.Product/resources/product.css">');
    var insertButton = new GENTICS.Aloha.ui.Button({
        iconClass: "GENTICS_button GENTICS_button_product",
        size: "small",
        onclick: function () {
            that.insertProduct()
        },
        tooltip: this.i18n("button.insertproduct"),
        toggle: false
    });
    GENTICS.Aloha.FloatingMenu.addButton("GENTICS.Aloha.continuoustext", insertButton, GENTICS.Aloha.i18n(GENTICS.Aloha, "floatingmenu.tab.insert"), 1);
    GENTICS.Aloha.FloatingMenu.createScope(this.getUID("product"), "GENTICS.Aloha.global");
    this.productField = new GENTICS.Aloha.ui.AttributeField();
    this.productField.setTemplate('<span><b>{name}</b><span class="product-preview" style="background-image: url(' + GENTICS.Aloha.settings.base + '{url});"></span><br class="clear" /><i>{type}</i></span>');
    this.productField.setObjectTypeFilter(["product"]);
    this.productField.setDisplayField("name");
    GENTICS.Aloha.FloatingMenu.addButton(this.getUID("product"), this.productField, this.i18n("floatingmenu.tab.product"), 1);
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "selectionChanged", function (event, rangeObject) {
        var foundMarkup = that.findProduct(rangeObject);
        jQuery(".product-selected").removeClass("product-selected");
        if (foundMarkup.length != 0) {
            GENTICS.Aloha.FloatingMenu.setScope(that.getUID("product"));
            that.productField.setTargetObject(foundMarkup, "data-product-name");
            foundMarkup.addClass("product-selected")
        }
        GENTICS.Aloha.FloatingMenu.doLayout()
    });
    GENTICS.Aloha.EventRegistry.subscribe(GENTICS.Aloha, "editableDeactivated", function (jEvent, aEvent) {
        jQuery(".product-selected").removeClass("product-selected")
    })
};
EXAMPLE.Product.findProduct = function (range) {
    return jQuery(range.commonAncestorContainer).closest(".GENTICS_block.product")
};
EXAMPLE.Product.insertProduct = function () {
    GENTICS.Aloha.FloatingMenu.userActivatedTab = this.i18n("floatingmenu.tab.product");
    var range = GENTICS.Aloha.Selection.getRangeObject();
    var newProduct = jQuery('<div class="GENTICS_block product" contentEditable="false"><div class="image"></div><div class="name">' + this.i18n("newproductname") + "</div></div>");
    GENTICS.Utils.Dom.insertIntoDOM(newProduct, range, jQuery(GENTICS.Aloha.activeEditable.obj));
    range.startContainer = range.endContainer = newProduct.contents().get(0);
    range.select();
    this.productField.focus()
};
EXAMPLE.Product.updateProduct = function (obj, resourceItem) {
    obj.find(".name").text(resourceItem.name);
    obj.find(".image").css("backgroundImage", "url(" + GENTICS.Aloha.settings.base + resourceItem.url + ")")
};
