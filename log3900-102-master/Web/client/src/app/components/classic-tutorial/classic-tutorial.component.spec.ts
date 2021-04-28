import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassicTutorialComponent } from './classic-tutorial.component';

describe('ClassicTutorialComponent', () => {
  let component: ClassicTutorialComponent;
  let fixture: ComponentFixture<ClassicTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassicTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassicTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
