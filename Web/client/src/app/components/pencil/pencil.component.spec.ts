// tslint:disable: no-string-literal | Reason: used to access private variables
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import * as CONSTANT from 'src/app/classes/constants';
import { PencilService } from 'src/app/services/drawable/pencil/pencil.service';
import { DrawablePropertiesService } from 'src/app/services/drawable/properties/drawable-properties.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { PencilComponent } from './pencil.component';

describe('PencilComponent', () => {
  let component: PencilComponent;
  let fixture: ComponentFixture<PencilComponent>;
  let properties: DrawablePropertiesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PencilComponent ],
      providers: [
        PencilService,
        ToolSelectorService,
        DrawablePropertiesService
      ],
      imports: [FormsModule, MatSliderModule, MatFormFieldModule]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PencilComponent);
    component = fixture.componentInstance;

    properties = TestBed.get<DrawablePropertiesService>(DrawablePropertiesService);
 }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init attributes', () => {
    expect(properties.thickness.value).toBe(CONSTANT.THICKNESS_DEFAULT);
  });

  it('should change thickness value to max', () => {
    component.service.thickness = CONSTANT.THICKNESS_MAXIMUM + 1;
    component.onThicknessChange();
    expect(properties.thickness.value).toBe(CONSTANT.THICKNESS_MAXIMUM);
  });

  it('should change thickness value to min', () => {
    component.service.thickness = CONSTANT.THICKNESS_MINIMUM - 1;
    component.onThicknessChange();
    expect(properties.thickness.value).toBe(CONSTANT.THICKNESS_MINIMUM);
  });

  it('should change thickness value to provided value', () => {
    component.service.thickness = CONSTANT.THICKNESS_MINIMUM + 1;
    component.onThicknessChange();
    expect(properties.thickness.value).toBe(CONSTANT.THICKNESS_MINIMUM + 1);
  });
});
