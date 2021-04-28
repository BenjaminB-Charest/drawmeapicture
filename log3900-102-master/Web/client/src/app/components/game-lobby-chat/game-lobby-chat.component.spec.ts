import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLobbyChatComponent } from './game-lobby-chat.component';

describe('GameLobbyChatComponent', () => {
  let component: GameLobbyChatComponent;
  let fixture: ComponentFixture<GameLobbyChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameLobbyChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameLobbyChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
