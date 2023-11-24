import { Component, Input } from '@angular/core';
import { Checklist } from '../../shared/interfaces/checklist';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <ul>
      @for (list of checklists; track $index) {
        <li>
          <a routerLink="/checklist/{{ list.id }}">
            {{ list.title }}
          </a>
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
