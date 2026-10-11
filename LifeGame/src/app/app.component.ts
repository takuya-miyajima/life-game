import { Component } from '@angular/core';
import { LifeGameComponent } from './life-game/life-game.component';

@Component({
  selector: 'app-root',
  imports: [LifeGameComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'LifeGame';
}
