import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinLobbyGameModeComponent } from './join-lobby-game-mode.component';

describe('JoinLobbyGameModeComponent', () => {
  let component: JoinLobbyGameModeComponent;
  let fixture: ComponentFixture<JoinLobbyGameModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinLobbyGameModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinLobbyGameModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
