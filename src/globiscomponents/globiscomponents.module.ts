
import { NgModule } from '@angular/core';
import { ServoyPublicModule } from '../ngclient/servoy_public.module';
import { SabloModule } from '../sablo/sablo.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobisTextbox } from './TextBox/textbox';
import { DxButtonModule, DxCheckBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { GlobisButton } from './Button/Button';
import { GlobisCheckBox } from './CheckBox/CheckBox';

@NgModule({
    declarations: [
      GlobisTextbox,
      GlobisButton,
      GlobisCheckBox
    ],
    providers: [],
    imports: [
      ServoyPublicModule,
      SabloModule,
      CommonModule,
      FormsModule,
      DxTextBoxModule,
      DxButtonModule,
      DxCheckBoxModule
    ],
    exports: [
      GlobisTextbox,
      GlobisButton,
      GlobisCheckBox
    ]
})
export class GlobisComponentsModule {
     constructor(  ) {}
}
