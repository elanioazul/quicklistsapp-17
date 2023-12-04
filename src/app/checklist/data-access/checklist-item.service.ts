import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';
import { Subject, map, merge, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import { StorageService } from '../../shared/data-access/storage.service';
import { connect } from 'ngxtension/connect';
export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  storageService = inject(StorageService);
  private checklistsItemsLoaded$ = this.storageService.loadChecklistItems();
  //state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  //selectors
  checklistItems = computed(() => this.state().checklistItems);
  loaded = computed(() => this.state().loaded);

  //sources
  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  eddit$ = new Subject<EditChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();

  checklistRemoved$ = new Subject<RemoveChecklist>();

  constructor() {
    //reducers
    const nextState$ = merge(
      this.checklistsItemsLoaded$.pipe(
        map((checklistItems) => ({
          checklistItems,
          loaded: true,
        }))
      )
    );

    connect(this.state)
      .with(nextState$)
      .with(this.add$, (state, checklistItem) => ({
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
      .with(this.toggle$, (state, checklistItemId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? { ...item, checked: false } : item
        ),
      }))
      .with(this.eddit$, (state, update) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, title: update.data.title } : item
        ),
      }))
      .with(this.remove$, (state, removed) => ({
        checklistItems: state.checklistItems.filter(
          (item) => item.id !== removed
        ),
      }))
      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }));

    // this.add$.pipe(takeUntilDestroyed()).subscribe((checklistItem) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: [
    //       ...state.checklistItems,
    //       {
    //         ...checklistItem.item,
    //         id: Date.now().toString(),
    //         checklistId: checklistItem.checklistId,
    //         checked: false,
    //       },
    //     ],
    //   }))
    // );

    // this.toggle$.pipe(takeUntilDestroyed()).subscribe((checklistItemId) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: state.checklistItems.map((item) =>
    //       item.id === checklistItemId
    //         ? { ...item, checked: !item.checked }
    //         : item
    //     ),
    //   }))
    // );

    // this.reset$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: state.checklistItems.map((item) =>
    //       item.checklistId === checklistId ? { ...item, checked: false } : item
    //     ),
    //   }))
    // );

    // this.eddit$.pipe(takeUntilDestroyed()).subscribe((update) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: state.checklistItems.map((item) =>
    //       item.id === update.id ? { ...item, title: update.data.title } : item
    //     ),
    //   }))
    // );

    // this.remove$.pipe(takeUntilDestroyed()).subscribe((removed) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: state.checklistItems.filter(
    //       (item) => item.id !== removed
    //     ),
    //   }))
    // );

    // this.checklistRemoved$.pipe(takeUntilDestroyed()).subscribe((checklistId) =>
    //   this.state.update((state) => ({
    //     ...state,
    //     checklistItems: state.checklistItems.filter(
    //       (item) => item.checklistId !== checklistId
    //     ),
    //   }))
    // );

    // this.checklistsItemsLoaded$
    //   .pipe(takeUntilDestroyed())
    //   .subscribe((checklistItems) =>
    //     this.state.update((state) => ({
    //       ...state,
    //       checklistItems,
    //       loaded: true,
    //     }))
    //   );

    //efects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
