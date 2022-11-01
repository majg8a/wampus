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

    this.table$.next(table);

    const hunterTable = [...table.map((row) => [...row])];

    this.hunterTable$.next(hunterTable);
  }
}
