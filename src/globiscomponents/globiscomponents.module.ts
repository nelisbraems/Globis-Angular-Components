
import { NgModule } from '@angular/core';
import { ServoyPublicModule } from '../ngclient/servoy_public.module';
import { SabloModule } from '../sablo/sablo.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobisTextbox } from './TextBox/textbox';
import { DxButtonModule, DxCheckBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { GlobisButton } from './Button/Button';
import { GlobisCheckBox } from './CheckBox/CheckBox';
import { GlobisFormBuilder } from './FormBuilder/FormBuilder';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [
      GlobisTextbox,
      GlobisButton,
      GlobisCheckBox,
      GlobisFormBuilder
    ],
    providers: [],
    imports: [
      ServoyPublicModule,
      SabloModule,
      CommonModule,
      FormsModule,
      DxTextBoxModule,
      DxButtonModule,
      DxCheckBoxModule,
      DragDropModule
    ],
    exports: [
      GlobisTextbox,
      GlobisButton,
      GlobisCheckBox,
      GlobisFormBuilder
    ]
})
export class GlobisComponentsModule {
     constructor(  ) {}
}
