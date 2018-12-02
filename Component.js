sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	'sap/ui/model/json/JSONModel'
], function(UIComponent, Device, JSONModel) {
	"use strict";

	return UIComponent.extend("com.nvidia.vebs.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {

			// call super init (will call function "create content")
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize(); 

			// var oDataModel = this.getModel();
			// oDataModel.setDefaultCountMode("Inline");
			
			// oDataModel.setSizeLimit(500);
			// this.setModel(oDataModel);

			// oDataModel.attachMetadataLoaded(function() {}, this);

			// oDataModel.attachBatchRequestSent(function() {
			// 	sap.ui.core.BusyIndicator.show();
			// }, this);

			// oDataModel.attachBatchRequestCompleted(function() {
			// 	sap.ui.core.BusyIndicator.hide();
			// }, this);
			
		}
	});

});