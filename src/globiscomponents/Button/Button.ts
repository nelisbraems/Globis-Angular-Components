import { Component, ChangeDetectorRef, Renderer2, Input, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { GlobisBaseComponent } from '../../ngclient/globisbasecomponent';



@Component({
    selector: 'globiscomponents-Button',
    templateUrl: './Button.html',
    styleUrls: ['./Button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisButton extends GlobisBaseComponent<HTMLButtonElement> {
    @Input() faIcon: string;
    @Input() buttonType: string;
    @Input() toolTipText: string;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
        console.log('constructor for dxButton');
    }

    svyOnInit() {
        console.log('on init');
        super.svyOnInit();
        if ( this.onDoubleClickMethodID ) {
            this.renderer.listen( this.elementRef.element.nativeElement, 'dblclick', ( e ) => {
                this.onDoubleClickMethodID( e );
            } );
        }
    }
}