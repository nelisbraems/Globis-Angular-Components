import { Component, ChangeDetectorRef, Renderer2, Input, ChangeDetectionStrategy,} from '@angular/core';
import { GlobisBaseComponent } from '../../ngclient/globisbasecomponent';


@Component({
    selector: 'globiscomponents-Label',
    templateUrl: './Label.html',
    styleUrls: ['./Label.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisLabel extends GlobisBaseComponent<HTMLLabelElement>{
    @Input() toolTipText: string;
    @Input() labelDetails: {labelText: string; labelOrientation: string; labelCss: string; styleClass: string};

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, ) {
        console.log('constructor for Label');
        super(renderer, cdRef);
    }

    svyOnInit() {
        console.log('on init');
    }
}