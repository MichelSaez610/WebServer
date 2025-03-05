import { Routes } from '@angular/router';
import { UpdateClientComponent } from '../componentes/update-client/update-client.component';
import { EliminarClientComponent } from '../componentes/eliminar-client/eliminar-client.component';
import { AfegirSaldoComponent } from '../componentes/afegir-saldo/afegir-saldo.component';
import { UsuarisComponent } from '../componentes/usuaris/usuaris.component';
import { LoginComponent } from '../componentes/login/login.component';


export const routes: Routes = [
  {path: '', redirectTo: '/Login', pathMatch: 'full'},
  {path: 'ActualitzarClient', component:UpdateClientComponent},
  {path: 'EliminarClient', component:EliminarClientComponent},
  {path: 'UpdateSaldo', component:AfegirSaldoComponent},
  {path: 'Usuaris', component:UsuarisComponent},
  {path: 'Login', component:LoginComponent}
];
