import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit{

    constructor(
        private titleService: Title
    ) {}

    ngOnInit(): void {
        this.titleService.setTitle('Portal de Monitoreo | Comisiónes');
    }
}
