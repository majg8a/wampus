import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GameService } from 'src/app/@core/services/game.service';

@Component({
  selector: 'app-game',
  template: `
    <ng-container
      *ngIf="{
        table: table$ | async,
        hunterTable: hunterTable$ | async,
        hunter: hunter$ | async
      } as state"
    >
      <div class="relative grid content-center justify-center w-full h-full">
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
          <div *ngFor="let row of state.hunterTable; index as y" class="flex">
            <div *ngFor="let cell of row; index as x" class="w-20 h-20">
              <!-- {{ cell | json }} -->

              <ng-container
                *ngIf="
                  state.hunter?.position?.x === x &&
                  state.hunter?.position?.y === y
                "
              >
                <div class="w-full h-full bg-white">
                  hunter
                  <br />
                  {{ state.hunter?.direction }}
                  <br />
                  {{ state.hunter?.arrows }}
                </div>
                <!-- {{ state.hunter | json}} -->
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class GameComponent {
  table$ = this.gameService.initialTable$;

  hunterTable$ = this.gameService.hunterTable$;
  hunter$: Observable<any> = this.gameService.hunter$;
  direction$ = this.gameService.direction$;

  constructor(private gameService: GameService) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    console.log(event.key);
    const cases: any = {
      a: 'left',
      s: 'down',
      d: 'right',
      w: 'up',
      ArrowLeft: 'left',
      ArrowDown: 'down',
      ArrowRight: 'right',
      ArrowUp: 'up',
    };
    if (cases[event.key]) {
      this.direction$.next(cases[event.key]);
    }
  }
}
