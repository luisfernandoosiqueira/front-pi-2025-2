// src/app/pages/cadastro-bairro/cadastro-bairro.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService }     from 'ngx-toastr';

import { FooterComponent }                from '../../components/footer/footer.component';
import { Bairro, BairroService, RuaConexao } from '../../services/bairro.service';

@Component({
  selector: 'app-cadastro-bairro',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, RouterModule],
  templateUrl: './cadastro-bairro.component.html',
  styleUrls: ['./cadastro-bairro.component.scss']
})
export class CadastroBairroComponent implements OnInit {
  bairroId: number | null = null;
  nomeBairro: string = '';
  conexoes: RuaConexao[] = [];

  constructor(
    private bairroService: BairroService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService       // ← injeta ToastrService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bairroId = +id;
      this.bairroService.buscarPorId(this.bairroId).subscribe({
        next: (bairro: Bairro) => {
          this.nomeBairro = bairro.nomeBairro;
        },
        error: (err: any) => {
          console.error('Erro ao buscar bairro:', err);
          this.toastr.error('Bairro não encontrado.', 'Erro');
          this.router.navigate(['/bairros']);
        }
      });
      this.loadConexoes();
    }
  }

  loadConexoes() {
    if (!this.bairroId) return;

    this.bairroService.listarConexoesPorBairro(this.bairroId).subscribe({
      next: (conexoes: RuaConexao[]) => {
        this.conexoes = conexoes;
      },
      error: (err: any) => {
        console.error('Erro ao buscar conexões:', err);
        this.toastr.error('Erro ao carregar conexões.', 'Erro');
      }
    });
  }

  get isFormValid(): boolean {
    return this.nomeBairro.trim() !== '';
  }

  onSubmit() {
    if (!this.isFormValid) {
      this.toastr.warning('Por favor, preencha o nome do bairro.', 'Atenção');
      return;
    }
    if (this.bairroId !== null) {
      const bairro: Bairro = { id: this.bairroId, nomeBairro: this.nomeBairro };
      this.bairroService.salvar(bairro).subscribe({
        next: () => {
          this.toastr.success('Bairro salvo com sucesso!', 'Sucesso');
          this.router.navigate(['/bairros']);
        },
        error: (err: any) => {
          console.error('Erro ao salvar bairro:', err);
          this.toastr.error('Erro ao salvar o bairro.', 'Erro');
        }
      });
    }
  }

  excluirConexao(conexaoId: number) {
    if (confirm('Tem certeza que deseja excluir esta conexão?')) {
      this.bairroService.excluirConexao(conexaoId).subscribe({
        next: () => {
          this.toastr.success('Conexão excluída com sucesso!', 'Sucesso');
          this.loadConexoes();
        },
        error: (err: any) => {
          console.error('Erro ao excluir conexão:', err);
          this.toastr.error('Erro ao excluir a conexão.', 'Erro');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/bairros']);
  }
}
