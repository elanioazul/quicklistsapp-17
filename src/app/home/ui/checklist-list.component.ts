import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Checklist, RemoveChecklist } from '../../shared/interfaces/checklist';
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
          <div>
          <button (click)="edit.emit(list)">Edit</button>
          <button (click)="delete.emit(list.id)">Delete</button>
        </div>
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
  @Output() delete = new EventEmitter<RemoveChecklist>();
  @Output() edit = new EventEmitter<Checklist>();

}
