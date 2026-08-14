
import { NgModule } from '@angular/core';
import { SvyKanban } from './kanban/kanban';

@NgModule({
    imports: [
        SvyKanban
    ],
    exports: [
        SvyKanban
    ]
})
export class SvyKanbanModule {}
