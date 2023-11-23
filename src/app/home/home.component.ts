import { Component, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../shared/ui/modal/modal.component';
import { FormModalComponent } from '../shared/ui/form-modal/form-modal.component';
import { Checklist } from '../shared/interfaces/checklist';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
     <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>
    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template>
          <app-form-modal
            [title]="
              checklistBeingEdited()?.title
                ? checklistBeingEdited()!.title!
                : 'Add Checklist'
            "
            [formGroup]="checklistForm"
            (close)="checklistBeingEdited.set(null)"
          />
      </ng-template>
    </app-modal>
  `,
  styles: ``,
  imports: [ModalComponent, FormModalComponent]
})
export default class HomeComponent {
  formBuilder = inject(FormBuilder);
  checklistBeingEdited = signal<Partial<Checklist> | null>(null);
  checklistForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklist = this.checklistBeingEdited();

      if (!checklist) {
        this.checklistForm.reset();
      }
    })
  }

}