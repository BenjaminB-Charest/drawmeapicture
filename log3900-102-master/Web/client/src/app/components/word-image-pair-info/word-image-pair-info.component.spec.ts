import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordImagePairInfoComponent } from './word-image-pair-info.component';

describe('WordImagePairInfoComponent', () => {
  let component: WordImagePairInfoComponent;
  let fixture: ComponentFixture<WordImagePairInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordImagePairInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordImagePairInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
