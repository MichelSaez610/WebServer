import { Routes } from '@angular/router';
import { AfegirClientComponent } from '../componentes/afegir-client/afegir-client.component';
import { EliminarClientComponent } from '../componentes/eliminar-client/eliminar-client.component';
import { AfegirSaldoComponent } from '../componentes/afegir-saldo/afegir-saldo.component';
import path from 'path';
import { UsuarisComponent } from '../componentes/usuaris/usuaris.component';


export const routes: Routes = [
  {path: '', redirectTo: '/AfegirClient', pathMatch: 'full'},
  {path: 'AfegirClient', component:AfegirClientComponent},
  {path: 'EliminarClient', component:EliminarClientComponent},
  {path: 'UpdateSaldo', component:AfegirSaldoComponent},
  {path: 'Usuaris', component:UsuarisComponent}
];
