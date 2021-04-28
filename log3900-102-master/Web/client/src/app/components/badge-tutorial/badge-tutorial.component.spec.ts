import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeTutorialComponent } from './badge-tutorial.component';

describe('BadgeTutorialComponent', () => {
  let component: BadgeTutorialComponent;
  let fixture: ComponentFixture<BadgeTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
