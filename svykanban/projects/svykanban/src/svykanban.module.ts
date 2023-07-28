
import { NgModule } from '@angular/core';
import {SvyKanban} from './kanban/kanban';
import { CommonModule } from '@angular/common';
 
@NgModule({
    declarations: [
        SvyKanban
    ],
    providers: [],
    imports: [
        CommonModule 
    ],
    exports: [ 
        SvyKanban
      ]
})
export class SvyKanbanModule {}
