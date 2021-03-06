import { Injectable } from '@angular/core';

@Injectable()
export class DatagridService {
    public iconConfig: any;
    public toolPanelConfig: any;
    public gridOptions: any;
    public localeText: any;
    public columnOptions: any;
    public mainMenuItemsConfig: any;
    public arrowsUpDownMoveWhenEditing: string;

    /**
     * Creates an empty icon configuration object
     *
     * @return object
     */
    createIconConfig() {
        return {
            iconGroupExpanded: 'fa fa-minus ag-icon',
            iconGroupContracted: 'fa fa-plus ag-icon',
            iconRefreshData: 'fa fa-sync'
        };
    }

    /**
     * Creates an empty toolpanel configuration object
     *
     * @return object
     */
    createToolPanelConfig() {
        return {};
    }

    /**
     * Creates an empty mainMenuItems configuration object
     *
     * @return object
     */
    createMainMenuItemsConfig() {
        return {};
    }
}
