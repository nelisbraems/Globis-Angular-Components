import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectorRef, Renderer2, Input, ElementRef, ChangeDetectionStrategy, ViewChild, Inject } from '@angular/core';
import { ServoyBootstrapBasefield } from '../../bootstrapcomponents/bts_basefield';

@Component({
    selector: 'globiscomponents-Check-Box',
    templateUrl: './CheckBox.html',
    styleUrls: ['./CheckBox.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisCheckBox extends ServoyBootstrapBasefield<HTMLButtonElement> {
    @Input() onLabelDoubleClickMethodID: (e: Event, data?: any) => void;
    @Input() alignment: number;
    @Input() focusStateEnabled: boolean;
    @Input() hoverStateEnabled: boolean;

    @ViewChild('input') input: ElementRef;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, @Inject(DOCUMENT) doc: Document) {
        super(renderer, cdRef, doc);
    }

    onValueChanged($event) {
        this.onDataChangeMethodID($event.previousValue, $event.value, new Event('Input'));
    }
}
