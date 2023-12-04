import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, take } from 'rxjs';
import {
  AddChecklist,
  Checklist,
  EditChecklist,
} from '../interfaces/checklist';
import { StorageService } from './storage.service';
import { ChecklistItemService } from '../../checklist/data-access/checklist-item.service';
import { connect } from 'ngxtension/connect';

export interface ChecklistsState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  storageService = inject(StorageService);
  private checklistsLoaded$ = this.storageService.loadChecklists().pipe(
    catchError((err) => {
      this.error$.next(err);
      return EMPTY;
    })
  );

  checklistItemService = inject(ChecklistItemService);

  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null,
  });

  // selectors
  checklists = computed(() => this.state().checklists);
  loaded = computed(() => this.state().loaded);

  // sources
  add$ = new Subject<AddChecklist>();
  remove$ = this.checklistItemService.checklistRemoved$;
  edit$ = new Subject<EditChecklist>();
  private error$ = new Subject<string>();

  constructor() {
    // reducers
    this.add$.pipe(takeUntilDestroyed()).subscribe((checklist) =>
      this.state.update((state) => ({
        ...state,
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
    );

    this.remove$.pipe(takeUntilDestroyed()).subscribe((removed) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.filter(
          (checklist) => checklist.id !== removed
        ),
      }))
    );

    this.edit$.pipe(takeUntilDestroyed()).subscribe((eddited) =>
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.map((checklist) =>
          checklist.id === eddited.id
            ? { ...checklist, title: eddited.data.title }
            : checklist
        ),
      }))
    );

    this.checklistsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (checklists) =>
        this.state.update((state) => ({
          ...state,
          checklists,
          loaded: true,
        })),
      error: (err) => this.state.update((state) => ({ ...state, error: err })),
    });

    //efects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
    });
  }

  private addIdToChecklist(checklist: AddChecklist) {
    return {
      ...checklist,
      id: this.generateSlug(checklist.title),
    };
  }

  private generateSlug(title: string) {
    // NOTE: This is a simplistic slug generator and will not handle things like special characters.
    let slug = title.toLowerCase().replace(/\s+/g, '-');

    // Check if the slug already exists
    const matchingSlugs = this.checklists().find(
      (checklist) => checklist.id === slug
    );

    // If the title is already being used, add a string to make the slug unique
    if (matchingSlugs) {
      slug = slug + Date.now().toString();
    }

    return slug;
  }
}
