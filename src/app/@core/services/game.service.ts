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
  startWith,
  switchMap,
} from 'rxjs';
import { Parameters } from '../models/parameters';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  parameters: Parameters | null = null;
  initialTable$ = new BehaviorSubject<any>(null);
  hunterTable$ = new BehaviorSubject<any>(null);
  direction$ = new BehaviorSubject<any>('top');
  initialHunter$ = this.hunterTable$.pipe(
    map((table) => ({
      direction: 'right',
      arrows: this.parameters?.arrows,
      position: { y: table?.length - 1, x: 0 },
    }))
  );

  hunter$ = combineLatest([
    this.direction$,
    this.initialHunter$,
    this.hunterTable$,
    this.initialTable$,
  ]).pipe(
    // debounceTime(500),
    map(([direction, hunter, hunterTable, table]) => ({
      ...hunter,
      direction,
      position: this.changePosition(table, direction, hunter.position),
      arrows: this.shootArrow(hunter, direction),
    }))
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
      this.arrowsShooted
        .map((arrowShooted) => {
          let position = this.changePosition(table, arrowShooted.direction, {
            ...arrowShooted.position,
          });

          if (this.get(table, position) === 'wampus') {
            this.initialTable$.next(this.set(table, position, 'death'));
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

  shootArrow(hunter: any, direction: any) {
    let arrows = hunter?.arrows;

    switch (true) {
      case direction === 'right' &&
        (hunter?.direction === 'top' || hunter?.direction === 'bottom'):
        arrows = arrows - 1;
        break;
      case direction === 'left' &&
        (hunter?.direction === 'top' || hunter?.direction === 'bottom'):
        arrows = arrows - 1;
        break;
      case direction === 'top' &&
        (hunter?.direction === 'left' || hunter?.direction === 'right'):
        arrows = arrows - 1;
        break;
      case direction === 'bottom' &&
        (hunter?.direction === 'left' || hunter?.direction === 'right'):
        arrows = arrows - 1;
        break;
    }
    this.arrowsShooted.push({ position: hunter.position, direction });
    return arrows;
  }

  handleNewGame(parameters: Parameters) {
    this.parameters = parameters;
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
    table = table ? table : [[]];
    return table[y] && table[y][x] ? table[y][x] : undefined;
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
    const top = { ...position, y: position.y - 1 };
    const bottom = { ...position, y: position.y + 1 };

    this.setAilment(table, left, ailment);
    this.setAilment(table, right, ailment);
    this.setAilment(table, top, ailment);
    this.setAilment(table, bottom, ailment);
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
      case 'top':
        newPosition = { ...position, y: position.y - 1 };
        break;
      case 'bottom':
        newPosition = { ...position, y: position.y + 1 };
        break;
    }
    return this.get(table, newPosition) === undefined ? position : newPosition;
  }
}
