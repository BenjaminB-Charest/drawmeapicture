import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChannelAreYouSureComponent } from './add-channel-are-you-sure.component';

describe('AddChannelAreYouSureComponent', () => {
  let component: AddChannelAreYouSureComponent;
  let fixture: ComponentFixture<AddChannelAreYouSureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChannelAreYouSureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChannelAreYouSureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
