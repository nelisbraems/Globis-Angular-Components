import { Component, Input, ChangeDetectorRef, Renderer2, SimpleChanges, ViewChild, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ServoyDefaultBaseField } from '../basefield';
import { FormattingService, PropertyUtils } from '../../ngclient/servoy_public';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'servoydefault-htmlarea',
    templateUrl: './htmlarea.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServoyDefaultHtmlarea extends ServoyDefaultBaseField<HTMLDivElement> {

    @ViewChild(AngularEditorComponent) editor: AngularEditorComponent;

    config: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        translate: 'no',
        defaultParagraphSeparator: 'p'
    };

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, formattingService: FormattingService, @Inject(DOCUMENT) doc: Document) {
        super(renderer, cdRef, formattingService, doc);
    }

    attachFocusListeners() {
        if ( this.onFocusGainedMethodID ) {
            this.editor.focusEvent.subscribe(() => {
                if ( this.mustExecuteOnFocus === true ) {
                    this.onFocusGainedMethodID( new CustomEvent( 'focus' ) );
                }
                this.mustExecuteOnFocus = true;
            } );
        }

        this.editor.blurEvent.subscribe(() => {
            this.pushUpdate();
            if ( this.onFocusLostMethodID ) this.onFocusLostMethodID( new CustomEvent( 'blur' ) );
        } );
    }

    svyOnInit() {
        super.svyOnInit();

        // ugly hack to fix the height
        const nativeElement = this.getNativeElement();
        const componentHeight = nativeElement.offsetHeight;
        // let toolBarHeight = nativeElement.childNodes[0].childNodes[0].childNodes[1].childNodes[1].offsetHeight;
        const initialContentHeight = (nativeElement.childNodes[0].childNodes[0].childNodes[2].childNodes[0] as HTMLElement).offsetHeight;
        const initialEditorHeight = (nativeElement.childNodes[0].childNodes[0]as HTMLElement).offsetHeight;

        this.renderer.setStyle(nativeElement.childNodes[0].childNodes[0].childNodes[2].childNodes[0], 'height', (initialContentHeight + componentHeight - initialEditorHeight) + 'px');

        // work around for https://github.com/kolkov/angular-editor/issues/341
        setTimeout(() => {
            this.cdRef.detectChanges();
        }, 5);
    }

    svyOnChanges(changes: SimpleChanges) {
        if (changes) {
            for (const property of Object.keys(changes)) {
                const change = changes[property];
                switch (property) {
                    case 'styleClass':
                        if (change.previousValue)
                            this.renderer.removeClass(this.getNativeElement(), change.previousValue);
                        if (change.currentValue)
                            this.renderer.addClass(this.getNativeElement(), change.currentValue);
                        break;
                    case 'scrollbars':
                        if (change.currentValue) {
                            const element = this.getNativeChild().textArea;
                            PropertyUtils.setScrollbars(element, this.renderer, change.currentValue);
                        }
                        break;
                    case 'editable':
                    case 'readOnly':
                    case 'enabled':
                        this.config.editable = this.editable && !this.readOnly && this.enabled;
                        break;
                }
            }
        }
        super.svyOnChanges(changes);
    }

    getFocusElement() {
        return this.editor.textArea.nativeElement;
    }

    requestFocus( mustExecuteOnFocusGainedMethod: boolean ) {
        this.mustExecuteOnFocus = mustExecuteOnFocusGainedMethod;
        this.getFocusElement().focus();
    }

    public selectAll() {
        const range = this.doc.createRange();
        range.selectNodeContents(this.getFocusElement());
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    public getScrollX(): number {
        return this.getNativeElement().scrollLeft;
    }

    public getScrollY(): number {
        return this.getNativeElement().scrollTop;
    }
    
    public replaceSelectedText( text: string ) {
        var sel: any, range: any;
        if ( window.getSelection ) {
            sel = window.getSelection();
            if ( sel.rangeCount ) {
                range = sel.getRangeAt( 0 );
                range.deleteContents();
                range.insertNode( this.doc.createTextNode( text ) );
            }
        }
    }

    public setScroll( x: number, y: number ) {
        this.getNativeElement().scrollLeft = x;
        this.getNativeElement().scrollTop = y;
    }
}
