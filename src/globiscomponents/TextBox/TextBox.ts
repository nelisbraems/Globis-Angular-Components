import { Component, ChangeDetectorRef, Renderer2, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'globiscomponents-Text-Box',
    templateUrl: './TextBox.html',
    styleUrls: ['./TextBox.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobisTextbox {
    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        
    }
}
