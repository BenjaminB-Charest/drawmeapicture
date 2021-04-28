import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicModeDecisionComponent } from './classic-mode-decision.component';

describe('ClassicModeDecisionComponent', () => {
  let component: ClassicModeDecisionComponent;
  let fixture: ComponentFixture<ClassicModeDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassicModeDecisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassicModeDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
