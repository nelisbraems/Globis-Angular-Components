import { Component, ChangeDetectorRef, Renderer2, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'globiscomponents-CheckBox',
    templateUrl: './CheckBox.html',
    styleUrls: ['./CheckBox.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobisCheckBox {
    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        
    }
}
