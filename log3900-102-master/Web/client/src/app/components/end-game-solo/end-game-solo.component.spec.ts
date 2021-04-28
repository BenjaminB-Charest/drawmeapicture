import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndGameSoloComponent } from './end-game-solo.component';

describe('EndGameSoloComponent', () => {
  let component: EndGameSoloComponent;
  let fixture: ComponentFixture<EndGameSoloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndGameSoloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndGameSoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
