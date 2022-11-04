import { Injectable } from '@angular/core';
import { table } from 'console';
import {
  BehaviorSubject,
  combineLatest,
  debounce,
  debounceTime,
  distinctUntilChanged,
  interval,
  map,
  pairwise,
  skipWhile,
  startWith,
  switchMap,
} from 'rxjs';
import { Parameters } from '../models/parameters';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  parameters: Parameters | null = null;
  arrows = 0;
  hunterPosition: { x: number; y: number } | null = null;
  initialTable$ = new BehaviorSubject<any>(null);
  table$ = this.initialTable$.pipe(skipWhile((a) => a));
  hunterTable$ = new BehaviorSubject<any>(null);
  direction$ = new BehaviorSubject<any>(null);
  // initialHunter$ = this.hunterTable$.pipe(
  //   skipWhile((a) => a),
  //   map((table: any[][]) => {
  //     this.hunterPosition = { y: table?.length - 1, x: 0 };
  //     return {
  //       direction: 'right',
  //       arrows: this.parameters?.arrows,
  //       position: this.hunterPosition,
  //     };
  //   })
  // );
  initialHunter$ = new BehaviorSubject<any>(null);

  hunter$ = combineLatest([
    this.direction$.pipe(pairwise()),
    this.initialHunter$.pipe(
      distinctUntilChanged(
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
      )
    ),
    this.hunterTable$,
    this.table$,
  ]).pipe(
    map(([directions, hunter, hunterTable, table]) => {
      this.hunterPosition = this.changePosition(
        table,
        directions[1],
        this.hunterPosition
      );
      return {
        ...hunter,
        direction: directions[1],
        position: this.hunterPosition,
        arrows: this.shootArrow(directions),
      };
    })
  );

  arrowsShooted: any[] = [];

  arrows$ = combineLatest([
    interval(500),
    this.initialTable$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ),
    this.direction$,
  ]).pipe(
    map(([, table]) => {
      this.arrowsShooted = this.arrowsShooted
        .map((arrowShooted) => {
          let position = this.changePosition(table, arrowShooted.direction, {
            ...arrowShooted.position,
          });
          if (this.get(table, position) === 'wampus') {
            this.initialTable$.next(this.set(table, position, 'death wampus'));
          }
          return {
            ...arrowShooted,
            position:
              this.get(table, position) === undefined
                ? position
                : arrowShooted.position,
          };
        })
        .filter((a) => this.get(table, a.position) === undefined);
    })
  );

  constructor() {}

  shootArrow(directions: any[]) {
    let arrows = this.arrows;
    const oldArrows = this.arrows;
    const [oldDirection, newDirection] = directions;
    console.log(oldDirection, newDirection);

    if (!arrows) {
      return 0;
    }
    switch (true) {
      case newDirection === 'right' &&
        (oldDirection === 'up' || oldDirection === 'down'):
        arrows = arrows - 1;
        break;
      case newDirection === 'left' &&
        (oldDirection === 'up' || oldDirection === 'down'):
        arrows = arrows - 1;
        break;
      case newDirection === 'up' &&
        (oldDirection === 'left' || oldDirection === 'right'):
        arrows = arrows - 1;
        break;
      case newDirection === 'down' &&
        (oldDirection === 'left' || oldDirection === 'right'):
        arrows = arrows - 1;
        break;
    }
    if (arrows < oldArrows) {
      this.arrowsShooted.push({ position: this.hunterPosition, newDirection });
      this.arrows = arrows;
    }
    return this.arrows;
  }

  handleNewGame(parameters: Parameters) {
    this.parameters = parameters;
    this.arrows = parameters.arrows;
    let wells = parameters?.wells;
    let oneDimentionalTable = [...Array(parameters.cells)]
      .map((o, i) => {
        switch (true) {
          case i < wells:
            return 'well';
          case i === wells:
            return 'gold';
          case i === wells + 1:
            return 'wampus';
          default:
            return null;
        }
      })
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    const sqrt = Math.sqrt(parameters.cells);
    const table = oneDimentionalTable.reduce((total: any[][], current, i) => {
      if (i % sqrt === 0) {
        total.push([]);
      }
      const totalRows = total.length - 1;
      total[totalRows].push(current);
      return total;
    }, []);

    const hunterTable = [...table.map((row) => [...row])];
    const home = hunterTable[hunterTable.length - 1][0];
    const isHomeNull = Boolean(home);

    if (isHomeNull) {
      const nullIndexes = this.searchIndex(table, null);
      hunterTable[nullIndexes.y][nullIndexes.y] = home;
      table[nullIndexes.y][nullIndexes.y] = home;
    }

    table[table.length - 1][0] = 'entry';
    hunterTable[hunterTable.length - 1][0] = ['safety'];

    [...Array(parameters.wells)].forEach(() => {
      const well = this.searchIndex(hunterTable, 'well');
      this.setAilment(hunterTable, well, 'death');
      this.setAilments(hunterTable, well, 'wind');
    });

    const wampus = this.searchIndex(hunterTable, 'wampus');
    this.setAilment(hunterTable, wampus, 'death');
    this.setAilments(hunterTable, wampus, 'smell');

    const gold = this.searchIndex(hunterTable, 'gold');
    this.setAilment(hunterTable, gold, 'shine');

    this.hunterPosition = { y: table?.length - 1, x: 0 };

    const hunter = {
      arrows: parameters.arrows,
      position: this.hunterPosition,
      direction: 'right',
    };

    this.initialHunter$.next(hunter);
    this.direction$.next(null);
    this.hunterTable$.next(hunterTable);
    this.initialTable$.next(table);
  }

  searchIndex(table: any[][], value: any) {
    return table.reduce((total: any, current: any[], index, self) => {
      if (!self[total.y ? total.y : 0][total.x]) {
        total.y = index;
        total.x = current.findIndex((cell) => value === cell);
      }
      return total;
    }, {});
  }

  get(table: any[][], { x, y }: { x: number; y: number }) {
    if (!table || table[y] === undefined || !table[y][x] === undefined) {
      return undefined;
    }
    return table[y][x];
  }

  set(table: any[][], { x, y }: { x: number; y: number }, value: any) {
    if (table[y] === undefined || table[y][x] === undefined) {
      return;
    }
    table[y][x] = value;
  }

  setAilment(table: any, position: any, ailment: string) {
    this.set(
      table,
      position,
      !this.get(table, position) ||
        typeof this.get(table, position) === 'string'
        ? [ailment]
        : [...this.get(table, position), ailment].filter(
            (value, index, self) => self.indexOf(value) === index
          )
    );
  }

  setAilments(table: any[][], position: any, ailment: string) {
    const left = { ...position, x: position.x - 1 };
    const right = { ...position, x: position.x + 1 };
    const up = { ...position, y: position.y - 1 };
    const down = { ...position, y: position.y + 1 };

    this.setAilment(table, left, ailment);
    this.setAilment(table, right, ailment);
    this.setAilment(table, up, ailment);
    this.setAilment(table, down, ailment);
  }

  changePosition(table: any[][], direction: any, position: any) {
    let newPosition = position;
    switch (direction) {
      case 'right':
        newPosition = { ...position, x: position.x + 1 };
        break;
      case 'left':
        newPosition = { ...position, x: position.x - 1 };
        break;
      case 'up':
        newPosition = { ...position, y: position.y - 1 };
        break;
      case 'down':
        newPosition = { ...position, y: position.y + 1 };
        break;
      case null:
        newPosition = position;
        break;
    }
    return this.get(table, newPosition) === undefined ? position : newPosition;
  }
}
