// src/app/pages/rotas-list/rotas-list.component.ts

import { Component, OnInit }            from '@angular/core';
import { Router, RouterModule }         from '@angular/router';
import { CommonModule }                 from '@angular/common';
import { ToastrService }                from 'ngx-toastr';

import { RotasService }                 from '../../services/rotas.service';
import { FooterComponent }              from '../../components/footer/footer.component';

@Component({
  selector: 'app-rotas-list',
  standalone: true,
  imports: [CommonModule, FooterComponent, RouterModule],
  templateUrl: './rotas-list.component.html',
  styleUrls: ['./rotas-list.component.scss'],
})
export class RotasListComponent implements OnInit {
  rotas: any[] = [];
  loading = false;

  constructor(
    private rotasService: RotasService,
    private router: Router,
    private toastr: ToastrService           // ← injeta ToastrService
  ) {}

  ngOnInit() {
    this.carregarRotas();
  }

  carregarRotas() {
    this.loading = true;
    this.rotasService.listarTodas().subscribe({
      next: (data) => {
        this.rotas = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Erro ao carregar rotas.', 'Erro');
      },
    });
  }

  excluir(id: number) {
    if (confirm('Deseja realmente excluir esta rota?')) {
      this.rotasService.excluir(id).subscribe({
        next: () => {
          this.toastr.success('Rota excluída com sucesso!', 'Sucesso');
          this.carregarRotas();
        },
        error: () => {
          this.toastr.error('Erro ao excluir rota.', 'Erro');
        }
      });
    }
  }

  editar(id: number) {
    this.router.navigate(['/rotas/editar', id]);
  }

  adicionar() {
    this.router.navigate(['/rotas/novo']);
  }
}
