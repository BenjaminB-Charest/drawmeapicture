import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparateRemoveChannelComponent } from './separate-remove-channel.component';

describe('SeparateRemoveChannelComponent', () => {
  let component: SeparateRemoveChannelComponent;
  let fixture: ComponentFixture<SeparateRemoveChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeparateRemoveChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparateRemoveChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
