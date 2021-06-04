import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectorRef, Renderer2, Input, ElementRef, ChangeDetectionStrategy, ViewChild, Inject, SimpleChanges } from '@angular/core';
import { ServoyBootstrapBasefield } from '../../bootstrapcomponents/bts_basefield';
import * as _ from 'lodash';

@Component({
    selector: 'globiscomponents-Form-Builder',
    templateUrl: './FormBuilder.html',
    styleUrls: ['./FormBuilder.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisFormBuilder extends ServoyBootstrapBasefield<HTMLDivElement> {
    @Input() result;

    // viewChildren for drag and drop
    @ViewChild('sortableRemovedFieldsList') sortableSBFieldsList;
    @ViewChild('sortableNewFieldsList') sortableNewFieldsList;
    @ViewChild('sortableFieldsList') sortableFieldsList;
    @ViewChild('drawer') drawer;
    fieldsConnectedTo = [];    

    // handlers
    @Input() getIsDeveloper: () => Promise<boolean>;
    @Input() getTabFormFields: (startFromFormName: string) => Promise<boolean>;
    @Input() tabProperties: (isNew: boolean, tab: any) => Promise<boolean>;
    @Input() programProperties: (program: string) => Promise<boolean>;
    @Input() valuelistProperties: (valuelist: string) => Promise<boolean>;
    @Input() i18nProperties: (i18n: string) => Promise<boolean>;
    @Input() dashboardProperties: (dashboard: string) => Promise<boolean>;
    @Input() gridFoundsetProperties: (foundset: string) => Promise<boolean>;
    @Input() eventProperties: (event: string, value: string) => Promise<boolean>;
    @Input() dataproviderProperties: (component: any, value: string, isNewColumn: boolean) => Promise<boolean>;
    @Input() loadTabForm: (tab: any) => Promise<boolean>;
    @Input() getProgramFormFields: (name: string, startFromId: string, startFromName: string) => Promise<any>;
    @Input() getStandaloneFormFields: () => Promise<any>;
    @Input() onSaveForm: (event: any, model: any) => Promise<any>;
    @Input() formStateChanged: (value: boolean) => Promise<boolean>;
    @Input() showOriginalFormFieldsModal: (name: string, startFromId: string, startFromName: string) => Promise<any>;

    // locals
    _dummySmallColumn = { fields: [], fieldType: 'smallcolumn', styleclass: 'col-sm-12'};
    _dummyFormgroup = { smallcolumns: [this._dummySmallColumn], fieldType: 'form-group', styleclass: 'form-group'};
    nrOfColumns = [{ label: 'One column', amount: 1, colspan: 12, styleclass: 'col-md-12' }, { label: 'Three columns', amount: 3, colspan: 4, styleclass: 'col-md-4' }, { label: 'Four columns', amount: 4, colspan: 3, styleclass: 'col-md-3' }, { label: 'Six columns', amount: 6, colspan: 2, styleclass: 'col-md-2' }, { label: 'Twelve columns', amount: 12, colspan: 1, styleclass: 'col-md-1' }];
    colspanOptions = [{ label: 'One', colspan: 1, styleclass: 'col-md-1' }, { label: 'Two', colspan: 2, styleclass: 'col-md-2' }, { label: 'Three', colspan: 3, styleclass: 'col-md-3' }, { label: 'Four', colspan: 4, styleclass: 'col-md-4' }, { label: 'Five', colspan: 5, styleclass: 'col-md-5' }, { label: 'Six', colspan: 6, styleclass: 'col-md-6' }, { label: 'Seven', colspan: 7, styleclass: 'col-md-7' }, { label: 'Eight', colspan: 8, styleclass: 'col-md-8' }, { label: 'Nine', colspan: 9, styleclass: 'col-md-9' }, { label: 'Ten', colspan: 10, styleclass: 'col-md-10' }, { label: 'Eleven', colspan: 11, styleclass: 'col-md-11' }, { label: 'Twelve', colspan: 12, styleclass: 'col-md-12' }];

    svyMarkupId;
    rows = [];
    startFromName;
    copiedJSONRows;
    startFromId;
    enabledImage;
    formState = null;
    addGridColumnState;
    rowStyle = "row";
    limitFields = 8;
    maxTabsequence;
    pageNumber = 0;
    searchValue = "";
    searchTabFieldsValue = "";
    listDesignMode = false;
    isNewFieldsListCollapsed = true;
    isRowsListCollapsed = false;
    isTabsListCollapsed = true;
    showTabFieldsIndex = -1;
    tabSequenceMode = false;
    currentDataproviderProperty;
    allFields;
    tabsWithFields;
    filteredTabFields;
    component;
    row;
    rowcolumn;
    formgroup;
    smallcolumn;
    column;
    tab;
    filteredFields = [];
    newFields;
    isDeveloper = false;
    currentProperty;
    currentEvent;
    editGridColumnState;
    gridColumnProperties;
    datasource;
    formname;
    custom_view_id;
    parent_view_id;
    isNewForm;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, @Inject(DOCUMENT) doc: Document) {
        super(renderer, cdRef, doc);
    }

    svyOnInit(){
        super.svyOnInit();
        console.log('formbuilder init');
        /*this.result = JSON.parse(this.result);
        if (this.result.rows) {
            this.rows = this.result.rows;
            this.name = this.result.name;
            this.allFields = this.result.fields;
            //checkIfAllRowsHaveAllColumns();
            //$scope.copiedJSONRows = angular.copy(dbForm.rows);
            this.startFromName = this.result.startFromName ? this.result.startFromName : 'ng$logistic_contract_dtl';
            this.startFromId = this.result.startFromId;
            this.setFieldsConnectedTo();
        }
        
        this.initFilteredFields(null);*/
        
        this.getStandaloneFormFields().then((fields) => {
                this.newFields = fields;
                this.isNewFieldsListCollapsed = false;
            });
        this.handlerGetIsDeveloper();
    }
    
    setFieldsConnectedTo(){
        let _newList = [];
        let _classString = 'fields';
        for (let rI = 0; rI < this.rows.length; rI++) {
            for (let cI = 0; cI < this.rows[rI].columns.length; cI++) {
                const col = this.rows[rI].columns[cI];
                for (let fgI = 0; fgI < col.formgroups.length; fgI++) {
                    const fg = col.formgroups[fgI];
                    for (let scI = 0; scI < fg.smallcolumns.length; scI++) {
                        _newList.push(_classString + '-' + rI + '-' + cI + '-' + fgI + '-' + scI);
                    }
                }
            }
        }
        this.fieldsConnectedTo = _newList;
    }

    drop(event: CdkDragDrop<any>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
      }
    
    trackByIndex(index: number): number{
        return index;
    }



    addRow(nrOfColumns, index?) {
        var emptyColumns = [];
        var columnSpan = _.find(this.colspanOptions, { colspan: nrOfColumns.colspan });
        for (var i = 0; i < nrOfColumns.amount; i++) {
            emptyColumns.push({ formgroups: [this._dummyFormgroup], styleclass: columnSpan.styleclass, fieldType: 'column' });
        }

        var dummyRow = { styleclass: this.rowStyle, columns: emptyColumns, fieldType: 'row' };

        if (index != undefined) {
            this.rows.splice(index, 0, dummyRow);
        } else this.rows.push(dummyRow);
    }

    handlerGetIsDeveloper() {
        if (this.getIsDeveloper) {
            const promise = this.getIsDeveloper();
            promise.then((result) => {
                this.isDeveloper = result;
            });
        } else {
            this.isDeveloper =  false;
        }
    }    

    initFilteredFields(filter?) {
        var fields = this.allFields;

        if (filter == null && this.searchValue.length > 0)
            filter = this.searchValue;

        if (filter != null) {
            fields = filter(fields, function(field) {
                    return (field.name !== undefined && field.name !== null && field.name.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (field.dataprovider !== undefined && field.dataprovider !== null && typeof (field.dataprovider) !== "object" && field.dataprovider.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (field.text !== null && field.text !== undefined && field.text.toLowerCase().indexOf(filter.toLowerCase()) > -1);
                })
        }

        this.filteredFields  = fields;

        // Create filteredFields list to have an ng-model that can be used by ui-sortable limitTo:limitFields:pageNumber
        // If we have to use ngFiltering on a ui-sortable list, it stops working
        this.filteredFields = _.slice(fields, this.pageNumber * this.limitFields, this.pageNumber * this.limitFields + this.limitFields);
    }
    
    initFilteredTabFields(filter?) {
        var fields = this.tabsWithFields[this.showTabFieldsIndex].fields;

        if (filter == null && this.searchTabFieldsValue.length > 0)
            filter = this.searchTabFieldsValue;

        if (filter != null) {
            fields = _.filter(fields, function(field) {
                return (field.name !== undefined && field.name !== null && field.name.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (field.dataprovider !== undefined && field.dataprovider !== null && typeof (field.dataprovider) !== "object" && field.dataprovider.toLowerCase().indexOf(filter.toLowerCase()) > -1) || (field.text !== null && field.text !== undefined && field.text.toLowerCase().indexOf(filter.toLowerCase()) > -1);
            })
        }

        this.filteredTabFields  = fields;
    }

    removeFieldFromList(field) {
        //this.allFields = _.without(this.allFields, field);
    }			

    deleteField(fields, field, index) {
        /*if(field.dashboard){
            this.removeCumulioDashboard(field.uniqueID);
        }*/
        // add the deleted field back to the sidebar
        this.allFields.unshift(field);
        fields.splice(index, 1);
        this.initFilteredFields(null);
    }

    sortableSidebar = {
        connectWith: ".sortableFields",
        placeholder: "formbuilder_highlight",
        scroll: false
    };

    sortableNewFields = {
        connectWith: ".sortableFields",
        scroll: false,
        placeholder: "formbuilder_highlight",
        update: function(e, ui) {
            ui.item.sortable.cancel();
        },
        stop: function(e, ui) {
            ui.item.sortable.cancel();
        }
    };
    
    showTabs(){
        this.isTabsListCollapsed = !this.isTabsListCollapsed;
        if(!this.isTabsListCollapsed && this.startFromName)
        {
            const promise = this.getTabFormFields(this.startFromName);
            promise.then((_tabsWithFields) => {
                this.tabsWithFields = _tabsWithFields;
                if(_tabsWithFields){
                    this.initFilteredTabFields(null);
                }
            });
        }
    }
    
    sortableTabFields = {
        connectWith: ".sortableFields",
        scroll: false,
        placeholder: "formbuilder_highlight",
        update: function(e, ui) {
            ui.item.sortable.cancel();
        }
    };

    sortableFields = {
        connectWith: ".sortableFields",
        scroll: false,
        placeholder: "formbuilder_highlight",
        handle: ".sortableHandle",
        receive: function(e, ui) {
            if (ui.item.sortable.sourceList[0].className.indexOf('newFieldsDnd') > -1) {
                var copyField = _.cloneDeep(ui.item.sortable.model);
                this.setAddComponentFieldValues(copyField);
                copyField.foundset = this.datasource;
                copyField.isNewField = true;
                copyField.uniqueID = _.cloneDeep(this.getUniqueID());							
                this.openSidebar(copyField);
                var _dataproviderProperty = _.find(copyField.properties, {name: 'dataprovider'});
                if(_dataproviderProperty && copyField.fieldType !== 'iframe')
                    this.showDataproviderProperties(copyField,_dataproviderProperty, copyField.properties, false);
                if(this.component.dashboard){
                    /*Cumulio.addDashboard({
                        dashboardId: this.component.dashboard.dashboard_id,
                        container: '#cumulio-' + this.component.uniqueID
                        });*/
                }
                ui.item.sortable.droptargetModel.splice(ui.item.sortable.dropindex, 0, copyField);
            } else
                this.removeFieldFromList(ui.item.sortable.model);
            this.initFilteredFields(null);
        }
    }

    getUniqueID() {
        return 'webcomponent_' + Math.random().toString(36).substr(2, 9);
    }

    sortableColumns = {
        handle: ".sortableCHandle",
        placeholder: "formbuilder_highlight"
    }
    
    sortableSmallColumns = {
        placeholder: "formbuilder_highlight",
        handle: ".sortableSCHandle",
        connectWith: ".sortableSmallColumns"
    }
    
    sortableFormGroups = {
        placeholder: "formbuilder_highlight",
        handle: ".sortableFGHandle",
        connectWith: ".sortableFormGroups"
    }

    asideState = {
        open: false
    };

    closeSidebar(event){
        if(this.drawer['_animationState'] === "open" && (!event.target.className || event.target.className.indexOf('fa-cog') === -1)){
            this.drawer.toggle();
        }
    }

    openSidebar(component, row?, rowcolumn?, formgroup?, smallcolumn?) {
        this.row = row;
        this.rowcolumn = rowcolumn;
        this.formgroup = formgroup;
        this.smallcolumn = smallcolumn;
        this.component = component;
        if(!this.component.uniqueID)
            this.component.uniqueID = this.getUniqueID();
        this.column = null;
        
        if(this.component.fieldType === 'grid'){
            // column scope var isn't set correcty on load custom view and properties are opened in sidebar
            this.column = _.find(component.columns, {showColumnProperties: true})
        }
        
        this.drawer.toggle();
        //this.openAside('right')
    }				

    sortableRowsSidebar = {
        placeholder: "formbuilder_highlight",
        connectWith: ".sortableRows",
        update: function(e, ui) {
            ui.item.sortable.cancel();
        }
    }

    sortableRows = {
        placeholder: "formbuilder_highlight",
        handle: ".sortableRowHandle",
        receive: function(e, ui) {
            this.addRow(_.cloneDeep(ui.item.sortable.model), ui.item.sortable.dropindex);
        }
    }

    getHandlerTabProperties(isNew, tab){
        this.tabProperties(isNew, tab);
    }

    getHandlerProgramProperties(program){
        this.programProperties(program);
    }

    deleteContainer(container){
        if(!container)
            return null;
        
        this.moveAllFieldsToSidebar(container);

        switch(container.fieldType)
        {
            case "row":
                _.remove(this.rows, this.row);
                break;
            case "column":
                _.remove(this.row.columns, this.rowcolumn);
                this.row.hasDeletedColumns = true;
                break;
            case "form-group":
                _.remove(this.rowcolumn.formgroups, this.formgroup);
                break;
            case "smallcolumn":
                _.remove(this.formgroup.smallcolumns, this.smallcolumn);
                break;						
        }
        this.drawer.toggle();
    }

    moveAllFieldsToSidebar(container)
    {
        var _fields = [];

        switch(container.fieldType)
        {
            case "row":
                _fields = _fields.concat(this.getFieldsInRow(this.row));
                break;
            case "column":
                _fields = _fields.concat(this.getFieldsInRowColumn(this.rowcolumn));
                break;
            case "form-group":
                _fields = _fields.concat(this.getFieldsInFormGroup(this.formgroup));	
                break;
            case "smallcolumn":
                _fields = _fields.concat(this.smallcolumn.fields);
                break;						
        }
        this.allFields = this.allFields.concat(_fields);
        this.initFilteredFields(null);
    }

    getFieldsInRow(row)
    {
        var _fields = [];

        row.columns.forEach(col => {
            _fields = _fields.concat(this.getFieldsInRowColumn(col));	
        });

        return _fields;
    }

    getFieldsInRowColumn(rowcolumn)
    {
        var _fields = [];

        rowcolumn.formgroups.forEach(col => {
            _fields = _fields.concat(this.getFieldsInFormGroup(col));
        });

        return _fields;
    }

    getFieldsInFormGroup(formgroup)
    {
        var _fields = [];
        formgroup.smallcolumns.forEach(col => {
            _fields = _fields.concat(col.fields);	
        });
        return _fields;
    }
    
    openIncludedTabForm(tab) {
        this.getHandlerLoadTabForm(tab);
    }

    updateFieldName(field) {
        field.value = field.value.split(' ').join('_');
        this.component.name = field.value;
    }

    updateTextProperties(property) {
        if (property.name === 'label_styleClass') {
            this.initLabelDetails();
            this.component.labelDetails[0].styleClass = property.value;
        } else if (property.name === 'label_text') {
            this.initLabelDetails();
            this.component.labelDetails[0].labelText = property.value;
        } else if (property.name === 'path') {
            //this.component.path = $sce.trustAsResourceUrl(property.value);
        } else if (property.name === 'headerText') {
            this.column.headerText = property.value;
            this.column.caption = property.value;
        }
        else this.component[property.name] = property.value
    }
    
    updateCSSProperties(property){
        if(this.component.fieldType !== 'grid'){
            if(property.name === 'css'){
                this.component.css = property.value;
            }
            else if(property.name === 'label_css'){
                this.component.label_css = property.value;	
            }
        }
    }

    updateDropdownProperties(property) {
        if (property.name === 'label_orientation') {
            this.initLabelDetails();
            this.component.labelDetails[0].labelOrientation = property.value;
        }
    }
    
    getConvertedWidthRatio(_keyString){
        switch(_keyString){
            case "10/90":
                return 1;
            case "20/80":
                return 2;
            case "30/70": 
                return 3;
            case "40/60":
                return 4;
            case "50/50":
                return 5;
            case "60/40":
                return 6;
            case "70/30":
                return 7;
            case "80/20":
                return 8;
            case "90/10":
                return 9;
            default: 
                return 5;
        }
    }

    updateCheckboxProperties(property) {
        if (property.name === 'buttons_add') {
            this.component.buttons_add = property.value;
        } else if (property.name === 'buttons_search') {
            this.component.buttons_search = property.value;
        }
    }

    updateDataprovider(property) {
        this.component.dataprovider = property.value;
    }

    initLabelDetails() {
        if (!this.component.labelDetails)
            this.component.labelDetails = [];

        if (this.component.labelDetails && this.component.labelDetails.length == 0) {
            this.component.labelDetails.push({ labelText: "", styleClass: "", labelOrientation: "left-label" });
            // set the label orientation to left-label as default
            for (var i = 0; i < this.component.properties.length; i++) {
                if (this.component.properties[i].name === "label_orientation")
                    this.component.properties[i].value = "left-label";
            }
        }
    }

    showValueListProperties(name) {
        this.valuelistProperties(name);
    }

    showEventProperties(event) {
        this.currentEvent = event;
        this.eventProperties(event.name, event.value);
    }

    showi18nProperties(property) {
        this.currentProperty = property;
        this.i18nProperties(property.value);
    }

    i18nInputChanged(property) {
        this.updateTextProperties(property);
        
        var _translation_prop = _.find(this.component.properties, {name: "translated_i18n"});
        if(_translation_prop && _translation_prop.value)
        {
            _translation_prop.value = null;
        }
    }

    showFoundsetProperties(property) {
        this.gridFoundsetProperties(property.value);
    }

    showDashboardProperties(property){
        this.dashboardProperties(property);
    }

    showGridColumnDataprovider(component, _dataproviderProperty, properties, isNewColumn){
        this.column = component;
        this.column.fieldType = 'gridcolumn';
        this.gridColumnProperties = component;
        this.editGridColumnState = true;
        this.showDataproviderProperties(component, _dataproviderProperty, properties, isNewColumn);
    }
    
    showDataproviderProperties(component, _dataproviderProperty, properties, isNewColumn?) {
        if(!component.isNewField && _dataproviderProperty['disabled'] && !this.listDesignMode && component.fieldType && component.fieldType !== 'gridcolumn' && !this.isDeveloper)
            return;
        // needed to provide this as a scope variable since the selector component has three dataprovider values, we need to know which value to set on api.dataProviderProperties	
        this.currentDataproviderProperty = _dataproviderProperty;
        this.dataproviderProperties(component, _dataproviderProperty["value"], isNewColumn);
    }

    addGridColumn() {
        this.showDataproviderProperties(this.component, _.find(this.component.columnProperties, {name: 'dataprovider'}), this.component.columnProperties, true);
    }
    
    showGridColumnProperties(column) {
        this.column = column;
        this.column.fieldType = 'gridcolumn';
        /*this.gridColumnProperties = column;
        this.editGridColumnState = true;*/
        this.showDataproviderProperties(column, _.find(column.properties, {name: 'dataprovider'}), column.properties, false);
    }

    toggleColumnProperties(column, columns, index) {
        this.column = column;
        if (column.showColumnProperties === undefined) {
            column.showColumnProperties = true;
            // add the styleclass for the opened column, so we can add margin for all fields
            column.gridColumnStyleclass = 'gridcolumnproperties';
        } else {
            column.showColumnProperties = !column.showColumnProperties;
            column.gridColumnStyleclass = column.showColumnProperties ? 'gridcolumnproperties' : '';
        }

        for (var i = 0; i < columns.length; i++) {
            if (i == index)
                continue;
            columns[i].showColumnProperties = false;
            columns[i].gridColumnStyleclass = '';
        }
    }

    toggleTabProperties(tab, tabs, index) {
        this.tab = tab;
        if (tab.showTabProperties === undefined) {
            tab.showTabProperties = true;
            // add the styleclass for the opened column, so we can add margin for all fields
            tab.tabStyleclass = 'gridcolumnproperties';
        } else {
            tab.showTabProperties = !tab.showTabProperties;
            tab.tabStyleclass = tab.showTabProperties ? 'gridcolumnproperties' : '';
        }

        for (var i = 0; i < tabs.length; i++) {
            if (i == index)
                continue;
            tabs[i].showTabProperties = false;
            tabs[i].tabStyleclass = '';
        }
    }
    
    removeGridColumn(column, columns, index) {
        columns.splice(index, 1);

        //var grid = $("#" + this.component.uniqueID).dxDataGrid("instance");
        var grid;
        grid.deleteColumn(index);
        grid._options["columns"] = columns;
        this.component.gridOptions.columns = columns;
    }
    
    removeTab(tab, tabs, index) {
        tabs.splice(index, 1);
    }
    
    moveListItem(direction, items, index){
        if(direction === 'down'){
            [items[index], items[index+1]] = [items[index+1], items[index]];	
        }
        else{
            [items[index], items[index-1]] = [items[index-1], items[index]];									
        }
        
        if(this.component.fieldType === 'grid'){
            var grid// = $("#" + this.component.uniqueID).dxDataGrid("instance");
            grid.option('columns', this.component.columns);
            this.component.gridOptions.columns = this.component.columns;
            grid.repaint();
        }
            
    }				

    getHandlerLoadTabForm(tab) {
        this.loadTabForm(tab.containedForm);
    }

    openTabProperties(row, tab) {
        tab.fieldType = 'tab';
        //this.openSidebar(tab, row);
    }

    addTab(field) {
        this.component = field;
        if(!this.component.tabs)
            this.component.tabs = [];
        this.tabProperties(true, null);
    }
    
    openTabPropertiesModal(isNew, tab){
        this.tab = tab;
        this.tabProperties(isNew, tab);
    }

    public setTabProperties(isNew, tab) {
        if(isNew === "true"){
            tab.include = true;
            tab.enabled = true;
            this.component.tabs.push(tab);
        }
            else{
                this.tab.containedForm = tab.containedForm;
                this.tab.customView = tab.customView;
                this.tab.customViewType = tab.customViewType;
                this.tab.customViewName = tab.customViewName;
                this.tab.relationName = tab.relationName;					 
                this.tab.name = tab.name;
            }
    }

    public setDataproviderProperties(result) {
        if (result) {
            if(!this.currentDataproviderProperty){
                this.currentDataproviderProperty = { name: "dataprovider" };
            }

            // save Dataprovider settings can be called by adding or editing a grid column
            if(this.addGridColumnState){
                this.addGridColumnState = false;
            }	
            else if(this.editGridColumnState){
                this.editGridColumnState = false;
                if(this.currentDataproviderProperty.name === 'dataprovider'){							
                    this.column.dataprovider = result.dataprovider;
                    this.column.dataprovider_type = result.dataprovider_type;
                    this.column.isDynamicAttribute = result.isDynamicAttribute;
                    this.column.dynamicAttributeText = result.dynamicAttributeText ? result.dynamicAttributeText : null;
                    this.column.relation = result.relation;
                    this.column.basetable = result.basetable;
                }
                this.setDataprovider(this.column.properties, result.dataprovider, null, this.currentDataproviderProperty);
            }
            else{
                this.component[this.currentDataproviderProperty["name"]] = result.dataprovider;
                var _updateName = null;
                if(this.component.name === this.component.fieldType){
                    this.component.name = result.dataprovider.indexOf(".") > -1 ? result.dataprovider.split(".").pop() : result.dataprovider; 
                    _updateName = this.component.name;
                }
                if(this.currentDataproviderProperty["name"] == 'dataprovider')
                {
                    this.component.dataprovider_type = result.dataprovider_type;
                    this.component.isDynamicAttribute = result.isDynamicAttribute;
                    this.component.dynamicAttributeText = result.dynamicAttributeText ? result.dynamicAttributeText : null;
                    if(this.component.dynamicAttributeText)
                        _updateName = this.component.dynamicAttributeText;
                    this.component.relation = result.relation;
                    this.component.basetable = result.basetable;
                }

                this.setDataprovider(this.component.properties, result.dataprovider, _updateName, this.currentDataproviderProperty);
            }						
        }
    }

    getGridConvertedFormField(rows, gridField){
        for (var i = 0; i < rows.length; i++) {
            for (var j = 0; j < rows[i].columns.length; j++) {
                var _column = rows[i].columns[j]; 
                for (var k = 0; k < _column.formgroups.length; k++) {
                    var _fgroup = _column.formgroups[k];
                    for (var l = 0; l < _fgroup.smallcolumns.length; l++) {
                        var _scol = _fgroup.smallcolumns[l];
                        for (var m = 0; m < _scol.fields.length; m++) {
                            var _field = _scol.fields[m];	
                            if(_field.uniqueID === gridField.uniqueID)
                                return _field;
                        
                        }
                    }
                }
            }
        }
    }

    setAddComponentFieldValues(result) {
        for (var i = 0; i < result.properties.length; i++) {
            if (result.properties[i].name === 'dataprovider' && result.dataprovider && result.dataprovider.value)
                result.properties[i].value = result.dataprovider.value;
            else if (result.properties[i].name === 'path') {
               // result.properties[i].value = $sce.trustAsResourceUrl(result.properties[i].default);
               // result.path = $sce.trustAsResourceUrl(result.properties[i].default);
            } else if (result.properties[i].name === 'name')
                result.properties[i].value = result.name;
            else if (result.properties[i].name === 'foundset' && result.fieldType === "grid")
                result.properties[i].value = this.datasource;
            else if (result.properties[i].default !== undefined) {
                result.properties[i].value = result.properties[i].default;
            }

        }
    }

    public setGridFoundsetProperties(relation) {
        for (var i = 0; i < this.component.properties.length; i++) {
            if (this.component.properties[i].name === 'foundset')
                this.component.properties[i].value = relation;
        }
    }

    public addFields(result) {
        if (result) {
            this.allFields = [];
            if (result.length > 0) {
                this.allFields = result;
            }

            this.initializeFormFields();
        }
    }

    copyRow(){
        if(this.component.fieldType === 'row'){
            var _rowCopy = _.cloneDeep(this.component);
            this.removeFields(_rowCopy);
            this.rows.push(_rowCopy);
        }
    }
    
    removeFields(_rowCopy){
        for (var i = 0; i < _rowCopy.columns.length; i++) {
            _rowCopy.columns[i].fields = _.cloneDeep([]);
        }
    }

    initializeFormFields() {
        this.formState = null;
        this.rows = [];
        this.addRow(_.find(this.nrOfColumns, { amount: 3 }));
        this.initFilteredFields(null);
    }

    public setFormName(result) {
        if (result) {
            this.name = result;
        }
    }

    public loadJSONModel(result) {
        if(this.tabSequenceMode){
            this.maxTabsequence = 0;
            // switch off tabSequenceMode or it will be loaded when the form gets activated again in design mode.
            this.toggleTabSequenceMode();
        }
        
        result = JSON.parse(result);
        if (result.form !== null) {
            this.listDesignMode = result.listDesignMode;
            if (result.datasource && result.datasource_mode) {
                this.name = result.name;
                this.formname = result.formname;
                this.initializeFormFields();
            }
            // a form can be created by Custom View wizard, then there are no rows or fields yet
            else if (result.name) {
                this.name = result.name;
                this.formname = result.formname;

                if (result.isNewForm || ((!this.allFields || this.allFields.length == 0) && result.custom_view_id)){
                    this.isNewForm = result.isNewForm;
                    if((!this.allFields || this.allFields.length == 0) && result.custom_view_id){
                        if(!result.parent_view_id){
                            result.parent_view_id = result.custom_view_id;
                            result.custom_view_id = null;
                        }
                        
                        result.startFromId = null;
                        result.startFromName = 'ng$' + this.name + '_dtl';
                    }
                    
                    // save these variables so we can also get the _lst form and we don't always start from the ng$program_lst/dtl
                    this.startFromId = result.startFromId;
                    this.startFromName = result.startFromName;
                    
                    this.getProgramFormFields(this.name, result.startFromId, result.startFromName).then(function(result) {									
                        this.formState = true;
                        if(result && result.convertedForm){
                            result.convertedForm = JSON.parse(result.convertedForm);
                            this.rows = result.convertedForm.rows;
                            this.checkIfAllRowsHaveAllColumns();
                            this.setFieldsConnectedTo();
                            if(result.convertedForm.gridFields){
                                //todo: if result.containsGrids
                                setTimeout(function(){
                                    for (var j = 0; j < result.convertedForm.gridFields.length; j++) {
                                        for (var i = 0; i < result.convertedForm.gridFields[j].columns.length; i++) {														
                                            // set all column properties for grid columns
                                            this.component = this.getGridConvertedFormField(this.rows, result.convertedForm.gridFields[j]) //result.convertedForm.gridFields[j];
                                            this.component.isNewField = true;
                                            this.component.columns[i].properties = _.cloneDeep(result.convertedForm.gridFields[j].columnProperties);
                                            this.component.columns[i].isNewField = true;
                                            this.saveGridColumn(true, this.component.columns[i], true);
                                        }												
                                    }
                                }, 500)	
                            }
                            
                            if(result.convertedForm){
                                this.allFields = result.convertedForm.fields ? result.convertedForm.fields : [];
                            }
                            else this.allFields = [];
                                
                            this.copiedJSONRows = _.cloneDeep(result.convertedForm.rows);
                            this.initFilteredFields(null);
                        }
                        else{
                            this.allFields = result ? result.fields : [];
                            this.initializeFormFields();		
                            this.formState = true;
                        }
                        
                        
                    });
                }
                else this.initializeFormFields() // cancel clicked
            } else {
                if (result.form) {
                    var dbForm = JSON.parse(result.form);
                    if (dbForm) {
                        this.formState = false;

                        if(!this.checkIfFormGroupStructure(dbForm.rows))
                        {
                            dbForm.rows = this.convertToFormGroupStructure(dbForm.rows);
                        }

                        this.rows = dbForm.rows;
                        this.checkIfAllRowsHaveAllColumns();
                        this.setFieldsConnectedTo();
                        this.copiedJSONRows = _.cloneDeep(dbForm.rows);
                        this.name = dbForm.name;
                        this.allFields = dbForm.fields;
                        this.startFromName = dbForm.startFromName;
                        this.startFromId = dbForm.startFromId;
                    }
                }

                this.initFilteredFields(null);
            }
            
            // set id's or reset them in case the old value needs to be removed
            if(result.custom_view_id)
                this.custom_view_id = result.custom_view_id;
            else this.custom_view_id = null;
            if(result.parent_view_id)
                this.parent_view_id = result.parent_view_id;
            else this.parent_view_id = null;
            if(result.datasource)
                this.datasource = result.datasource;
            else this.datasource = null;
        }
    }

    checkIfAllRowsHaveAllColumns(){
        for (var i = 0; i < this.rows.length; i++) {
            this.checkIfRowCanAddColumns(this.rows[i]);
        }				
    }

    checkIfFormGroupStructure(rows){
        if(rows.length > 0){
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if(_.find(row.columns, function(col){
                    // formbuilder v1 supported Rows -> Columns -> Fields structure instead of Rows -> Columns -> Formgroups -> Small columns
                    return col.fields !== undefined;
                })){
                    return false;
                }
            }
        }
        return true;
    }
    
    convertToFormGroupStructure(rows){			
        var _fieldsArray = [];
        var _newRows = [], _newRow = {fieldType: "row", styleclass: "", columns: []};
        for (var i = 0; i < rows.length; i++) {
            var _row = rows[i];
            
            // we only need a new row when the current row has a different amount of columns than the previous one
            if((i == 0 && rows.length > 1) || i > 0 && _row.columns.length !== rows[i-1].columns.length){
                _newRows.push(_newRow)
                _newRow = {fieldType: "row", styleclass:"row", columns: []}				
            }		

            for (var j = 0; j < _row.columns.length; j++) {
                var _column = _row.columns[j];

                var _newsmallColumnDummy = { fields: _column.fields, fieldType: 'smallcolumn', styleclass: 'col-sm-12'};
                var _newFormgroupDummy = { smallcolumns: [_.cloneDeep(_newsmallColumnDummy)], fieldType: 'form-group', styleclass: 'form-group'};
                
                if(_newRow.columns.length <= j){
                    var _newColumnDummy = { fieldType: "column", styleclass: _column.width["styleclass"], formgroups: [_.cloneDeep(_newFormgroupDummy)]};
                    _newRow.columns.push(_newColumnDummy);
                }
                else{
                    _newRow.columns[j].formgroups.push(_.cloneDeep(_newFormgroupDummy));
                }											
            }

            // Add the last row that's been converted
            if(i === (rows.length - 1)){
                _newRows.push(_newRow);
            }
        }

        return _newRows;
    }

    public saveGridColumn(isNew, model, listDesignImport) {
        var grid; //$("#" + this.component.uniqueID).dxDataGrid("instance");

        if (isNew === "true" || isNew === true) { // isNew via API is not transferred as boolean?
            if (!this.component.columns)
                this.component.columns = [];
            
            if(model.isDynamicAttribute){
                model.headerText = model.dynamicAttributeText
            }
            
            this.setFsDpName(model.properties, model.dataprovider);
            this.setHeaderTextAndCaption(model.properties, model.headerText ? model.headerText : model.dataprovider);						
            this.setDataprovider(model.properties, model.dataprovider, model.dynamicAttributeText ? model.dynamicAttributeText : null);
            this.setVisible(model.properties);
            
            var newColumn = {
                dataField: this.getConvertedDataprovider(model.dataprovider),
                caption: model.headerText ? model.headerText : model.dataprovider,
                properties: model.properties,
                dataprovider: model.dataprovider,
                dataprovider_type: model.dataprovider_type,
                headerText: model.headerText ? model.headerText : model.dataprovider,
                isDynamicAttribute: model.isDynamicAttribute ? model.isDynamicAttribute : false,
                dynamicAttributeText: model.dynamicAttributeText ? model.dynamicAttributeText : null,
                relation: model.relation,
                basetable: model.basetable
            };

            if(!listDesignImport)
                this.component.columns.push(newColumn);						
            else{
                model.caption = model.headerText ? model.headerText : model.dataprovider;
                model.dataField = model.dataprovider
            }
            grid.addColumn(newColumn);
            grid._options["columns"] = this.component.columns;
            
            this.column = newColumn;

            this.component.gridOptions = {
                dataSource: [],
                columns: this.component.columns,
                sorting: {
                    mode: 'none'
                }
            };
        } else {
            var convertedDP = this.getConvertedDataprovider(model.dataprovider);
            this.gridColumnProperties.isDynamicAttribute = model.isDynamicAttribute ? model.isDynamicAttribute : false;
            this.gridColumnProperties.dynamicAttributeText = model.dynamicAttributeText ? model.dynamicAttributeText : null;
            // use the old datafield name to update to new values
            grid.columnOption(this.gridColumnProperties.dataField, 'dataField', convertedDP)
            grid.columnOption(this.gridColumnProperties.dataField, 'caption', model.headerText ? model.headerText : model.dataprovider)
            // overwrite the existing dataField options
            this.gridColumnProperties.dataField = convertedDP;
            this.gridColumnProperties.caption = model.headerText ? model.headerText : model.dataprovider;
            this.gridColumnProperties.dataprovider_type = model.dataprovider_type;
        }
    }

    getConvertedDataprovider(dataprovider){
        return (dataprovider.split('.').pop() + '_' + this.randomNumber()).replace(/-/g, "");
    }
    
    public saveTab(isNew, model) {
        var grid;// = $("#" + this.component.uniqueID).dxDataGrid("instance");

        if (isNew === "true" || isNew === true) { // isNew via API is not transferred as boolean?
            if (!this.component.columns)
                this.component.columns = [];
            
            this.setFsDpName(model.properties, model.dataprovider);
            this.setVisible(model.properties);
            this.setHeaderTextAndCaption(model.properties, model.headerText ? model.headerText : model.dataprovider);

            var newColumn = {
                dataField: this.getConvertedDataprovider(model.dataprovider),
                caption: model.headerText ? model.headerText : model.dataprovider,
                properties: model.properties,
                headerText: model.headerText ? model.headerText : model.dataprovider
            };

            this.component.columns.push(newColumn);

            grid.addColumn(newColumn);

            this.component.gridOptions = {
                dataSource: [],
                columns: this.component.columns,
                sorting: {
                    mode: 'none'
                }
            };
        } else {
            var convertedDP = this.getConvertedDataprovider(model.dataprovider);
            // use the old datafield name to update to new values
            grid.columnOption(this.gridColumnProperties.dataField, 'dataField', convertedDP)
            grid.columnOption(this.gridColumnProperties.dataField, 'caption', model.headerText ? model.headerText : model.dataprovider)
            // overwrite the existing dataField options
            this.gridColumnProperties.dataField = convertedDP;
            this.gridColumnProperties.caption = model.headerText ? model.headerText : model.dataprovider;
        }
    }

    setFsDpName(properties, name) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name === 'fsDpName') {
                properties[i].value = name.split('.').pop() + '_' + this.randomNumber();
                return;
            }
        }
    }
    setHeaderTextAndCaption(properties, name) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name === 'headerText' || properties[i].name === 'caption') {
                properties[i].value = name;
                return;
            }
        }
    }
    setVisible(properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name === 'visible') {
                properties[i].value = true;
                return;
            }
        }
    }
    setDataprovider(properties, dpvalue, _updateName, _property?) {
        if(!_property){
            _property = {name: "dataprovider"};
        }
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name === _property.name) {							
                properties[i].value = dpvalue;
            }
            else if(_updateName && properties[i].name === 'name'){
                if(_updateName.indexOf('.') > -1)
                    _updateName = _updateName.replace('.', '_');
                properties[i].value = _updateName;
            }
        }
    }
    
    randomNumber() {
        return Math.floor(Math.random() * Math.floor(999999));
    }

    public setValuelistProperties(object) {
        var loopThrough = 'component';
        if(this.column && this.component.fieldType === "grid"){
            loopThrough = 'column';
        }
        
        /*for (var i = 0; i < $scope[loopThrough].properties.length; i++) {
            if ($scope[loopThrough].properties[i].name === 'valuelist') {
                $scope[loopThrough].properties[i].value = object;
                return;
            }
        }*/	
        
    }

    public setI18nProperties(object) {
        if(this.component.fieldType === "grid" && this.column){
            var grid;// = $("#" + this.component.uniqueID).dxDataGrid("instance");						
            grid.columnOption(this.column.dataField, 'caption', object["key"])						
        }
        else if(this.component.fieldType === 'tabpanel' && this.tab){
            this.tab.text = object["key"];
            return;
        }
        this.currentProperty.value = object["key"];
        this.updateTextProperties(this.currentProperty);

        if(object["translated_i18n"])
        {
            var _translation_prop = _.find(this.component.properties, {name: "translated_i18n"});
            _translation_prop.value = object["translated_i18n"];
        }
    }

    public setEventProperties(result) {
        this.currentEvent.value = result.id;
        this.currentEvent.code = result.code;
    }

    findSearchFilteredFields() {
        setTimeout(function() {
                this.initFilteredFields(this.searchValue);
            }, 500);
    }
    
    findSearchTabFields() {
        setTimeout(function() {
            this.initFilteredTabFields(this.searchTabFieldsValue);
        }, 500);
    }

    addSortableRowColumn(row) {
        var columnSpan = _.find(this.colspanOptions, { colspan: 1 });
        var column = { formgroups: [_.cloneDeep(this._dummyFormgroup)], styleclass: columnSpan.styleclass, fieldType: 'column' };
        row.columns.push(column);
        this.openSidebar(column, row);
        this.checkIfRowCanAddColumns(row);
    }

    checkIfRowCanAddColumns(row) {
        var rowColspan = 0;
        row.columns.forEach(column => {
            rowColspan += _.find(this.colspanOptions, function(col){ return column.styleclass.indexOf(col.styleclass) > -1 }).colspan;
        });
        row.hasDeletedColumns = rowColspan < 12;
    }

    colspanChanged() {
        this.checkIfRowCanAddColumns(this.row);
    }

    /*public hideFormBuilder() {
        $("body").removeClass("background-white");
    }*/

    public saveForm(servoyDeveloperSave) {
        if(this.tabSequenceMode){
            // switch off tabSequenceMode or it will be loaded when the form gets activated again in design mode.
            this.toggleTabSequenceMode();
        }
        //this.isFormEdited = !angular.equals(this.copiedJSONRows, this.rows);
        var jsEvent = { svyType: 'JSEvent' };
        //this.servoyDeveloperSave = servoyDeveloperSave;
        this.listDesignMode = this.listDesignMode;

        //TODO: refactor this, do not send entire model
        this.onSaveForm(jsEvent, this).then(function(result) {
            if(result){							
                this.parent_view_id = result.parent_view_id;							
                this.custom_view_id = result.custom_view_id;
            }
                
            this.isNewForm = false;
            this.copiedJSONRows = _.cloneDeep(this.rows);
            this.formStateChanged(false);
            this.formState = true
        });
    }


    /*this.$watch('model.rows', function(newValue) {
            if (this.formState === false) {
                // loadJSONModel will initialize the model.rows causing this line to trigger
                this.formState = true;
            } else if (this.formState === true) {
                this.formStateChanged(true);
                this.formState = null;
            }
        }, true);*/

    public toggleListDesignMode(custom_view_id, parent_view_id, grid) {
        this.formState = false;
        this.listDesignMode = true;
        this.rows = [];
        this.parent_view_id = parent_view_id;
        this.custom_view_id = custom_view_id;
        this.startFromName = grid.startFromName;
        this.startFromId = grid.startFromId;
        grid.isNewField = true;
        if(custom_view_id){
            if(!this.checkIfFormGroupStructure(grid.rows))
            {
                grid.rows = this.convertToFormGroupStructure(grid.rows);						
            }
            this.rows = grid.rows;
        }
        else{
            this.addRow(_.find(this.nrOfColumns, { amount: 1 }));
            grid.uniqueID = this.getUniqueID()
            this.rows[0].columns[0].formgroups[0].smallcolumns[0].fields.push(grid);	
            this.component = grid;
            
            this.mapFoundsetToProperties(this.component);						
            setTimeout(function(){
                for (var i = 0; i < grid.columns.length; i++) {
                    grid.columns[i].properties = _.cloneDeep(grid.columnProperties);
                    this.saveGridColumn(true, grid.columns[i], true)
                }
            }, 500)
        }
    }
    
    mapFoundsetToProperties(component) {
        for (var i = 0; i < component.properties.length; i++) {
            if (component.properties[i].name === 'foundset') {
                component.properties[i].value = component.foundset;
                return;
            }
        }
    }
    
    clearForm(){
        if(confirm("Are you sure you want to clear this form?")){
            for (var i = this.rows.length; i--;) {
                this.deleteContainer(this.rows[i]);
            }
            
            this.initializeFormFields();
        }					
    }
    
    removeFieldFromSidebar(field, fields, index){
        if(confirm("Are you sure you want to delete the field '"+field.name+ "'? You will not be able to retrieve it if you save your changes.")){
            fields.splice(index, 1);
            this.allFields = _.reject(this.allFields, field)
        }
    }
    
    toggleTabSequenceMode(){										
        this.tabSequenceMode = !this.tabSequenceMode				
        
        if(this.tabSequenceMode){
            this.maxTabsequence = 0;
            this.initializeTabSeqProperties();
        }
    }
    
    initializeTabSeqProperties(){
        for (var i = 0; i < this.rows.length; i++) {
            for (var j = 0; j < this.rows[i].columns.length; j++) {
                var _column = this.rows[i].columns[j]; 
                for (var k = 0; k < _column.formgroups.length; k++) {
                    var _fgroup = _column.formgroups[k];
                    for (var l = 0; l < _fgroup.smallcolumns.length; l++) {
                        var _scol = _fgroup.smallcolumns[l];
                        for (var m = 0; m < _scol.fields.length; m++) {
                            var _field = _scol.fields[m];	
                            var _tabSeq = _.find(_field.properties, {name: 'tabSeq'})
                            if(_tabSeq){
                                _field.tabSeq = _tabSeq.value;
                                if(this.maxTabsequence < _tabSeq.value)
                                    this.maxTabsequence = _tabSeq.value;
                            }
                        }
                    }
                }
            }
        }
    }
    
    setTabsequence(field){
        if(this.maxTabsequence === undefined)
            this.maxTabsequence = 0;
        field.tabSeq = ++this.maxTabsequence;
        
        for (var i = 0; i < field.properties.length; i++) {
            if(field.properties[i].name === 'tabSeq'){
                field.properties[i].value = this.maxTabsequence;
            }
        }
        
        field.tabSeqSetClass = "tabsequence-set"
    }
    
    clearFieldTabseq(field){
        field.tabSeq = -2;
        
        for (var i = 0; i < field.properties.length; i++) {
            if(field.properties[i].name === 'tabSeq'){
                field.properties[i].value = -2;
            }
        }
        
        field.tabSeqSetClass = "";
    }
    
    resetTabsequence(){
        if(confirm("Are you sure you wish to reset the tabsequence value for all fields on the form?")){
            this.maxTabsequence = 0;
            for (var i = 0; i < this.rows.length; i++) {
                for (var j = 0; j < this.rows[i].columns.length; j++) {
                    var _column = this.rows[i].columns[j]; 
                    for (var k = 0; k < _column.formgroups.length; k++) {
                        var _fgroup = _column.formgroups[k];
                        for (var l = 0; l < _fgroup.smallcolumns.length; l++) {
                            var _scol = _fgroup.smallcolumns[l];
                            for (var m = 0; m < _scol.fields.length; m++) {
                                var _field = _scol.fields[m];	
                                var _tabSeq = _.find(_field.properties, {name: 'tabSeq'})
                                if(_tabSeq){
                                    _field.tabSeq = -2;
                                    _field.tabSeqSetClass = "";

                                    for (var l = 0; l < _field.properties.length; l++) {
                                        if(_field.properties[l].name === 'tabSeq')
                                            _field.properties[l].value = -2;
                                    }
                                }	
                            }
                        }
                    }
                }
            }
        }					
    }
    
    
    setFieldTabseqInline(field){
        field.editTabseqInline = true;
    }
    
    confirmInlineTabseq(field){
        field.editTabseqInline = false;
        if(field.tabSeq !== -2 && field.tabSeq < this.maxTabsequence && confirm("You entered a tabseq value that already exists on the form. Do you wish to increase the tabSeq value with 1 for all consecutive fields?")){
            this.updateConsecutiveTabsequences(field);
        }
        for (var i = 0; i < field.properties.length; i++) {
            if(field.properties[i].name === 'tabSeq'){
                field.properties[i].value = field.tabSeq;
            }
        }
    }
    
    updateConsecutiveTabsequences(field){
        for (var i = 0; i < this.rows.length; i++) {
            for (var j = 0; j < this.rows[i].columns.length; j++) {
                var _column = this.rows[i].columns[j]; 
                for (var k = 0; k < _column.formgroups.length; k++) {
                    var _fgroup = _column.formgroups[k];
                    for (var l = 0; l < _fgroup.smallcolumns.length; l++) {
                        var _scol = _fgroup.smallcolumns[l];
                        for (var m = 0; m < _scol.fields.length; m++) {
                            var _field = _scol.fields[m];	
                            if(_field === field)
                                continue;
                    
                            var _tabSeq = _.find(_field.properties, {name: 'tabSeq'})
                            if(_tabSeq){									
                                if(_field.tabSeq >= field.tabSeq){
                                    _tabSeq.value++;
                                    _field.tabSeq = _tabSeq.value;
                                }									
                            }									
                        }	
                    }
                }
            }
        }				
    }
    
    updateFieldProperties(){
        if(this.allFields){
            // As the entire form design is saved as a JSON in DB, we need to be able to update the JSON values of all field properties in case there are changes to field definitions 
            for (var f = 0; f < this.allFields.length; f++) {
                var _newF = _.find(this.newFields, {fieldType: this.allFields[f].fieldType});
                this.updateFieldJSONValues(this.allFields[f], _newF);
            }	
        }
        
        for (var i = 0; i < this.rows.length; i++) {
            for (var j = 0; j < this.rows[i].columns.length; j++) {
                var _column = this.rows[i].columns[j]; 
                for (var k = 0; k < _column.formgroups.length; k++) {
                    var _fgroup = _column.formgroups[k];
                    for (var l = 0; l < _fgroup.smallcolumns.length; l++) {
                        var _scol = _fgroup.smallcolumns[l];
                        for (var m = 0; m < _scol.fields.length; m++) {
                            var _field = _scol.fields[m];	
                            var _newField = _.find(this.newFields, {fieldType: _field.fieldType});
                            this.updateFieldJSONValues(_field, _newField);	
                        }
                    }
                }
            }
        }
    }
    
    updateFieldJSONValues(_field, _newField){
        this.setNewFieldProperties(_field, _newField.properties, 'properties')
        this.setNewFieldEvents(_field, _newField.events);
        if(_field.fieldType === 'grid'){
            this.setNewFieldProperties(_field, _newField.columnProperties, 'columnProperties')
            
            for (var i = 0; i < _field.columns.length; i++) {
                this.setNewFieldProperties(_field.columns[i],_newField.columnProperties,'properties')
            }
        }
    }
    
    setNewFieldProperties(_field, _properties, _nameProperties){
        for (var i = 0; i < _properties.length; i++) {
            var _propFound = _.find(_field[_nameProperties], {name: _properties[i].name});
            if(_propFound){
                if(_propFound.values){
                    _propFound.values = _.cloneDeep(_properties[i].values);
                }
            }
            else {
                _field[_nameProperties].push(_.cloneDeep(_properties[i]));
            }
        }
    }
    
    setNewFieldEvents(_field, _events){
        for (var i = 0; i < _events.length; i++) {
            var _eventFound = _.find(_field.events, {name: _events[i].name});
            if(_eventFound){
                continue;
            }
            else {
                _field.events.push(_.cloneDeep(_events[i]));
            }
        }
    }
    
    /*(function(d, a, s, h, b, oa, rd) {
        if (!d[b]) {oa = a.createElement(s), oa.async = 1;
        oa.src = h; rd = a.getElementsByTagName(s)[0];
        rd.parentNode.insertBefore(oa, rd);} d[b]=d[b]||{};
        d[b].addDashboard=d[b].addDashboard||function(v) {
        (d[b].list = d[b].list || []).push(v) };
        })(window, document, 'script',
        'https://cdn-a.cumul.io/js/cumulio.min.js', 'Cumulio');
    
    removeCumulioDashboard (uniqueID){
        Cumulio.removeDashboard({
            container: '#cumulio-' + uniqueID
            });
    }*/
    
    /*public dashboardProperties(object){
        if(this.component.dashboard){
            removeCumulioDashboard(this.component.uniqueID);
        }
        this.component.dashboard = object;
        Cumulio.addDashboard({
            dashboardId: object.dashboard_id,
            container: '#cumulio-' + this.component.uniqueID
            });
        
        for (var i = 0; i < this.component.properties.length; i++) {
            if (this.component.properties[i].name === 'dashboardID') {
                this.component.properties[i].value = object.dashboard_id;
                this.component.properties[i].dashboard_name = object.dashboard_name;							
            }
            else if (this.component.properties[i].name === 'datasetID') {
                this.component.properties[i].value = object.dataset_id;
                this.component.properties[i].dataset_name = object.dataset_name;							
            }
            else if (this.component.properties[i].name === 'columnID') {
                this.component.properties[i].value = object.column_id;
                this.component.properties[i].column_name = object.column_name;							
            }
        }
    }*/
    
    getFieldPropertyValue(field, property){
        if(property){
            var prop = _.find(field.properties, {name: property});
            
            if(prop && field.fieldType === 'selector')
            {	
                if(!prop.value)
                    return null;		
                if(property === 'layout')			
                {
                    return this.getConvertedWidthRatio(prop.value);
                }
                else 
                if(property.indexOf("_value") > -1)
                {
                    var _valueToShow = prop.value.indexOf(".") > -1 ? prop.value.split(".").pop() : prop.value;
                    return _valueToShow;
                }
                else return prop.value;
            }
            else if(field.fieldType === undefined && property === 'headerText')
            {
                if(prop.value && prop.value.indexOf(".") > -1)
                {
                    var _valueToShow = prop.value.indexOf(".") > -1 ? prop.value.split(".").pop() : prop.value;
                    return _valueToShow;
                }
                else return prop.value;
            }
            else if(prop){							
                return prop.value;
            }
            else if(property === 'translated_i18n')
            {
                var _label_text = _.find(field.properties, {name: 'label_text'});
                return _label_text ? _label_text.value : ""; 
            }
        }
        return "";
    }
    
    styleClassChanged(component?)
    {
        if(this.component.fieldType === 'smallcolumn')
        {
            var _colSmToAdd = 12;
            this.formgroup.smallcolumns.forEach(col => {
                var _col_width_string = col.styleclass.substring((this.component.styleclass.indexOf("col-sm-") + 7), (this.component.styleclass.indexOf("col-sm-")+9))
                if(_col_width_string){
                    _colSmToAdd -= parseInt(_col_width_string);
                }
            });
            if(_colSmToAdd <= 0){
                return;
            }
            if(this.row && this.component.styleclass.indexOf("col-sm-12") === -1)
            {						
                this.formgroup['smallcolumns'].push({fieldType: 'smallcolumn', fields: [], styleclass: "col-sm-" + _colSmToAdd});							
            }
        }
        else if(this.component.fieldType === 'column'){
            this.checkIfRowCanAddColumns(this.row);
        }
    }

    addFormgroup(column)
    {
        column.formgroups.push(_.cloneDeep(this._dummyFormgroup));	
    }

    getHandlerShowOriginalFormFieldsModal()
    {
        this.showOriginalFormFieldsModal(this.name, this.startFromId, this.startFromName);
    }

    public addOriginalFormFields(fields){
        this.allFields = this.allFields.concat(fields);
        this.initFilteredFields();
    }

    public setProgramProperties(_program){				
        for (var i = 0; i < this.component.properties.length; i++) {
            if (this.component.properties[i].name === 'deeplink_program') {
                this.component.properties[i].value = _program;
                return;
            }					
        }
    }

    toggleTabFieldsOpened(_tabIndex){
        this.showTabFieldsIndex === _tabIndex ? this.showTabFieldsIndex = -1 : this.showTabFieldsIndex = _tabIndex;
        this.initFilteredTabFields();
    }
}
