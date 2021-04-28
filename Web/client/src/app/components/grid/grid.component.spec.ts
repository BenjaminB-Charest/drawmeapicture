// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing arbitrary values
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderChange } from '@angular/material/slider';
import * as CONSTANT from 'src/app/classes/constants';
import { GridService } from 'src/app/services/drawable/grid/grid.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridComponent ],
      providers: [
        {
          provide: GridService,
          useValue: {
            initializeProperties: () => { return ; },
            initialize: () => null
          }
        },
        ToolSelectorService,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#setThickness should set new thickness value', () => {
    component.setThickness({value: 10} as MatSliderChange);
    expect(component.service.thickness.value).toEqual(10);
  });

  it('#setThickness should NOT set new thickness value', () => {
    component.setThickness({value: null} as MatSliderChange);
    expect(component.service.thickness.value).toEqual(CONSTANT.GRID_MINIMUM);
  });

  it('#setOpacity should set new opacity value', () => {
    component.setOpacity({value: 0.5} as MatSliderChange);
    expect(component.service.opacity.value).toEqual(0.5);
  });

  it('#setOpacity should NOT set new opacity value', () => {
    component.setOpacity({value: null} as MatSliderChange);
    expect(component.service.opacity.value).toEqual(CONSTANT.OPACITY_DEFAULT);
  });
});
