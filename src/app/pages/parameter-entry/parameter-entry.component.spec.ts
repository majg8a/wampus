import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterEntryComponent } from './parameter-entry.component';

describe('ParameterEntryComponent', () => {
  let component: ParameterEntryComponent;
  let fixture: ComponentFixture<ParameterEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
