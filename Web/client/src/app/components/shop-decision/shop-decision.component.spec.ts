import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopDecisionComponent } from './shop-decision.component';

describe('ShopDecisionComponent', () => {
  let component: ShopDecisionComponent;
  let fixture: ComponentFixture<ShopDecisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopDecisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
