import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  first,
  map,
  of,
  Subscription,
  take,
  tap,
} from 'rxjs';
import { Parameters } from 'src/app/@core/models/parameters';
import { GameService } from 'src/app/@core/services/game.service';

@Component({
  selector: 'app-game',
  template: `
    <ng-container
      *ngIf="{
        table: table$ | async,
        hunterTable: hunterTable$ | async
      } as state"
    >
      <div
        class="relative grid content-center justify-center w-screen h-screen"
      >
        <div class="border-2 border-black overflow-hidden">
          <div class="flex " *ngFor="let row of state.table">
            <div
              *ngFor="let col of row"
              class="w-20 h-20 border-2 border-black"
            >
              {{ col }}
            </div>
          </div>
        </div>

        <div class="absolute self-center justify-self-center">
          <div *ngFor="let row of state.hunterTable" class="flex">
            <div *ngFor="let col of row" class="w-20 h-20">
              {{ col }}
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class GameComponent {
  table$ = this.gameService.table$;
  // table$ = of(this.gameService.parameters).pipe(
  //   map((parameters: Parameters | any) => {
  //     let wells = parameters?.wells;
  //     let oneDimentionalTable = [...Array(parameters.cells)]
  //       .map((o, i) => {
  //         switch (true) {
  //           case i < wells:
  //             return 'well';
  //           case i === wells:
  //             return 'gold';
  //           case i === wells + 1:
  //             return 'wampus';
  //           default:
  //             return null;
  //         }
  //       })
  //       .map((value) => ({ value, sort: Math.random() }))
  //       .sort((a, b) => a.sort - b.sort)
  //       .map(({ value }) => value);
  //     const sqrt = Math.sqrt(parameters.cells);
  //     const table = oneDimentionalTable.reduce((total: any[][], current, i) => {
  //       if (i % sqrt === 0) {
  //         total.push([]);
  //       }
  //       const totalRows = total.length - 1;
  //       total[totalRows].push(current);
  //       return total;
  //     }, []);

  //     return table;
  //   })
  // );

  hunterTable$ = new BehaviorSubject<any>(null);
  // hunterTable$ = this.table$.pipe(
  //   map((table) => {
  //     const newTable = [...table].map((a) => [...a]);
  //     newTable[table.length - 1][0] = {
  //       arrows: this.gameService.parameters?.arrows,

  //     };
  //     return newTable;
  //   })
  // );
  constructor(private gameService: GameService) {}
}
