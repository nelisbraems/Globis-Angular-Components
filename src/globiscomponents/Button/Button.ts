import { Component, ChangeDetectorRef, Renderer2, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'globiscomponents-Button',
    templateUrl: './Button.html',
    styleUrls: ['./Button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobisButton {
    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        
    }
}
