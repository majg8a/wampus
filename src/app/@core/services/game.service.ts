import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Parameters } from '../models/parameters';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  parameters: Parameters | null = null;
  table$ = new BehaviorSubject<any>(null);
  hunterTable$ = new BehaviorSubject<any>(null);
  hunter$ = new BehaviorSubject<any>(null);

  constructor() {}

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

    // hunterTable[hunterTable.length - 1][0] = {
    //   arrows: parameters.arrows,
    //   ailments: [],
    //   position: { y: hunterTable.length - 1, x: 0 },
    //   name: 'hunter',
    //   direction: 'right',
    // };
    table[table.length - 1][0] = 'entry';
    hunterTable[hunterTable.length - 1][0] = ['safety'];

    [...Array(parameters.wells)].forEach(() => {
      const position = this.searchIndex(hunterTable, 'well');
      // hunterTable[position.y][position.x] =
      //   typeof hunterTable[position.y][position.x] !== 'string'
      //     ? [...hunterTable[position.y][position.x], 'death']
      //     : ['death'];

      console.log(position);

      this.set(hunterTable, position, ['death']);

      const left = { ...position, x: position.x - 1 };
      const right = { ...position, x: position.x + 1 };
      const top = { ...position, y: position.y + 1 };
      const bottom = { ...position, y: position.y - 1 };

      // this.set(
      //   hunterTable,
      //   left,
      //   !this.get(hunterTable, left) ||
      //     typeof this.get(hunterTable, left) === 'string'
      //     ? ['wind']
      //     : [...this.get(hunterTable, left), 'wind'].filter(
      //         (value, index, self) => self.indexOf(value) === index
      //       )
      // );

      this.setAilment(hunterTable, left, 'wind');
      this.setAilment(hunterTable, right, 'wind');
      this.setAilment(hunterTable, top, 'wind');
      this.setAilment(hunterTable, bottom, 'wind');
    });

    const wampus = this.searchIndex(hunterTable, 'wampus');


    this.hunterTable$.next(hunterTable);
    this.table$.next(table);
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
    return table[y] && table[y][x] ? table[y][x] : null;
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
}
