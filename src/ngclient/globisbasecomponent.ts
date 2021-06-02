import { Input, Renderer2, Directive, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ServoyBaseComponent } from './basecomponent';

@Directive()
// eslint-disable-next-line
export class GlobisBaseComponent<T extends HTMLElement> extends ServoyBaseComponent<T> {
    @Input() readOnly: boolean;
    @Input() enabled: boolean;

    @Input() icon: string;
    @Input() css: string;
    @Input() styleClass: string;
    @Input() styleClassDataprovider: string;
    @Input() labelDetails: {labelText: string; labelOrientation: string; labelCss: string; styleClass: string};

    @Input() text: string;
    @Input() toolTipText: string;

    @Input() dataProviderID: any;
    @Input() tabSeq: number;

    @Input() rtlEnabled: boolean;
    @Input() findmode: boolean;

    @Input() onDataChangeMethodID: (oldValue: any, newValue: any, e: Event) => void;

    @Input() onActionMethodID: (e: Event, data?: any) => void;
    @Input() onRightClickMethodID: (e: Event, data?: any) => void;
    @Input() onDoubleClickMethodID: (e: Event, data?: any) => void;

    constructor(protected readonly renderer: Renderer2, protected cdRef: ChangeDetectorRef) {
        super(renderer, cdRef);
    }

    /**
     * this returns the id servoy uses to refer to the component
     */
    public getMarkupId() {
        return this.servoyApi.getMarkupId();
    }

    /**
     * this should return the main native element (like the first div)
     */
    public getNativeElement(): T {
        return this.elementRef ? (this.elementRef.nativeElement ? this.elementRef.nativeElement : this.elementRef.element ? this.elementRef.element.nativeElement : null ) : null;
    }
}