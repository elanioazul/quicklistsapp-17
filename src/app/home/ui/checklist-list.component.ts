import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Checklist } from '../../shared/interfaces/checklist';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul>
      @for (list of checklists; track $index) {
        <li>
          {{list.title}}
        </li>
      } @empty {
        <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  styles: ``
})
export class ChecklistListComponent {
  @Input({ required: true }) checklists!: Checklist[];

}
