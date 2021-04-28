import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparateAddChannelAreYouSureComponent } from './separate-add-channel-are-you-sure.component';

describe('SeparateAddChannelAreYouSureComponent', () => {
  let component: SeparateAddChannelAreYouSureComponent;
  let fixture: ComponentFixture<SeparateAddChannelAreYouSureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeparateAddChannelAreYouSureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparateAddChannelAreYouSureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
