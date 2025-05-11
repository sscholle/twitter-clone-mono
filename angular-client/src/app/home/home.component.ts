import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CardComponent } from '../components/card.component';

@Component({
  selector: 'components-home',
  imports: [RouterModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
