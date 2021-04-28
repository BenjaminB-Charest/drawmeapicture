import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewLobbyComponent } from './create-new-lobby.component';

describe('CreateNewLobbyComponent', () => {
  let component: CreateNewLobbyComponent;
  let fixture: ComponentFixture<CreateNewLobbyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewLobbyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
