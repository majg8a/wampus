import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ParameterEntryComponent } from './pages/parameter-entry/parameter-entry.component';
import { GameComponent } from './pages/game/game.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AnyPipe } from './pipes/any.pipe';

@NgModule({
  declarations: [AppComponent, ParameterEntryComponent, GameComponent, AnyPipe],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
