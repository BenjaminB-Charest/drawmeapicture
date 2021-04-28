import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordImagePairTutorialComponent } from './word-image-pair-tutorial.component';

describe('WordImagePairTutorialComponent', () => {
  let component: WordImagePairTutorialComponent;
  let fixture: ComponentFixture<WordImagePairTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordImagePairTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordImagePairTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
