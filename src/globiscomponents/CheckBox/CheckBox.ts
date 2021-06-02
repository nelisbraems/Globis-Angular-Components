import { Component, ChangeDetectorRef, Renderer2, Input, ElementRef, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { GlobisBaseComponent } from '../../ngclient/globisbasecomponent';

@Component({
    selector: 'globiscomponents-Check-Box',
    templateUrl: './CheckBox.html',
    styleUrls: ['./CheckBox.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisCheckBox extends GlobisBaseComponent<HTMLInputElement> {
    @Input() alignment: number;
    @Input() focusStateEnabled: boolean;
    @Input() hoverStateEnabled: boolean;
    @Input() threeStates: boolean;

    @Input() onLabelActionMethodID: (e: Event, data?: any) => void;

    @ViewChild('input') input: ElementRef;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
    }

    onValueChanged($event) {
        if (this.findmode || this.threeStates && ($event.value !== undefined)){
            if (this.dataProviderID === null) {
                // treat null value update from backend as undefined
                $event.component.option('value', undefined);
            }
            if ($event.event) {
                // user input
                let newValue = $event.value;
                if ($event.previousValue === false) {
                    newValue = null;
                    // for dx component third state visualization value needs to be undefined
                    $event.component.option('value', undefined);
                }
                this.servoyApi.apply('dataProviderID', newValue);
                this.onDataChangeMethodID($event.previousValue, newValue, new Event('Input'));
            }
        }
    }
}
