import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import { Component, ChangeDetectorRef, Renderer2, Input, ElementRef, ChangeDetectionStrategy, ViewChild, Inject } from '@angular/core';
import { ServoyBootstrapBasefield } from '../../bootstrapcomponents/bts_basefield';

@Component({
    selector: 'globiscomponents-Form-Builder',
    templateUrl: './FormBuilder.html',
    styleUrls: ['./FormBuilder.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GlobisFormBuilder extends ServoyBootstrapBasefield<HTMLElement> {
    weeks = [];
    connectedTo = [];
      
    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, @Inject(DOCUMENT) doc: Document) {
        super(renderer, cdRef, doc);

        this.weeks = [
            {
              id:'week-1',
              weeklist:[
                "item 1",
                "item 2",
                "item 3",
                "item 4",
                "item 5"
              ]
            },{
              id:'week-2',
              weeklist:[
                "item 1",
                "item 2",
                "item 3",
                "item 4",
                "item 5"
              ]
            },{
              id:'week-3',
              weeklist:[
                "item 1",
                "item 2",
                "item 3",
                "item 4",
                "item 5"
              ]
            },{
              id:'week-4',
              weeklist:[
                "item 1",
                "item 2",
                "item 3",
                "item 4",
                "item 5"
              ]
            },
          ];
          for (let week of this.weeks) {
            this.connectedTo.push(week.id);
          };
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
          transferArrayItem(event.previousContainer.data,
                            event.container.data,
                            event.previousIndex,
                            event.currentIndex);
        }
      }
    
}
