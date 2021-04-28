import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparateAddChannelComponent } from './separate-add-channel.component';

describe('SeparateAddChannelComponent', () => {
  let component: SeparateAddChannelComponent;
  let fixture: ComponentFixture<SeparateAddChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeparateAddChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparateAddChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
