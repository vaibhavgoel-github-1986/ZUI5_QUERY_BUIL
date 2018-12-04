jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-core");
jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-widget");
jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-mouse");
jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-sortable");
jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-droppable");
jQuery.sap.require("sap.ui.thirdparty.jqueryui.jquery-ui-draggable");

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Input",
	"com/nvidia/vebs/util/formatter"
], function(Controller, Dialog, JSONModel, Button, Label, Input, Formatter) {
	"use strict";

	return Controller.extend("com.nvidia.vebs.controller.QueryBuilder", {
		onInit: function() {

			this.getOwnerComponent().getRouter().getRoute("QueryBuilder").attachPatternMatched(this._onObjectMatched, this);

			var oModelJoins = new JSONModel();
			oModelJoins.setData([]);
			this.getView().setModel(oModelJoins, "oModelJoins");

			var oModelSelFields = new JSONModel();
			oModelSelFields.setData([]);
			this.getView().setModel(oModelSelFields, "oModelSelFields");

			var oModelTables = new JSONModel();
			oModelTables.setData([]);
			this.getView().setModel(oModelTables, "oModelTables");

			//Sorting Function
			this.firstBy = (function() {
				function e(f) {
					f.thenBy = t;
					return f;
				}

				function t(y, x) {
					x = this;
					return e(function(a, b) {
						return x(a, b) || y(a, b);
					});
				}
				return e;
			})();

		},

		_onObjectMatched: function(oEvent) {

		},

		onSwitchToggle: function(oEvent) {

			var bState = oEvent.getSource().getState();

			if (bState) {
				this._showEditor(true);
				//Generate Code
				this.generateCode();

			} else {
				this._showEditor(false);
			}
		},

		_showEditor: function(bFlag) {

			var oLeftPanel = this.getView().byId("idLeftPanel");

			if (bFlag) {
				oLeftPanel.getLayoutData().setSize("75%");
			} else {
				oLeftPanel.getLayoutData().setSize("100%");
			}
		},

		onAddTable: function(oEvent) {

			function getUnique(a) {
				var seen = {};
				return a.filter(function(item) {
					return seen.hasOwnProperty(item) ? false : (seen[item] = true);
				});
			}

			var dialog = new Dialog({
				title: 'Add Table(s)',
				type: 'Message',
				contentWidth: "380px",
				draggable: true,
				content: [
					new sap.m.Input('idTabname', {
						placeholder: "Table Name(s)",
						required: true,
						width: "350px",
						// maxLength: 30,
						showValueHelp: false,
						valueLiveUpdate: true,
						liveChange: function(oEvent) {
							var sText = oEvent.getParameter('value');
							var oParent = oEvent.getSource().getParent();
							if (sText.length > 0) {
								oParent.getBeginButton().setEnabled(true);
							} else {
								oParent.getBeginButton().setEnabled(false);
							}
							if (oEvent.getSource().getValue()) {
								oEvent.getSource().setValue(oEvent.getSource().getValue().trim().toUpperCase());
								oEvent.getSource().setValueState("None");
							}
						}.bind(this),
						submit: function(oEvent) {
							var sTabname = oEvent.getSource().getValue();
							var sAlias = sap.ui.getCore().byId('idAlias').getValue();
							if (sTabname === "") {
								this._showMessage("Please enter a table name", true);
								return;
							}

							dialog.close();

							sap.ui.core.BusyIndicator.show();

							var aTables = sTabname.split(",");
							var aAlias = sAlias.split(",");

							aTables = getUnique(aTables);
							aAlias = getUnique(aAlias);

							for (var i = 0; i < aTables.length; i++) {
								sAlias = "";

								if (aAlias[i]) {
									sAlias = aAlias[i];
								}

								if (aTables[i] !== "") {
									this.getTableFields(aTables[i], sAlias);
								}
							} 

							sap.ui.core.BusyIndicator.hide();

						}.bind(this)
					}),
					new sap.m.Input('idAlias', {
						placeholder: "Alias",
						required: true,
						width: "350px",
						// maxLength: 10,
						liveChange: function(oEvent) {
							if (oEvent.getSource().getValue()) {
								oEvent.getSource().setValue(oEvent.getSource().getValue().trim().toUpperCase());
								oEvent.getSource().setValueState("None");
							}
						},
						submit: function(oEvent) {
							var sTabname = sap.ui.getCore().byId('idTabname').getValue();
							var sAlias = sap.ui.getCore().byId('idAlias').getValue();

							dialog.close();

							sap.ui.core.BusyIndicator.show();

							var aTables = sTabname.split(",");
							var aAlias = sAlias.split(",");

							aTables = getUnique(aTables);
							aAlias = getUnique(aAlias);

							for (var i = 0; i < aTables.length; i++) {
								sAlias = "";

								if (aAlias[i]) {
									sAlias = aAlias[i];
								}

								if (aTables[i] !== "") {
									this.getTableFields(aTables[i], sAlias);
								}
							}

							sap.ui.core.BusyIndicator.hide();

						}.bind(this)
					})
				],
				beginButton: new Button({
					text: 'Submit',
					enabled: false,
					press: function() {
						var sTabname = sap.ui.getCore().byId('idTabname').getValue();
						var sAlias = sap.ui.getCore().byId('idAlias').getValue();

						dialog.close();

						sap.ui.core.BusyIndicator.show();

						var aTables = sTabname.split(",");
						var aAlias = sAlias.split(",");

						aTables = getUnique(aTables);
						aAlias = getUnique(aAlias);

						for (var i = 0; i < aTables.length; i++) {
							sAlias = "";

							if (aAlias[i]) {
								sAlias = aAlias[i];
							}

							if (aTables[i] !== "") {
								this.getTableFields(aTables[i], sAlias);
							}
						}

						sap.ui.core.BusyIndicator.hide();

					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}.bind(this)
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			this.getView().addDependent(dialog);

			dialog.open();
		},

		getTableFields: function(sTabname, sAlias) {

			if (this._checkDuplicateTable(sTabname, sAlias)) {
				return;
			}

			var afilters = [];
			afilters.push(new sap.ui.model.Filter("Tabname", sap.ui.model.FilterOperator.EQ, sTabname));

			this.getView().getModel().read("/FieldNamesSet", {
				filters: afilters,
				success: function(oData) {
					// sap.ui.core.BusyIndicator.hide();
					this.createTableBoxes(sTabname, sAlias, oData.results);
				}.bind(this),

				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					var sMsg = "Table " + sTabname + " does not exists";
					sap.m.MessageToast.show(sMsg);
				}
			});

		},

		_proposeJoins: function(sLTable, sRTable) {

			var oView = this.getView();

			var aJoins = oView.getModel("oModelJoins").getData();

			var aJoinsOut = [];

			for (var i = 0; i < aJoins.length; i++) {
				var oObj = {
					"TABNAMEL": aJoins[i].LTabname,
					"COLNAMEL": aJoins[i].LFieldname,
					"TABNAMER": aJoins[i].RTabname,
					"COLNAMER": aJoins[i].RFieldname,
					"TYPE": aJoins[i].JoinType,
					"OP": parseInt(0, 10)
				};
				aJoinsOut.push(oObj);
			}

			var sJoinsString = JSON.stringify(aJoinsOut);

			var aItems = oView.byId("idListTabBoxes").getItems();

			var aTablesOut = [];

			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getContent()[0] instanceof sap.m.Panel) {
					var sTabname = aItems[i].getContent()[0].getCustomData()[1].getValue();

					var oTab = {
						"TABNAME": sTabname,
						"RANK": parseInt(i, 10)
					};

					aTablesOut.push(oTab);
				}
			}

			var sTableString = JSON.stringify(aTablesOut);

			var sQuery = "SELECT_1";

			var afilters = [];
			afilters.push(new sap.ui.model.Filter("QueryId", sap.ui.model.FilterOperator.EQ, sQuery));
			afilters.push(new sap.ui.model.Filter("LTable", sap.ui.model.FilterOperator.EQ, sLTable));
			afilters.push(new sap.ui.model.Filter("RTable", sap.ui.model.FilterOperator.EQ, sRTable));
			if (sJoinsString !== "") {
				afilters.push(new sap.ui.model.Filter("JoinsData", sap.ui.model.FilterOperator.EQ, sJoinsString));
			}
			afilters.push(new sap.ui.model.Filter("TablesData", sap.ui.model.FilterOperator.EQ, sTableString));

			oView.getModel().read("/proposeJoinSet", {
				filters: afilters,
				success: function(oData) {
					for (i = 0; i < oData.results.length; i++) {
						var oJoinData = {
							"JoinKey": oData.results[i].JoinKey,
							"LTabRank": oData.results[i].LTabRank,
							"LTabname": oData.results[i].LTabname,
							"LFieldname": oData.results[i].LFieldname,
							"LFieldPos": oData.results[i].LFieldPos,
							"LFieldKeyflag": oData.results[i].LFieldKeyflag,
							"RTabRank": oData.results[i].RTabRank,
							"RTabname": oData.results[i].RTabname,
							"RFieldname": oData.results[i].RFieldname,
							"RFieldPos": oData.results[i].RFieldPos,
							"RFieldKeyflag": oData.results[i].RFieldKeyflag,
							"JoinType": oData.results[i].JoinType
						};
						//Adding newly proposed Join Conditions to existing data
						aJoins.push(oJoinData); //Automatically Model will get this data

						oView.getModel("oModelJoins").refresh();

						//Show Join Links
						this._showJoinLinks(aJoins);

						this.generateCode();
					}
				}.bind(this),

				error: function(error) {
					sap.m.MessageToast.show("Data fetching failed");
				}.bind(this)
			});
		},

		_showJoinLinks: function(aJoins) {

			var oView = this.getView();

			for (var i = 0; i < aJoins.length; i++) {
				var aSplit = aJoins[i].JoinKey.split("-");

				var oLTableModel = oView.getModel("oModel" + aSplit[0]);
				var aLTabData = oLTableModel.getData();
				var iLIndex = this._searchArray("Tabname", "Fieldname", aSplit[0], aSplit[1], aLTabData);
				aLTabData[iLIndex].JoinExists = true;
				oLTableModel.refresh(true);

				var oRTableModel = oView.getModel("oModel" + aSplit[2]);
				var aRTabData = oRTableModel.getData();
				var iRIndex = this._searchArray("Tabname", "Fieldname", aSplit[2], aSplit[3], aRTabData);
				aRTabData[iRIndex].JoinExists = true;
				oRTableModel.refresh(true);
			}
		},

		_checkDuplicateTable: function(sTabname, sAlias) {

			var oView = this.getView();

			//Check Duplicate Table name
			if (sTabname !== "") {
				var oObject = oView.byId(sTabname);
				if (oObject) {
					this._showMessage(sTabname + " has already been added");
					return true;
				}
			}

			if (sAlias === "") {
				return false;
			}

			var aTabBoxes = oView.byId("idListTabBoxes").getItems();

			//Looping all the added tables
			for (var i = 0; i < aTabBoxes.length; i++) {
				var oContent = aTabBoxes[i].getContent()[0]; //Panel Inside CustomListItem

				if (oContent instanceof sap.m.Panel) {
					var sExistingTabname = oContent.getCustomData()[1].getValue();
					var sExitingAlias = oContent.getCustomData()[2].getValue();

					if (sAlias.toUpperCase() === sExitingAlias.toUpperCase()) {
						this._showMessage("Alias: '" + sAlias + "' has already been used for table: " + sExistingTabname);
						return true;
					}
				}
			}

			//Default Return is false
			return false;
		},

		_onEditAlias: function(oEvent) {

			var oTablePanel = oEvent.getSource().getParent().getParent();
			var sTabname = oTablePanel.getCustomData()[1].getValue();
			var sExistingAlias = oTablePanel.getCustomData()[2].getValue();

			var dialog = new Dialog({
				title: 'Edit Alias',
				type: 'Message',
				draggable: true,
				content: [
					new sap.m.Input({
						value: sTabname,
						maxLength: 30,
						editable: false
					}),
					new Input('idAlias', {
						value: sExistingAlias,
						required: true,
						maxLength: 10,
						liveChange: function(oEvent) {
							if (oEvent.getSource().getValue()) {
								oEvent.getSource().setValue(oEvent.getSource().getValue().trim().toUpperCase());
								oEvent.getSource().setValueState("None");
							}
						}.bind(this),
						submit: function(oEvent) {
							var sNewAlias = oEvent.getSource().getValue();

							if (sExistingAlias.toUpperCase() === sNewAlias.toUpperCase()) {
								dialog.close();
							} else {
								var bDuplicate = this._checkDuplicateTable("", sNewAlias);
								if (!bDuplicate) {
									this._updateHeading(oTablePanel, sTabname, sNewAlias);
									//Generate Code
									this.generateCode();
									dialog.close();
								}
							}
						}.bind(this)
					})
				],
				beginButton: new Button({
					text: 'Submit',
					enabled: true,
					press: function() {
						var sNewAlias = sap.ui.getCore().byId('idAlias').getValue();

						if (sExistingAlias.toUpperCase() === sNewAlias.toUpperCase()) {
							dialog.close();
						} else {
							var bDuplicate = this._checkDuplicateTable("", sNewAlias);
							if (!bDuplicate) {
								this._updateHeading(oTablePanel, sTabname, sNewAlias);
								//Generate Code
								this.generateCode();
								dialog.close();
							}
						}
					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}.bind(this)
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();

		},

		_updateHeading: function(oTablePanel, sTabname, sNewAlias) {

			if (sNewAlias !== "") {
				var sTitle = sTabname + " ~ " + sNewAlias;
			} else {
				sTitle = sTabname;
			}

			oTablePanel.getCustomData()[2].setValue(sNewAlias);

			oTablePanel.getHeaderToolbar().getContent()[0].setText(sTitle);

		},

		createTableBoxes: function(sTabname, sAlias, oData) {

			var oView = this.getView();

			var bState = oView.byId("idLiveCodeBtn").getState();

			if (bState) {
				this._showEditor(true);

			} else {
				this._showEditor(false);
			}

			//Creating JSON Model for each Table   
			var oModel = new JSONModel();
			oModel.setData(oData);

			var sModelName = "oModel" + sTabname;

			oView.setModel(oModel, sModelName);

			if (sAlias !== "") {
				var sTitle = sTabname + " ~ " + sAlias;
			} else {
				sTitle = sTabname;
			}

			var oCustomData = new sap.ui.core.CustomData({
				key: "Tabname",
				value: sTabname
			});

			var oCustomData1 = new sap.ui.core.CustomData({
				key: "Alias",
				value: sAlias
			});

			//Create a Panel
			var oPanel = new sap.m.Panel(oView.createId(sTabname), {
				backgroundDesign: "Transparent",
				expandable: false,
				expanded: true,
				width: "310px",
				height: "350px",
				customData: [oCustomData, oCustomData1],
				expand: [this._onPanelExpand, this],
				headerToolbar: new sap.m.Toolbar({
					design: "Transparent",
					style: "Clear",
					content: [new sap.m.Title({
							text: sTitle,
							level: "H6"
						}).addStyleClass("sapUiSmallMarginBegin"),
						new sap.m.ToolbarSpacer(),
						new Button({
							icon: "sap-icon://edit",
							type: "Ghost",
							press: [this._onEditAlias, this]
						}),
						new Button({
							icon: "sap-icon://sys-cancel",
							type: "Ghost",
							press: [this._onDelTable, this]
						})
					]
				})
			}).addStyleClass("zep_TableBox sapUiSizeCompact");

			oCustomData = [new sap.ui.core.CustomData({
					key: "Tabname",
					value: "{" + sModelName + ">" + "Tabname" + "}"
				}),
				new sap.ui.core.CustomData({
					key: "Fieldname",
					value: "{" + sModelName + ">" + "Fieldname" + "}"
				})
			];

			var oFieldname = new sap.m.Text({
				text: {
					parts: [{
						path: sModelName + ">" + "Fieldname"
					}, {
						path: sModelName + ">" + "Keyflag"
					}],
					formatter: function(sValue, bKeyflag) {
						if (bKeyflag) {
							this.addStyleClass("zep_TableKey");
						}
						return sValue;
					}
				},
				width: "110px",
				wrapping: true
			});

			var oDesc = new sap.m.Text({
				text: {
					parts: [{
						path: sModelName + ">" + "Description"
					}, {
						path: sModelName + ">" + "Keyflag"
					}],
					formatter: function(sValue, bKeyflag) {
						if (bKeyflag) {
							this.addStyleClass("zep_TableKey");
						}
						return sValue;
					}
				},
				width: "110px",
				wrapping: true
			}).addStyleClass("sapUiSmallMarginBegin");

			var oJoinIcon = new sap.ui.core.Icon({
				src: "sap-icon://chain-link",
				size: "17px",
				press: [this._onJoinClick, this],
				visible: "{" + sModelName + ">" + "JoinExists" + "}",
				//	hoverColor: "rgb(163,216,164)"
				color: "#2ea70f"
			}).addStyleClass("sapUiTinyMarginBegin");

			//Creating Popover ListItems and Bindings
			var oPopoverItem = this._createItem();

			var aSorter = [];

			aSorter.push(new sap.ui.model.Sorter({
				path: "LTabRank",
				descending: false
			}));

			aSorter.push(new sap.ui.model.Sorter({
				path: "RTabRank",
				descending: false
			}));

			var oListItem = new sap.m.CustomListItem({
				customData: oCustomData,
				//type: "Active",
				content: [new sap.m.HBox({
					items: [oFieldname, oDesc, oJoinIcon]
				})],
				dependents: [new sap.m.Popover({
					showHeader: true,
					title: "Join Condition(s)",
					content: new sap.m.List({
						items: {
							path: "oModelJoins>/",
							template: oPopoverItem,
							sorter: aSorter,
							templateShareable: false
						}
					}).addStyleClass("zep_joinConditions"),
					placement: "Auto"
				}).addStyleClass("sapUiContentPadding")]
			});

			var oList = new sap.m.List(oView.createId(sTabname + "List"), {
				includeItemInSelection: true,
				selectionChange: [this._onFieldSelect, this],
				mode: "MultiSelect",
				sticky: ["HeaderToolbar"],
				headerToolbar: new sap.m.Toolbar({
					design: "Transparent",
					style: "Clear",
					content: [new sap.m.SearchField({
							liveChange: [this._onFieldSearch, this],
							width: "100%",
							showSearchButton: false,
							placeholder: "Field Name, Description"
						}),
						new sap.m.ToggleButton({
							icon: "sap-icon://chain-link",
							press: [this._showLinks, this],
							pressed: false
						}),
						new Button({
							icon: "sap-icon://multiselect-none",
							press: [this._DeselectAll, this]
						})
					]
				}),
				items: {
					path: sModelName + ">/",
					template: oListItem
				},
				dragDropConfig: [new sap.ui.core.dnd.DragInfo({
						groupName: "Fields",
						sourceAggregation: "items"
					}),
					new sap.ui.core.dnd.DropInfo({
						groupName: "Fields",
						dropEffect: "Link",
						dropLayout: "Horizontal",
						dropPosition: "On",
						targetAggregation: "items",
						drop: [this.onDropField, this]
					})
				]
			}).addStyleClass("zep_TableList");

			oPanel.addContent(oList);

			var oTabBoxItem = new sap.m.CustomListItem({
				content: oPanel
			}).addStyleClass("zep_TableMainBox");

			var oListTabBoxes = oView.byId("idListTabBoxes");

			//Add Join Link Icon between the Panels first
			if (oListTabBoxes.getItems().length > 0) {
				this._createJoiningLink(oListTabBoxes);
			}

			oListTabBoxes.addItem(oTabBoxItem);

			//Create Join Links Automatically
			var aItems = oListTabBoxes.getItems();

			if (aItems.length > 1) {
				//Get Left Table name
				var iLeft = oListTabBoxes.indexOfItem(oTabBoxItem);
				var sLTable = aItems[iLeft - 2].getContent()[0].getCustomData()[1].getValue();
				//Newly added table becomes the Right Table
				this._proposeJoins(sLTable, sTabname);
			}

			//Add Table in Data Model
			var oModelTable = this.getView().getModel("oModelTables");
			var oTable = {
				"Tabname": sTabname,
				"Rank": parseInt(oListTabBoxes.indexOfItem(oTabBoxItem), 10)
			};
			var aTables = oModelTable.getData();
			aTables.push(oTable);
			oModelTable.setData(aTables);
			oModelTable.refresh();

			//Generate Code
			this.generateCode();

		},

		_onFieldSelect: function(oEvent) {

			var oModelSelFields = this.getView().getModel("oModelSelFields");

			var aData = oModelSelFields.getData();

			var oListItem = oEvent.getParameters().listItem;

			var bSelected = oEvent.getParameters().selected;

			var sTabname = oListItem.getCustomData()[0].getValue();
			var sFieldname = oListItem.getCustomData()[1].getValue();

			if (bSelected) {
				var oObj = {
					"Counter": parseInt(aData.length + 1, 10),
					"Tabname": sTabname,
					"Fieldname": sFieldname,
					"FieldAlias": ""
				};

				aData.push(oObj);
				oModelSelFields.refresh();

			} else { //Deleting the Field/Unselect
				var iIndex = this._searchArray("Tabname", "Fieldname", sTabname, sFieldname, aData);

				aData.splice(iIndex, 1);

				//Reorder the counter
				for (var i = 0; i < aData.length; i++) {
					aData[i].Counter = i + 1;
				}
				oModelSelFields.refresh();
			}

			//Refresh the Code
			this.generateCode();

		},

		onReorderFields: function(oEvent) {

			var oParams = oEvent.getParameters();

			//	var oListFields = this.getView().byId("idListFields");

			var oModelSelFields = this.getView().getModel("oModelSelFields");

			var aData = oModelSelFields.getData();

			//This index is also same as Context Path Index
			// var iIndexDrag = oListFields.indexOfItem(oParams.draggedControl);
			// var iIndexDrop = oListFields.indexOfItem(oParams.droppedControl);

			var iIndexDrag = oParams.draggedControl.getBindingContext("oModelSelFields").getPath().substr(1);
			var iIndexDrop = oParams.droppedControl.getBindingContext("oModelSelFields").getPath().substr(1);

			if (iIndexDrop === iIndexDrag) {
				return;
			}

			var sDropPosition = oEvent.getParameters().dropPosition;

			var iMoveto = 0;

			if (sDropPosition === "After") {
				iMoveto = iIndexDrop + 1;
			} else {
				iMoveto = iIndexDrop;
			}

			Array.prototype.move = function(from, to) {
				this.splice(to, 0, this.splice(from, 1)[0]);
				return this;
			};

			aData.move(iIndexDrag, iMoveto);

			//Re-sequence the counters
			for (var i = 0; i < aData.length; i++) {
				aData[i].Counter = i + 1;
			}

			oModelSelFields.refresh();

			//Refresh the Code
			this.generateCode();

		},

		onFieldAlias: function(oEvent) {
			if (oEvent.getSource().getValue()) {
				oEvent.getSource().setValue(oEvent.getSource().getValue().trim().toLowerCase());
				oEvent.getSource().setValueState("None");
			}
		},

		_createJoiningLink: function(oListTabBoxes) {

			var oLinkItem = new sap.m.CustomListItem({
				content: [new sap.m.VBox({
						items: [new sap.m.Switch({
							customTextOn: "Inner",
							customTextOff: "Outer",
							state: true,
							change: [this._toggleJoinType, this]
						}).addStyleClass("sapUiSizeCompact")]

						//  [new sap.ui.core.Icon({
						// 	src: "sap-icon://share-2",
						// 	size: "28px",
						// 	color: "rgb(52,97,135)",
						// 	press: [this._onTableJoinClick, this]
						// })]
					}).addStyleClass("zep_Switch")]
					// dependents: [new sap.m.Popover({
					// 	showHeader: true,
					// 	title: "Join Condition",
					// 	content: [new sap.m.SegmentedButton({
					// 		selectedKey: "inner",
					// 		items: [new sap.m.SegmentedButtonItem({
					// 				key: "inner",
					// 				text: "Inner"
					// 			}),
					// 			new sap.m.SegmentedButtonItem({
					// 				key: "outer",
					// 				text: "Outer"
					// 			})
					// 		]
					// 	})],
					// 	placement: "Bottom"
					// }).addStyleClass("sapUiContentPadding")]
			}).addStyleClass("zep_TableMainBox zep_TableJoinLink");

			oListTabBoxes.addItem(oLinkItem);

		},

		_toggleJoinType: function(oEvent) {

			//Check iilegal Join
			if (this._checkIllegalJoin(null, null, oEvent.getSource())) {
				return;
			}

			//Update the Join Type in Model
			this._updateJoinType(oEvent.getSource());

			//Generate Code
			this.generateCode();

		},

		_onTableJoinClick: function(oEvent) {

			var oListItem = oEvent.getSource().getParent().getParent();
			var oPopover = oListItem.getDependents()[0];
			oPopover.openBy(oEvent.getSource());

		},

		onDropTabBox: function(oEvent) {

			var oParams = oEvent.getParameters();

			if (oParams.draggedControl.getContent()[0] instanceof sap.m.VBox) {
				this._showMessage("Only Tables can be Swapped");
				return;
			}

			if (oParams.droppedControl.getContent()[0] instanceof sap.m.VBox) {
				this._showMessage("Only Tables can be Swapped");
				return;
			}

			if (oParams.droppedControl.getId() === oParams.draggedControl.getId()) {
				return;
			}

			//No. of tables
			var oMainList = this.getView().byId("idListTabBoxes");

			var iTables = oMainList.getItems().length;

			var iJoins = this.getView().getModel("oModelJoins").getData().length;

			//Refresh the Joining Links
			if (iJoins > 0 && iTables > 3) {
				var dialog = new Dialog({
					title: "Confirm",
					type: "Message",
					content: new sap.m.Text({
						text: "Joining Links will be refreshed. Do you want to continue ?"
					}),
					beginButton: new Button({
						text: "Yes",
						press: function() {
							dialog.close();
							this._swapTables(oParams);
							this._refreshAllJoins();
							//Refresh the code
							this.generateCode();
						}.bind(this)
					}),
					endButton: new Button({
						text: "No",
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			} else {
				this._swapTables(oParams); //Allow normal swap if only 2 tables are there
				//Refresh the code
				this.generateCode();
			}

		},

		_swapTables: function(oParams) {

			var oMainList = this.getView().byId("idListTabBoxes");

			var iIndexDragged = oMainList.indexOfItem(oParams.draggedControl);
			var iIndexDropped = oMainList.indexOfItem(oParams.droppedControl);

			var aItems = oMainList.getItems();
			var aIndexes = [];
			for (var i = 0; i < aItems.length; i++) {
				aIndexes.push(oMainList.indexOfItem(aItems[i]));
			}
			var temp = aIndexes[iIndexDragged];
			aIndexes[iIndexDragged] = iIndexDropped;
			aIndexes[iIndexDropped] = temp;

			oMainList.removeAllItems();

			//Add back the items in desired sequence
			for (i = 0; i < aIndexes.length; i++) {
				oMainList.addItem(aItems[aIndexes[i]]);
			}

			//Swap Message
			var sTable1 = oParams.draggedControl.getContent()[0].getCustomData()[1].getValue();
			var sTable2 = oParams.droppedControl.getContent()[0].getCustomData()[1].getValue();

			var sMsg = "Tables: " + sTable1 + " and " + sTable2 + " were swapped";
			this._showMessage(sMsg, false);

			//Readjust Joins data on Tables DragnDrop
			var oModelJoins = this.getView().getModel("oModelJoins");
			var aJoins = oModelJoins.getData();

			//Get Sequence of Tables
			var oTableMap = new Map();
			aItems = oMainList.getItems();
			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getContent()[0] instanceof sap.m.Panel) {
					var sTabname = aItems[i].getContent()[0].getCustomData()[1].getValue();
					oTableMap.set(sTabname, i);
				}
			}

			//Update the Table Ranking in JSON Model as well
			var oModelTable = this.getView().getModel("oModelTables");
			var aTables = oModelTable.getData();
			for (i = 0; i < aTables.length; i++) {
				aTables[i].Rank = oTableMap.get(aTables[i].Tabname);
			}
			aTables.sort(function(a, b) {
				return a.Rank - b.Rank;
			});
			oModelTable.refresh();

			//Readjust Joins data on Tables DragnDrop
			for (var j = 0; j < aJoins.length; j++) {
				var iLTabRank = oTableMap.get(aJoins[j].LTabname);
				var iRTabRank = oTableMap.get(aJoins[j].RTabname);

				//Swap Left to Right
				if (iLTabRank > iRTabRank) {
					var temp1 = aJoins[j].LTabname;
					var temp2 = aJoins[j].LFieldname;
					aJoins[j].LTabname = aJoins[j].RTabname;
					aJoins[j].LFieldname = aJoins[j].RFieldname;
					aJoins[j].RTabname = temp1;
					aJoins[j].RFieldname = temp2;

					aJoins[j].JoinKey = [aJoins[j].LTabname, aJoins[j].LFieldname, aJoins[j].RTabname, aJoins[j].RFieldname].join(
						"-");
					aJoins[j].LTabRank = parseInt(oTableMap.get(aJoins[j].LTabname), 10);
					aJoins[j].RTabRank = parseInt(oTableMap.get(aJoins[j].RTabname), 10);
				} else { //Just Update the new Ranking
					aJoins[j].LTabRank = parseInt(oTableMap.get(aJoins[j].LTabname), 10);
					aJoins[j].RTabRank = parseInt(oTableMap.get(aJoins[j].RTabname), 10);
				}
			}

			oModelJoins.refresh(true);

			//Generate Code
			this.generateCode();

		},

		_refreshAllJoins: function() {

			var oView = this.getView();

			var oMainList = oView.byId("idListTabBoxes");

			var aItems = oMainList.getItems();

			for (var i = 0; i < aItems.length; i++) {
				if (aItems[i].getContent()[0] instanceof sap.m.Panel) {
					var sTabname = aItems[i].getContent()[0].getCustomData()[1].getValue();
					var oTableModel = oView.getModel("oModel" + sTabname);
					var aTableData = oTableModel.getData();
					for (var j = 0; j < aTableData.length; j++) {
						aTableData[j].JoinExists = false;
					}
					oTableModel.refresh(true);
				}
			}

			//Delete all Joins Data
			var aJoins = oView.getModel("oModelJoins").getData();
			aJoins.splice(0, aJoins.length);
			oView.getModel("oModelJoins").refresh();

		},

		onDropField: function(oEvent) {

			var oParams = oEvent.getParameters();

			if (oParams.droppedControl.getParent() === oParams.draggedControl.getParent()) {
				this._showMessage("Fields of the same table cannot be linked");
				return;
			}

			//Updating Joins Model and Activating LINK Icon
			this._addPopoverItem(oParams.draggedControl, oParams.droppedControl);

			//Generate Code
			this.generateCode();
		},

		_addPopoverItem: function(oDragControl, oDropControl) {

			var oDragFieldDetails = this._getContextData(oDragControl);
			var oDropFieldDetails = this._getContextData(oDropControl);

			//To figure out which is Left and right table
			var oJoinData = this._getJoinData(oDragControl, oDropControl, oDragFieldDetails, oDropFieldDetails);

			var oModelJoins = this.getView().getModel("oModelJoins");
			var aJoins = oModelJoins.getData();

			//Check if Join is already there between these fields
			if (this._checkDuplicate(aJoins, oJoinData)) {
				this._showMessage("Join Condition already exists");
				return;
			}

			//Check for Invalid Joins
			if (this._checkIllegalJoin(oDragControl, oDropControl, null)) {
				return;
			}

			//Join Arrays Data
			aJoins.push(oJoinData);

			//Activate Link icon
			oDragControl.getContent()[0].getItems()[2].setVisible(true);
			oDropControl.getContent()[0].getItems()[2].setVisible(true);

			//Add BG Color for highlighting
			// oDragControl.addStyleClass("zep_LinkHighlight");
			// oDropControl.addStyleClass("zep_LinkHighlight");

			oModelJoins.setData(aJoins);
			oModelJoins.refresh(true);

		},

		_checkDuplicate: function(aJoins, oJoinData) {

			for (var i in aJoins) {
				if ((aJoins[i].LTabname === oJoinData.LTabname && aJoins[i].LFieldname === oJoinData.LFieldname) &&
					(aJoins[i].RTabname === oJoinData.RTabname && aJoins[i].RFieldname === oJoinData.RFieldname)) {
					return true;
				}
			}

		},

		_checkInvalidOuterJoin: function(oLinkControl) {

			var oTabnames = this._getLRTabnames(oLinkControl);

			var aJoins = this.getView().getModel("oModelJoins").getData();

			var sMsg = "Illegal left-outer-join chain between tables: ";

			//Left table is already right table of other left outer join
			var iIndex = this._searchArray("RTabname", "JoinType", oTabnames.LTabname, 2, aJoins);
			if (iIndex > 0) { //If the value is found
				this._showMessage(sMsg + aJoins.LTabname + ", " + aJoins.RTabname + " and " + aJoins[iIndex].LTabname);
				return true;
			}

			//Right table is left table of other left-outer join
			iIndex = this._searchArray("LTabname", "JoinType", oTabnames.RTabname, 2, aJoins);
			if (iIndex > 0) { //If the value is found
				this._showMessage(sMsg + aJoins.LTabname + ", " + aJoins.RTabname + " and " + aJoins[iIndex].RTabname);
				return true;
			}

			//A join which would be forced would lead to an error:
			//is a join with right table tabnamer defined
			//between a table with a left outer join
			for (var i = 0; i < aJoins.length; i++) {
				if (aJoins[i].RTabname === oTabnames.RTabname) {
					for (var j = 0; j < aJoins.length; j++) {
						if (aJoins[j].RTabname === oTabnames.LTabname && aJoins[j].JoinType === 1) {
							this._showMessage(sMsg + aJoins.LTabname + ", " + aJoins.RTabname + " and " + aJoins[iIndex].RTabname);
							return true;
						}
					}
				}
			}

			//A join which would be forced would lead to an error:
			//new join is type left_outer , but r.h.s. table is
			//connected to more than one table
			for (i = 0; i < aJoins.length; i++) {
				if (aJoins[i].RTabname === oTabnames.RTabname) {
					if (aJoins[i].LTabname !== oTabnames.LTabname) {
						this._showMessage(oTabnames.RTabname + " cannot be connected to two tables using left-outer join");
						return true;
					}
				}
			}
		},

		_checkIllegalJoin: function(oDragControl, oDropControl, oLinkControl) {

			var oMainList = this.getView().byId("idListTabBoxes");

			if (oLinkControl) {
				//If Toggling to Outer Join
				if (this._getJoinTypeByControl(null, null, oLinkControl) === 1) {
					if (this._checkInvalidOuterJoin(oLinkControl)) {
						//Again set the Join Type to Inner Join
						oLinkControl.setState(true); //Inner Join
						return true;
					}
				}
			}

			if (oDragControl && oDropControl) {
				var iDragTableBox = oMainList.indexOfItem(oDragControl.getParent().getParent().getParent());
				var iDropTableBox = oMainList.indexOfItem(oDropControl.getParent().getParent().getParent());

				if (iDragTableBox < iDropTableBox) {
					var oLeftData = this._getContextData(oDragControl);
					var oRightData = this._getContextData(oDropControl);
				} else {
					oLeftData = this._getContextData(oDropControl);
					oRightData = this._getContextData(oDragControl);
				}

				//If fields are incompatibile for a join
				if ((oLeftData.DataType !== oRightData.DataType) ||
					(oLeftData.Leng !== oRightData.Leng) ||
					(oLeftData.Decimals !== oRightData.Decimals)) {
					this._showMessage("Illegal Join: Fields are not compatible");
					return true;
				}

				var aJoins = this.getView().getModel("oModelJoins").getData();

				// // is the type of the joins between the tables inconsistent?
				// // = Are there other joins towards the right table of different type?
				for (var i = 0; i < aJoins.length; i++) {
					if (aJoins[i].RTabname === oRightData.Tabname) {
						if (!(aJoins[i].LTabname === oLeftData.Tabname &&
								aJoins[i].LFieldname === oLeftData.Fieldname &&
								aJoins[i].RFieldname === oRightData.Fieldname)) {
							if (aJoins[i].JoinType !== 0) { //0 = Inner Join
								this._showMessage("No left outer join can be defined here");
								return true;
							}
						}
					}
				}
			}

		},

		_getJoinData: function(oDragControl, oDropControl, oDragFieldDetails, oDropFieldDetails) {

			var oMainList = this.getView().byId("idListTabBoxes");

			var iDragTableBox = oMainList.indexOfItem(oDragControl.getParent().getParent().getParent());
			var iDropTableBox = oMainList.indexOfItem(oDropControl.getParent().getParent().getParent());

			if (iDragTableBox < iDropTableBox) {
				var LTabRank = parseInt(iDragTableBox, 10),
					LTabname = oDragFieldDetails.Tabname,
					LFieldname = oDragFieldDetails.Fieldname,
					LFieldPos = oDragFieldDetails.Position,
					LFieldKeyflag = oDragFieldDetails.Keyflag,
					RTabRank = parseInt(iDropTableBox, 10),
					RTabname = oDropFieldDetails.Tabname,
					RFieldname = oDropFieldDetails.Fieldname,
					RFieldPos = oDropFieldDetails.Position,
					RFieldKeyflag = oDropFieldDetails.Keyflag;
			} else {
				LTabRank = parseInt(iDropTableBox, 10);
				LTabname = oDropFieldDetails.Tabname;
				LFieldname = oDropFieldDetails.Fieldname;
				LFieldPos = oDropFieldDetails.Position;
				LFieldKeyflag = oDropFieldDetails.Keyflag;
				RTabRank = parseInt(iDragTableBox, 10);
				RTabname = oDragFieldDetails.Tabname;
				RFieldname = oDragFieldDetails.Fieldname;
				RFieldPos = oDragFieldDetails.Position;
				RFieldKeyflag = oDragFieldDetails.Keyflag;
			}

			var sJoinKey = [LTabname, LFieldname, RTabname, RFieldname].join("-");

			var oJoinData = {
				"JoinKey": sJoinKey,
				"LTabRank": LTabRank,
				"LTabname": LTabname,
				"LFieldname": LFieldname,
				"LFieldPos": LFieldPos,
				"LFieldKeyflag": LFieldKeyflag,
				"RTabRank": RTabRank,
				"RTabname": RTabname,
				"RFieldname": RFieldname,
				"RFieldPos": RFieldPos,
				"RFieldKeyflag": RFieldKeyflag,
				"JoinType": this._getJoinTypeByControl(oDragControl, oDropControl, null) //0 = Inner, 1 = Outer
			};

			return oJoinData;
		},

		_createItem: function(oJoinData) {

			var sLText = "{oModelJoins>LTabname}~{oModelJoins>LFieldname}";
			var sRText = "{oModelJoins>RTabname}~{oModelJoins>RFieldname}";

			var oCustomData = new sap.ui.core.CustomData({
				key: "JoinKey",
				value: "{oModelJoins>JoinKey}"
			});

			var oPopoverItem = new sap.m.CustomListItem({
				customData: oCustomData,
				content: [new sap.m.HBox({
					items: [
						new sap.m.HBox({
							items: [
								new sap.m.Text({
									text: sLText
								}).addStyleClass("sapUiTinyMarginEnd"),
								new sap.m.Text({
									text: "="
								}).addStyleClass("sapUiTinyMarginEnd"),
								new sap.m.Text({
									text: sRText
								}).addStyleClass("sapUiSmallMarginEnd")
							]
						}).addStyleClass("zep_LinkHBox"),
						// new sap.m.SegmentedButton({
						// 	selectedKey: "{oModelJoins>JoinType}",
						// 	items: [new sap.m.SegmentedButtonItem({
						// 			key: "inner",
						// 			text: "Inner"
						// 		}),
						// 		new sap.m.SegmentedButtonItem({
						// 			key: "outer",
						// 			text: "Outer"
						// 		})
						// 	]
						// }).addStyleClass("sapUiTinyMarginEnd"),
						new sap.m.Button({
							icon: "sap-icon://delete",
							press: [this._onDelJoin, this]
						})
					]
				})]
			});

			return oPopoverItem;
		},

		_onFieldAliasSubmit: function(oEvent) {

			var sAlias = oEvent.getSource().getValue();

			var aFields = this.getView().getModel("oModelSelFields").getData();

			var sTabname = oEvent.getSource().getParent().getParent().getCustomData()[0].getValue();
			var sFieldname = oEvent.getSource().getParent().getParent().getCustomData()[1].getValue();

			for (var i = 0; i < aFields.length; i++) {
				if (aFields[i].Tabname === sTabname && aFields[i].Fieldname === sFieldname) {
					continue;
				}

				if (aFields[i].FieldAlias === sAlias) {
					var oFound = aFields[i];
					break;
				}
			}

			if (oFound) {
				var sErrorText = "Alias already used for field: " + oFound.Tabname + "-" + oFound.Fieldname;
				oEvent.getSource().setValueState("Error");
				oEvent.getSource().setValueStateText(sErrorText);
				return;
			}

			//Refresh Code
			this.generateCode();

		},

		_onDelJoin: function(oEvent) {

			var sJoinKey = oEvent.getSource().getParent().getParent().getCustomData()[0].getValue();

			var oModelJoins = this.getView().getModel("oModelJoins");

			var aJoins = oModelJoins.getData();

			//Delete this Join Link from the Model/Array
			for (var i in aJoins) {
				if (aJoins[i].JoinKey === sJoinKey) {
					var oDeletedJoin = aJoins[i];
					aJoins.splice(i, 1);
					break;
				}
			}

			oModelJoins.refresh(true);

			//Hide the Join Link Icon if No Joins are there any more
			this._HideJoinLinks(oDeletedJoin, aJoins);

			//Generate Code
			this.generateCode();

		},

		_searchArray: function(sKey1, sKey2, sSearch1, sSearch2, aDataSet) {

			for (var i = 0; i < aDataSet.length; i++) {
				if (aDataSet[i][sKey1] === sSearch1 && aDataSet[i][sKey2] === sSearch2) {
					return i;
				}
			}
			return -1;
		},

		_getContextData: function(oControl, sModelName) {

			if (sModelName) {
				var sModel = sModelName;
			} else {
				sModel = "";

				oControl.getCustomData().forEach(function(oCustomData) {
					if (oCustomData.getKey() === "Tabname") {
						sModel = "oModel" + oCustomData.getValue();
						return;
					}
				});

			}
			var aData = this.getView().getModel(sModel).getData();
			var iIndex = oControl.getBindingContext(sModel).getPath().substr(1);
			return aData[iIndex];
		},

		_onPanelExpand: function(oEvent) {

			var oPanel = oEvent.getSource();

			oPanel.toggleStyleClass("zep_TableBox");

			oPanel.toggleStyleClass("zep_collapsed");

		},

		_delSelectedFields: function(sTabname) {

			var oModelSelFields = this.getView().getModel("oModelSelFields");

			var aData = oModelSelFields.getData();

			for (var i = aData.length - 1; i >= 0; i--) {
				if (aData[i].Tabname === sTabname) {
					aData.splice(i, 1);
				}
			}

			i = 0;

			//Reorder the counter
			for (i = 0; i < aData.length; i++) {
				aData[i].Counter = i + 1;
			}

			oModelSelFields.refresh();

			//Refresh the Code
			this.generateCode();
		},

		_onDelTable: function(oEvent) {

			var oPanel = oEvent.getSource().getParent().getParent();

			var sTabname = "";

			oPanel.getCustomData().forEach(function(oCustomData) {
				if (oCustomData.getKey() === "Tabname") {
					sTabname = oCustomData.getValue();
					return;
				}
			});

			//Delete the Joins related to that table
			var oModelJoins = this.getView().getModel("oModelJoins");

			//Delete this Join Link from the Model/Array
			var aJoins = oModelJoins.getData();

			for (var i = aJoins.length - 1; i >= 0; i--) {
				if (aJoins[i].LTabname === sTabname || aJoins[i].RTabname === sTabname) {
					//Join Link Hide
					var oDeletedJoin = aJoins[i];
					aJoins.splice(i, 1);
					this._HideJoinLinks(oDeletedJoin, aJoins);
				}
			}

			oModelJoins.refresh(true);

			//Delete the Link Icon before that Table Box as well
			var oListTabBoxes = this.getView().byId("idListTabBoxes");
			var iIndex = oListTabBoxes.indexOfItem(oPanel.getParent()); //Index of item/table being deleted

			var aItems = oListTabBoxes.getItems();

			if (iIndex > 0) {
				var oTabLinkIcon = aItems[iIndex - 1];
				//Destroy the table link icon before the table being deleted
				oTabLinkIcon.destroy();
			} else if (iIndex === 0 && aItems.length > 1) {
				oTabLinkIcon = aItems[iIndex + 1];
				//Destroy the table link icon before the table being deleted
				oTabLinkIcon.destroy();
			}

			//Destroy the table item deleted
			oPanel.getParent().destroy();

			//Destroy the JSON Model of the table as well
			this.getView().getModel("oModel" + sTabname).destroy();

			//Check no. of Table lefts
			var iTables = this.getView().byId("idListTabBoxes").getItems().length;
			if (iTables === 0) {
				this._showEditor(false);
				this.getView().byId("idOutputCode").setValue("");
				this.getView().byId("idLiveCodeBtn").setState(false);
			}

			//Delete the selected fields if any for this table
			this._delSelectedFields(sTabname);

			var oModelTable = this.getView().getModel("oModelTables");
			var aTables = oModelTable.getData();
			var iDelete = this._getIndexByKey("Tabname", sTabname, aTables);
			aTables.splice(iDelete, 1);
			oModelTable.refresh();

			//Generate Code
			this.generateCode();
		},

		_HideJoinLinks: function(oDeletedJoin, aJoins) {

			var iLeft = this._searchArray("LTabname", "LFieldname", oDeletedJoin.LTabname, oDeletedJoin.LFieldname, aJoins);
			if (iLeft < 0) {
				iLeft = this._searchArray("RTabname", "RFieldname", oDeletedJoin.LTabname, oDeletedJoin.LFieldname, aJoins);
			}

			var iRight = this._searchArray("LTabname", "LFieldname", oDeletedJoin.RTabname, oDeletedJoin.RFieldname, aJoins);
			if (iRight < 0) {
				iRight = this._searchArray("RTabname", "RFieldname", oDeletedJoin.RTabname, oDeletedJoin.RFieldname, aJoins);
			}

			var aSplit = oDeletedJoin.JoinKey.split("-");
			var oView = this.getView();

			if (iLeft < 0) {
				var oLTableModel = oView.getModel("oModel" + aSplit[0]);
				var aLTabData = oLTableModel.getData();
				var iLIndex = this._searchArray("Tabname", "Fieldname", aSplit[0], aSplit[1], aLTabData);
				aLTabData[iLIndex].JoinExists = false;
				oLTableModel.refresh(true);
			}

			if (iRight < 0) {
				var oRTableModel = oView.getModel("oModel" + aSplit[2]);
				var aRTabData = oRTableModel.getData();
				var iRIndex = this._searchArray("Tabname", "Fieldname", aSplit[2], aSplit[3], aRTabData);
				aRTabData[iRIndex].JoinExists = false;
				oRTableModel.refresh(true);
			}

		},

		_showLinks: function(oEvent) {

			var aFilters = [];

			if (oEvent.getSource().getPressed()) {
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: "JoinExists",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: true
						})
					]
				});

				aFilters.push(oFilter);
			}

			// update list binding
			var oList = oEvent.getSource().getParent().getParent();

			if (!(oList instanceof sap.m.List)) {
				oList = oEvent.getSource().getParent().getParent().getParent();
			}

			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);

		},

		_DeselectAll: function(oEvent) {

			var oList = oEvent.getSource().getParent().getParent();

			oList.getItems().forEach(function(oItem) {
				oItem.setSelected(false);
			});

			//Delete the selected fields if any for this table
			this._delSelectedFields(oList.getParent().getCustomData()[1].getValue());
		},

		_onFieldSearch: function(oEvent) {

			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter({
							path: 'Fieldname',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),

						new sap.ui.model.Filter({
							path: 'Description',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),

						new sap.ui.model.Filter({
							path: 'Tabname',
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})
					],
					and: false
				});

				aFilters.push(oFilter);
			}

			// update list binding
			var oList = oEvent.getSource().getParent().getParent();
			if (!(oList instanceof sap.m.List)) {
				oList = oEvent.getSource().getParent().getParent().getParent();
			}
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
		},

		_onJoinClick: function(oEvent) {

			var oListItem = oEvent.getSource().getParent().getParent();
			var oPopover = oListItem.getDependents()[0];
			var oJoinList = oPopover.getContent()[0];

			//Filter out the Joins Table
			this._applyJoinFilter(oListItem, oJoinList);

			oPopover.openBy(oEvent.getSource());

		},

		onAutoJoin: function(oEvent) {

			var aTables = this.getView().getModel("oModelTables").getData();

			if (aTables.length === 0) {
				this._showMessage("Please add tables", false);
				return;
			}

			if (aTables.length < 2) {
				this._showMessage("Please add more table(s) for auto join", false);
				return;
			}

			var oSelectItem1 = new sap.ui.core.ListItem({
				key: "{oModelTables>Tabname}",
				text: "{oModelTables>Tabname}"
			});

			var oSelectItem2 = new sap.ui.core.ListItem({
				key: "{oModelTables>Tabname}",
				text: "{oModelTables>Tabname}"
			});

			var aSorter = [];

			aSorter.push(new sap.ui.model.Sorter({
				path: "Rank",
				descending: false
			}));

			var oSelect1 = new sap.m.Select("idTable1", {
				name: "Table 1",
				width: "190px",
				items: {
					path: "oModelTables>/",
					template: oSelectItem1,
					sorter: aSorter,
					templateShareable: false
				}
			}).addStyleClass("sapUiMediumMarginBegin sapUiSizeCompact");

			var oSelect2 = new sap.m.Select("idTable2", {
				name: "Table 1",
				width: "190px",
				selectedKey: aTables[1].Tabname,
				items: {
					path: "oModelTables>/",
					template: oSelectItem2,
					sorter: aSorter,
					templateShareable: false
				}
			}).addStyleClass("sapUiMediumMarginBegin sapUiSizeCompact");

			var dialog = new Dialog({
				title: 'Choose Tables',
				type: 'Message',
				draggable: true,
				content: [
					new sap.m.VBox({
						items: [new sap.m.HBox({
								items: [new sap.m.Label({
									text: "Table 1:"
								}).addStyleClass("zep_LinkHBox"), oSelect1]
							}),
							new sap.m.HBox({
								items: [new sap.m.Label({
									text: "Table 2:"
								}).addStyleClass("zep_LinkHBox"), oSelect2]
							})
						]
					}).addStyleClass("sapUiContentPadding")
				],
				beginButton: new Button({
					text: 'Submit',
					enabled: true,
					press: function() {
						var sTable1 = sap.ui.getCore().byId('idTable1').getSelectedKey();
						var sTable2 = sap.ui.getCore().byId('idTable2').getSelectedKey();

						if (sTable1 === sTable2) {
							this._showMessage("Please choose different tables", true);
							return;
						}

						var iRank1 = this._getIndexByKey("Tabname", sTable1, aTables);
						var iRank2 = this._getIndexByKey("Tabname", sTable2, aTables);

						if (iRank1 < iRank2) {
							var sLTable = sTable1;
							var sRTable = sTable2;
						} else {
							sLTable = sTable2;
							sRTable = sTable1;
						}

						//Hit Backend to get join condition
						this._proposeJoins(sLTable, sRTable);

						dialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function() {
						dialog.close();
					}.bind(this)
				}),
				afterClose: function() {
					dialog.destroy();
				}
			}).addStyleClass("sapUiSizeCompact");

			this.getView().addDependent(dialog);

			dialog.open();
		},

		_applyJoinFilter: function(oListItem, oJoinList) {

			var oListItemData = this._getContextData(oListItem);

			var oFilter1 = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter({
						path: "LTabname",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oListItemData.Tabname
					}),

					new sap.ui.model.Filter({
						path: "LFieldname",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oListItemData.Fieldname
					})
				],
				and: true
			});

			var oFilter2 = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter({
						path: "RTabname",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oListItemData.Tabname
					}),

					new sap.ui.model.Filter({
						path: "RFieldname",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: oListItemData.Fieldname
					})
				],
				and: true
			});

			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});

			//Apply Filters
			oJoinList.getBinding("items").filter(oFilter);

		},

		_showMessage: function(sMsg, bBottom) {

			if (!bBottom) {
				var sPosition = "center center";
			} else {
				sPosition = "center bottom";
			}

			sap.m.MessageToast.show(sMsg, {
				duration: 1300000,
				my: sPosition,
				at: sPosition
			});
		},

		generateCode: function(bSkipCheck) {

			var oView = this.getView();

			var aTabBoxes = oView.byId("idListTabBoxes").getItems(); //CustomListItems

			var iTables = aTabBoxes.length;

			if (!bSkipCheck) {
				if (!oView.byId("idLiveCodeBtn").getState() || iTables === 0) {
					return;
				}
			}

			//Get Tables and their selected fields if any
			var mData = this._getData();

			//Query Generator
			var sCode = this._queryGenerator(mData);

			oView.byId("idOutputCode").setValue(sCode);

			// oView.byId("idOutputCode").rerender();   //Working... this will trigger the animation, put class in XML view

		},

		_getData: function() {

			var oOutput = {};
			// var mOutFields = new Map();
			var aOutFields = [];
			var aOutTables = [];
			var aOutJoins = [];

			var oView = this.getView();

			var aTabBoxes = oView.byId("idListTabBoxes").getItems(); //CustomListItems

			var iTables = aTabBoxes.length;

			if (iTables > 1) {
				//Joins Data
				var aJoins = this.getView().getModel("oModelJoins").getData();

				//Clone the Array
				aOutJoins = aJoins.slice(0); //NOT a Deep Clone, the Objects inside the first array will also be modified

				//Sort Left Table and then by its field positions
				aOutJoins.sort(
					this.firstBy(function(v1, v2) {
						return v1.LTabRank - v2.LTabRank;
					})
					.thenBy(function(v1, v2) {
						return v1.LFieldPos > v2.LFieldPos;
					})
				);
			}

			//Looping all the added tables
			for (var i = 0; i < aTabBoxes.length; i++) {
				var oContent = aTabBoxes[i].getContent()[0]; //Panel Inside CustomListItem

				if (oContent instanceof sap.m.Panel) {
					var sTabname = oContent.getCustomData()[1].getValue();

					var sAlias = oContent.getCustomData()[2].getValue();

					//Array having tables and their alias
					var oTab = {
						"Tabname": sTabname,
						"Alias": sAlias
					};

					aOutTables.push(oTab);

					//Get Selected Items of List inside the Panel
					// var aSelectedItems = oContent.getContent()[0].getSelectedItems();

					// var aFields = [];

					// //Fields Map Object
					// for (var j in aSelectedItems) {
					// 	var sFieldname = aSelectedItems[j].getCustomData()[1].getValue();

					// 	if (iTables > 1) {
					// 		if (sAlias !== "") {
					// 			sFieldname = "\t" + sAlias + "~" + sFieldname;
					// 		} else {
					// 			sFieldname = "\t" + sTabname + "~" + sFieldname;
					// 		}
					// 	} else {
					// 		sFieldname = "\t" + sFieldname;
					// 	}

					// 	aFields.push(sFieldname.toLowerCase());
					// }

					// var oObject = {
					// 	"Alias": sAlias,
					// 	"Fields": aFields
					// };

					// mOutFields.set(sTabname, oObject);
				}
			}

			//Get Selected Fields
			var aSelectedFields = oView.getModel("oModelSelFields").getData();

			for (i = 0; i < aSelectedFields.length; i++) {
				if (aSelectedFields[i].FieldAlias === "") {
					var sFieldname = aSelectedFields[i].Fieldname.toLowerCase();
				} else {
					sFieldname = aSelectedFields[i].Fieldname.toLowerCase() + " AS " + aSelectedFields[i].FieldAlias.toLowerCase();
				}

				if (iTables > 1) {
					var sTableAlias = this._searchArraybyKey("Tabname", aSelectedFields[i].Tabname, aOutTables).Alias;

					if (sTableAlias !== "") {
						sFieldname = "\t" + sTableAlias.toLowerCase() + "~" + sFieldname;
					} else {
						sFieldname = "\t" + aSelectedFields[i].Tabname.toLowerCase() + "~" + sFieldname;
					}
				} else {
					sFieldname = "\t" + sFieldname;
				}

				aOutFields.push(sFieldname);
			}

			//Return Object
			oOutput.Tables = aOutTables;
			// oOutput.Fields = mOutFields;
			oOutput.Fields = aOutFields;
			oOutput.Joins = aOutJoins;

			return oOutput;

		},

		_searchArraybyKey: function(sKey, sValue, aData) {
			for (var i = 0; i < aData.length; i++) {
				if (aData[i][sKey] === sValue) {
					return aData[i];
				}
			}
		},

		_getIndexByKey: function(sKey, sValue, aData) {
			for (var i = 0; i < aData.length; i++) {
				if (aData[i][sKey] === sValue) {
					return i;
				}
			}
		},

		_getJoinTypeByControl: function(oDragControl, oDropControl, oLinkControl) {

			var oView = this.getView();

			var oListTabBox = oView.byId("idListTabBoxes");

			var aTabBoxes = oListTabBox.getItems();

			var oLinkCntrl;

			if (oLinkControl) {
				oLinkCntrl = oLinkControl;
			}

			if (oDragControl && oDropControl) {
				//Get the Link Control reference
				var iIndex1 = oListTabBox.indexOfItem(oDragControl.getParent().getParent().getParent());
				var iIndex2 = oListTabBox.indexOfItem(oDropControl.getParent().getParent().getParent());
				var iIndex = (iIndex1 < iIndex2 ? iIndex1 + 1 : iIndex2 + 1);
				oLinkCntrl = aTabBoxes[iIndex].getContent()[0].getItems()[0];
			}

			if (oLinkCntrl) {
				if (oLinkCntrl.getState()) {
					var iJoinType = parseInt(0, 10); //Inner Join
				} else {
					iJoinType = parseInt(1, 10); //Outer Join
				}
			}

			return iJoinType;
		},

		_updateJoinType: function(oLinkControl) {

			var oModelJoins = this.getView().getModel("oModelJoins");
			var aJoins = oModelJoins.getData();
			if (aJoins.length === 0) {
				return;
			}

			var oTabnames = this._getLRTabnames(oLinkControl);

			//Get Join Type
			var iJoinType = this._getJoinTypeByControl(null, null, oLinkControl);

			//Updating the Join Type
			for (var i in aJoins) {
				if ((aJoins[i].LTabname === oTabnames.LTabname) && (aJoins[i].RTabname === oTabnames.RTabname)) {
					aJoins[i].JoinType = iJoinType;
				}
			}

			oModelJoins.refresh(true);
		},

		_getLRTabnames: function(oLinkControl) {

			var oListTabBox = this.getView().byId("idListTabBoxes");
			var aTabBoxes = oListTabBox.getItems();
			var iLinkIndex = oListTabBox.indexOfItem(oLinkControl.getParent().getParent());

			var sLTabname = aTabBoxes[iLinkIndex - 1].getContent()[0].getCustomData()[1].getValue();
			var sRTabname = aTabBoxes[iLinkIndex + 1].getContent()[0].getCustomData()[1].getValue();

			var oTabnames = {
				"LTabname": sLTabname,
				"RTabname": sRTabname
			};

			return oTabnames;
		},

		_queryGenerator: function(mData) {

			var aQuery = [" SELECT"];

			var aFields = [];
			var aJoins = [];

			var sFields = "";

			// mData.Fields.forEach(function loop(value, key, map) {
			// 	if (sFields !== "" && value.Fields.length !== 0) {
			// 		sFields = sFields.concat(",\n");
			// 	}
			// 	if (value.Fields.length !== 0) {
			// 		sFields = sFields + value.Fields.join(",\n");
			// 	}
			// });

			if (mData.Fields.length !== 0) {
				sFields = mData.Fields.join(",\n");
			}

			aFields.push(sFields);

			if (sFields === "") {
				aQuery.push("\t*");
			} else {
				Array.prototype.push.apply(aQuery, aFields);
			}

			//First Table only
			if (mData.Tables[0].Alias === "" || mData.Tables.length === 1) {
				aJoins.push(" FROM " + mData.Tables[0].Tabname.toLowerCase());
			} else {
				aJoins.push(" FROM " + mData.Tables[0].Tabname.toLowerCase() + " AS " + mData.Tables[0].Alias.toLowerCase());
			}

			for (var i = 1; i < mData.Tables.length; i++) {
				var sTabname = mData.Tables[i].Tabname;
				var sAlias = mData.Tables[i].Alias.toLowerCase();

				var sJoinType = this._getJoinType(i, mData.Tables);

				if (sJoinType === "") {
					continue;
				}

				if (sAlias === "") {
					aJoins.push(sJoinType + sTabname.toLowerCase());
				} else {
					aJoins.push(sJoinType + sTabname.toLowerCase() + " AS " + sAlias);
				}

				var bFlag = false;

				var sCondition = "";

				//Put ON Conditions
				for (var j in mData.Joins) {
					if (mData.Joins[j].RTabname === sTabname) {
						//If more condition, putting AND in the end
						// if (bFlag) {
						// 	sCondition = sCondition + " AND\n";
						// }

						var sLAlias = this._searchArraybyKey("Tabname", mData.Joins[j].LTabname, mData.Tables).Alias.toLowerCase();
						var sRAlias = this._searchArraybyKey("Tabname", mData.Joins[j].RTabname, mData.Tables).Alias.toLowerCase();

						var sLTab = (sLAlias === "" ? mData.Joins[j].LTabname : sLAlias).toLowerCase();
						var sRTab = (sRAlias === "" ? mData.Joins[j].RTabname : sRAlias).toLowerCase();

						//For multiple fields in the ON Condition
						if (bFlag) {
							sCondition = sCondition + " AND\n\t\t" + sLTab + "~" + mData.Joins[j].LFieldname.toLowerCase() + " = " + sRTab + "~" + mData.Joins[
									j]
								.RFieldname.toLowerCase();
						} else {
							sCondition = sCondition + "\t ON " + sLTab + "~" + mData.Joins[j].LFieldname.toLowerCase() + " = " + sRTab + "~" + mData.Joins[
									j]
								.RFieldname.toLowerCase();
						}

						bFlag = true;
					}
				}

				if (sCondition !== "") {
					aJoins.push(sCondition);
				}
			}

			Array.prototype.push.apply(aQuery, aJoins);

			aQuery.push("  INTO TABLE @DATA(lt_data1).");

			return aQuery.join("\n");
		},

		_getJoinType: function(iIndex, aTables) {

			var oView = this.getView();
			var oTabList = oView.byId("idListTabBoxes");
			var oTableItem = oView.byId(aTables[iIndex].Tabname).getParent(); //Get Panel by Table Name ID and its parent is Custom list item

			var iTableItem = oTabList.indexOfItem(oTableItem); //Index of the Table Item in loop

			var aItems = oTabList.getItems();

			var bState = aItems[iTableItem - 1].getContent()[0].getItems()[0].getState();

			if (bState) {
				var iType = 1;
			} else {
				iType = 2;
			}

			var sJoinType = "";

			//Join Type
			switch (iType) {
				case 1:
					sJoinType = "  INNER JOIN ";
					break;
				case 2:
					sJoinType = "  LEFT OUTER JOIN ";
					break;
				default:
					sJoinType = "";
			}

			return sJoinType;
		},

		onFullCode: function(oEvent) {

			//Refresh the code again
			this.generateCode(true);

			var oOutputCode = this.getView().byId("idOutputCode");

			var sCode = oOutputCode.getValue();

			var sQuery = "SELECT_1";

			var aLines = sCode.split("\n");

			var sCodeString = "";

			for (var i = 0; i < aLines.length; i++) {
				if (aLines[i].length !== 0) {
					aLines[i] = aLines[i].trim();
					sCodeString = sCodeString + aLines[i] + "$NEWLINE$";
				}
			}

			var afilters = [];
			afilters.push(new sap.ui.model.Filter("QueryId", sap.ui.model.FilterOperator.EQ, sQuery));
			afilters.push(new sap.ui.model.Filter("CodeString", sap.ui.model.FilterOperator.EQ, sCodeString));

			this.getView().getModel().read("/CodeSet", {
				filters: afilters,
				success: function(oData) {
					var sDataTypes = "*- Data Types\n" + oData.results[0].DataDeclaration;

					var sOutput = sDataTypes + "\n\n" + "*- Select Query\n" + sCode;
					this._openOutputDialog(sOutput);
				}.bind(this),

				error: function(error) {
					sap.m.MessageToast.show("Data fetching failed");
				}.bind(this)
			});
		},

		_openOutputDialog: function(sCode) {

			var oDialog = new Dialog({
				title: "Generated Code",
				contentWidth: "550px",
				contentHeight: "500px",
				resizable: true,
				draggable: true,
				content: new sap.ui.codeeditor.CodeEditor({
					height: "500px",
					width: "550px",
					lineNumbers: false,
					type: "abap",
					editable: false,
					valueSelection: false,
					value: sCode
				}),
				beginButton: new Button({
					text: "Close",
					press: function() {
						oDialog.close();
					}
				})
			});

			oDialog.open();
		}

	});

});