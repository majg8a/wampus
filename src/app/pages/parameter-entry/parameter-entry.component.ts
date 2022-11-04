import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { GameService } from 'src/app/@core/services/game.service';

@Component({
  selector: 'app-parameter-entry',
  template: `
    <ng-container *ngIf="{ form: form$ | async } as state">
      <form
        [formGroup]="state.form | any"
        (ngSubmit)="handleSubmit(state.form)"
      >
        <label for="cells">Celdas</label>
        <input
          type="number"
          placeholder="Celdas"
          formControlName="cells"
          id="cells"
        />
        <label for="wells">Pozos</label>
        <input
          type="number"
          placeholder="Pozos"
          formControlName="wells"
          id="wells"
        />
        <label for="arrows">Flechas</label>
        <input
          type="number"
          placeholder="Flechas"
          formControlName="arrows"
          id="arrows"
        />
        <button [disabled]="state.form?.invalid" type="submit">jugar</button>
      </form>
      <app-game></app-game>
    </ng-container>
  `,
  styles: [],
})
export class ParameterEntryComponent {
  // Se debe parametrizar el número de celdas del tablero, el número de pozos y
  // cuantas flechas dispone el cazador.

  forbbidenWellsNumber: ValidatorFn = (control: AbstractControl) => {
    const cells = control.value?.cells;
    const wells = control.value?.wells;
    console.log(wells > cells - 3);

    return wells > cells - 3 ? { forbbidenWellsNumber: true } : null;
  };

  forbbidenCells = (control: AbstractControl) => {
    const cells = control.value;
    try {
      [...Array(Math.sqrt(cells))];
      return null;
    } catch (error) {
      return { forbbidenCells: true };
    }
  };

  form$ = this.handleCreateForm().pipe(
    map((form) => {
      const parameters = this.gameService.parameters;
      if (parameters) {
        form.patchValue(parameters);
      }
      return form as FormGroup;
    })
  ) as Observable<FormGroup>;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private gameService: GameService
  ) {}

  handleSubmit(form: FormGroup | null) {
    const formValues = form?.value;
    this.gameService.handleNewGame(formValues);
  }

  handleCreateForm() {
    return of(
      new FormGroup(
        {
          cells: new FormControl(16, [
            Validators.min(4),
            Validators.required,
            this.forbbidenCells,
          ]),
          wells: new FormControl(3, [Validators.min(0), Validators.required]),
          arrows: new FormControl(10, [Validators.min(0), Validators.required]),
        },
        [this.forbbidenWellsNumber]
      )
    );
  }
}
