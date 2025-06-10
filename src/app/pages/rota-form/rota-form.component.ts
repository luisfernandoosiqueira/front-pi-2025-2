// src/app/pages/rota-form/rota-form.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RotasService, Rota, Bairro } from '../../services/rotas.service';
import { BairroService } from '../../services/bairro.service';
import { Caminhao, CaminhaoService } from '../../services/caminhao.service';
import { TipoResiduoService } from '../../services/tipoResiduo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../components/footer/footer.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FooterComponent],
  templateUrl: './rota-form.component.html',
  styleUrls: ['./rota-form.component.scss']
})
export class RotaFormComponent implements OnInit {
  rota: Rota = {
    nome: '',
    tipoResiduo: '',
    origem: null,
    destino: null,
    pesoTotal: 0,
    caminhao: null,
  };

  bairrosOrigem: Bairro[] = [];
  bairrosDestino: Bairro[] = [];
  tiposResiduo: string[] = [];
  caminhoes: Caminhao[] = [];

  isOrigemDestinoEnabled = false;
  tipoResiduoSelecionado: string | null = null;

  idRota: number | null = null;

  constructor(
    private rotasService: RotasService,
    private bairroService: BairroService,
    private caminhaoService: CaminhaoService,
    private tipoResiduoService: TipoResiduoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService       // ← injeta ToastrService
  ) {}

  ngOnInit() {
    this.carregarTiposResiduo();
    this.carregarCaminhoes();

    this.idRota = this.route.snapshot.params['id'];
    if (this.idRota) {
      this.rotasService.buscarPorId(this.idRota).subscribe((data) => {
        this.rota = data;
        if (this.rota.tipoResiduo) {
          this.tipoResiduoSelecionado = this.rota.tipoResiduo;
          this.carregarBairros(this.tipoResiduoSelecionado);
          this.isOrigemDestinoEnabled = true;
        }
      });
    }
  }

  carregarTiposResiduo() {
    this.tipoResiduoService.listarTipos().subscribe((tipos) => {
      this.tiposResiduo = tipos;
    });
  }

  carregarCaminhoes() {
    this.caminhaoService.listarTodos().subscribe((lista) => {
      this.caminhoes = lista;
    });
  }

  onTipoResiduoChange() {
    if (this.rota.tipoResiduo) {
      this.tipoResiduoSelecionado = this.rota.tipoResiduo;
      this.carregarBairros(this.tipoResiduoSelecionado);
      this.isOrigemDestinoEnabled = true;
    } else {
      this.isOrigemDestinoEnabled = false;
      this.bairrosOrigem = [];
      this.bairrosDestino = [];
      this.rota.origem = null;
      this.rota.destino = null;
    }
  }

  carregarBairros(tipoResiduo: string) {
    this.bairroService.listarPorTipoResiduo(tipoResiduo).subscribe((bairros) => {
      this.bairrosOrigem = bairros;
      this.bairrosDestino = bairros;
    });
  }

  salvar() {
    if (
      !this.rota.origem ||
      !this.rota.destino ||
      !this.rota.tipoResiduo ||
      !this.rota.caminhao
    ) {
      this.toastr.warning('Preencha todos os campos obrigatórios!', 'Atenção');
      return;
    }

    this.rotasService
      .gerarRotaAutomatica(
        this.rota.origem.id,
        this.rota.destino.id,
        this.rota.tipoResiduo,
        this.rota.caminhao.placa
      )
      .subscribe({
        next: (novaRota) => {
          this.toastr.success('Rota criada automaticamente!', 'Sucesso');
          this.router.navigate(['/rotas']);
        },
        error: (error) => {
          this.toastr.error('Erro ao criar rota: ' + error.message, 'Erro');
        }
      });
  }
}
