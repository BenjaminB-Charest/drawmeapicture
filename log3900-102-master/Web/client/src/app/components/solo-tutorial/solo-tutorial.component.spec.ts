import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloTutorialComponent } from './solo-tutorial.component';

describe('SoloTutorialComponent', () => {
  let component: SoloTutorialComponent;
  let fixture: ComponentFixture<SoloTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoloTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoloTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
