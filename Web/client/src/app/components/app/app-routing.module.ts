import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthentificationPageComponent } from '../authentification-page/authentification-page.component';
import { HomeComponent } from '../home/home.component';
import { SeparateWindowComponent } from '../separate-window/separate-window.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { WorkingAreaComponent } from '../working-area/working-area.component';

const routes: Routes = [
    { path: 'dessin', component: WorkingAreaComponent },
    { path: '', component: AuthentificationPageComponent },
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'chat', component: SeparateWindowComponent },
];

const secondaryRoutes: Routes = [];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true }), RouterModule.forChild(secondaryRoutes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
// tslint:disable-next-line: variable-name | Reason : a component name starts with capital
export const RoutingComponents = [WorkingAreaComponent];
