import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Renderer2, SimpleChanges, ElementRef, AfterViewInit, Input, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ServoyBootstrapBasefield } from '../bts_basefield';

@Component({
    selector: 'bootstrapcomponents-checkbox',
    templateUrl: './checkbox.html',
    styleUrls: ['./checkbox.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServoyBootstrapCheckbox extends ServoyBootstrapBasefield<HTMLDivElement> {

    @Input() showAs: string;

    @ViewChild('input') input: ElementRef;

    selected = false;

    constructor(renderer: Renderer2, protected cdRef: ChangeDetectorRef, @Inject(DOCUMENT) doc: Document) {
        super(renderer, cdRef, doc);
    }

    svyOnInit() {
        super.svyOnInit();
        this.attachEventHandlers(this.getNativeElement());
    }

    svyOnChanges(changes: SimpleChanges) {
        for (const property in changes) {
            switch (property) {
                case 'dataProviderID':
                    this.setSelectionFromDataprovider();
                    break;

            }
        }
        super.svyOnChanges(changes);
    }

    getFocusElement(): HTMLElement {
        return this.input.nativeElement;
    }

    requestFocus( mustExecuteOnFocusGainedMethod: boolean ) {
        this.mustExecuteOnFocus = mustExecuteOnFocusGainedMethod;
        ( this.getFocusElement() as HTMLElement ).focus();
    }

    attachEventHandlers( element: any ) {
        if ( !element )
            element = this.getNativeElement();
        this.renderer.listen( element, 'click', ( e ) => {
            if ( !this.readOnly && this.enabled ) {
                this.itemClicked( e );
                if ( this.onActionMethodID ) this.onActionMethodID( e );
            }
        } );
        super.attachFocusListeners( element );
    }

    itemClicked(event) {
        // reverse the selected value (data provider too)
        if (event.target.localName === 'span' || event.target.localName === 'label'
            || event.target.localName === 'div') {
            this.selected = !this.selected;
            event.preventDefault();
        }
        if (typeof this.dataProviderID === 'string') {
            this.dataProviderID = this.dataProviderID === '1' ? '0' : '1';
        } else {
            this.dataProviderID = this.dataProviderID > 0 ? 0 : 1;
        }
        this.pushUpdate();
        event.target.blur();
    }

    setSelectionFromDataprovider() {
        this.selected = this.getSelectionFromDataprovider();
    }

    getSelectionFromDataprovider() {
        if (!this.dataProviderID) {
            return false;
        } else if (typeof this.dataProviderID === 'string') {
            return this.dataProviderID === '1';
        } else {
            return this.dataProviderID > 0;
        }
    }
}
