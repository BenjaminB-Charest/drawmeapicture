import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparateWindowComponent } from './separate-window.component';

describe('SeparateWindowComponent', () => {
  let component: SeparateWindowComponent;
  let fixture: ComponentFixture<SeparateWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeparateWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparateWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
