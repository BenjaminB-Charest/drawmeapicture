import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparateChatComponent } from './separate-chat.component';

describe('SeparateChatComponent', () => {
  let component: SeparateChatComponent;
  let fixture: ComponentFixture<SeparateChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeparateChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeparateChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
