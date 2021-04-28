import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { IgxCardModule, IgxCarouselModule, IgxIconModule } from 'igniteui-angular';
import { GameLobbyChatComponent } from 'src/app/components/game-lobby-chat/game-lobby-chat.component';
import { environment } from '../environments/environment';
import { AddChannelAreYouSureComponent } from './components/add-channel-are-you-sure/add-channel-are-you-sure.component';
import { AddChannelComponent } from './components/add-channel/add-channel.component';
import { AppRoutingModule, RoutingComponents } from './components/app/app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AuthentificationPageComponent } from './components/authentification-page/authentification-page.component';
import { AvatarSelectionComponent } from './components/avatar-selection/avatar-selection.component';
import { BadgeSelectionComponent } from './components/badge-selection/badge-selection.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { ChannelPanelComponent } from './components/channel-panel/channel-panel.component';
import { ChatPanelComponent } from './components/chat-panel/chat-panel.component';
import { ClassicModeDecisionComponent } from './components/classic-mode-decision/classic-mode-decision.component';
import { ClassicTutorialComponent } from './components/classic-tutorial/classic-tutorial.component';
import { ColorPaletteComponent } from './components/color-palette/color-palette.component';
import { ColorPanelComponent } from './components/color-panel/color-panel.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { ColorSliderComponent } from './components/color-slider/color-slider.component';
import { CreateNewLobbyComponent } from './components/create-new-lobby/create-new-lobby.component';
import { CreateNewComponent } from './components/create-new/create-new.component';
import { EndGameDialogComponent } from './components/end-game-dialog/end-game-dialog.component';
import { EraserComponent } from './components/eraser/eraser.component';
import { ExportComponent } from './components/export/export.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { GameLobbyComponent } from './components/game-lobby/game-lobby.component';
import { GridComponent } from './components/grid/grid.component';
import { HomeComponent } from './components/home/home.component';
import { JoinLobbyGameModeComponent } from './components/join-lobby-game-mode/join-lobby-game-mode.component';
import { JoinLobbyComponent } from './components/join-lobby/join-lobby.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LogInComponent } from './components/log-in-component/log-in-component.component';
import { OptionPannelComponent } from './components/option-pannel/option-pannel.component';
import { PencilComponent } from './components/pencil/pencil.component';
import { RemoveChannelComponent } from './components/remove-channel/remove-channel.component';
import { ErrorOnSaveComponent } from './components/save-server/error-on-save/error-on-save.component';
import { SaveServerComponent } from './components/save-server/save-server.component';
import { SeparateChatComponent } from './components/separate-chat/separate-chat.component';
import { SeparateWindowComponent } from './components/separate-window/separate-window.component';
import { ShopDecisionComponent } from './components/shop-decision/shop-decision.component';
import { ShopComponent } from './components/shop/shop.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SignUpComponent } from './components/sign-up-component/sign-up.component';
import { SoloTutorialComponent } from './components/solo-tutorial/solo-tutorial.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { WaitingDialogComponent } from './components/waiting-dialog/waiting-dialog.component';
import { WarningDialogComponent } from './components/warning/warning-dialog.component';
import { WordChoiceComponent } from './components/word-choice/word-choice.component';
import { WordImagePairDecisionComponent } from './components/word-image-pair-decision/word-image-pair-decision.component';
import { WordImagePairInfoComponent } from './components/word-image-pair-info/word-image-pair-info.component';
import { WordImagePairTutorialComponent } from './components/word-image-pair-tutorial/word-image-pair-tutorial.component';
import { WordImagePairComponent } from './components/word-image-pair/word-image-pair.component';
import { WorkingAreaComponent } from './components/working-area/working-area.component';
import { ResizeObserverDirective } from './components/workspace/resize-observer.directive';
import { WorkspaceComponent } from './components/workspace/workspace.component';
import { AngularMaterialModule } from './modules/angular-material.module';
import { DrawablePropertiesService } from './services/drawable/properties/drawable-properties.service';
import { BadgeEarnedComponent } from './components/badge-earned/badge-earned.component';
import { SeparateAddChannelComponent } from './components/separate-add-channel/separate-add-channel.component';
import { SeparateAddChannelAreYouSureComponent } from './components/separate-add-channel-are-you-sure/separate-add-channel-are-you-sure.component';
import { SeparateRemoveChannelComponent } from './components/separate-remove-channel/separate-remove-channel.component';
import { BadgeTutorialComponent } from './components/badge-tutorial/badge-tutorial.component';
import { EndGameSoloComponent } from './components/end-game-solo/end-game-solo.component';
@NgModule({
    declarations: [
        AppComponent,
        CanvasComponent,
        EraserComponent,
        OptionPannelComponent,
        SidebarComponent,
        WorkspaceComponent,
        PencilComponent,
        HomeComponent,
        CreateNewComponent,
        WorkingAreaComponent,
        ColorPanelComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorSliderComponent,
        RoutingComponents,
        ResizeObserverDirective,
        WarningDialogComponent,
        ExportComponent,
        EraserComponent,
        GridComponent,
        ExportComponent,
        SaveServerComponent,
        ErrorOnSaveComponent,
        ChannelPanelComponent,
        ChatPanelComponent,
        SignUpComponent,
        LogInComponent,
        AuthentificationPageComponent,
        GameInfoComponent,
        WaitingDialogComponent,
        EndGameDialogComponent,
        UserProfileComponent,
        AvatarSelectionComponent,
        BadgeSelectionComponent,
        GameLobbyComponent,
        GameLobbyChatComponent,
        CreateNewLobbyComponent,
        JoinLobbyComponent,
        JoinLobbyGameModeComponent,
        WordImagePairComponent,
        WordImagePairInfoComponent,
        WordImagePairDecisionComponent,
        TutorialComponent,
        ClassicTutorialComponent,
        SoloTutorialComponent,
        WordImagePairTutorialComponent,
        WordChoiceComponent,
        ShopComponent,
        ShopDecisionComponent,
        AddChannelComponent,
        RemoveChannelComponent,
        AddChannelAreYouSureComponent,
        LeaderboardComponent,
        ClassicModeDecisionComponent,
        SeparateWindowComponent,
        SeparateChatComponent,
        BadgeEarnedComponent,
        SeparateAddChannelComponent,
        SeparateAddChannelAreYouSureComponent,
        SeparateRemoveChannelComponent,
        BadgeTutorialComponent,
        EndGameSoloComponent,
    ],
    entryComponents: [ColorPickerComponent, CreateNewComponent, SaveServerComponent, ErrorOnSaveComponent, WarningDialogComponent, ExportComponent],
    imports: [
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireFunctionsModule,
        AngularFirestoreModule,
        BrowserAnimationsModule,
        AngularMaterialModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSliderModule,
        AppRoutingModule,
        MatListModule,
        MatExpansionModule,
        RouterModule,
        ReactiveFormsModule,
        IgxCarouselModule,
        IgxIconModule,
        IgxCardModule,
        MatRippleModule,
    ],
    providers: [DrawablePropertiesService],
    bootstrap: [AppComponent],
})
export class AppModule {}
