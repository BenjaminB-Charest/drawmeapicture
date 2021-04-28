// tslint:disable: no-magic-numbers | Reason: arbitrary values used for testing purposes
// tslint:disable: no-string-literal | Reason: used to access private variables
import { HttpClientModule } from '@angular/common/http';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { CanvasComponent } from './canvas.component';

describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let fixture: ComponentFixture<CanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanvasComponent ],
      providers: [
        {
        provide: ElementRef,
        useValue: {
            nativeElement: {
                getAttribute: () => '1',
            }
          },
        },
      ],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CanvasComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnInit should init no history', () => {
    history.pushState({
        continueDrawing: false
    }, 'mockState');
    const spy = spyOn(component['manipulator'], 'setAttribute');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledTimes(52);

    component.gridService.thickness.next(10);
    expect(component.thickness).toEqual(10);

    component.gridService.opacity.next(0.5);
    expect(component.opacity).toEqual(0.5);

    const spy3 = spyOn(component.grid.nativeElement, 'setAttribute');
    component.gridService.visible.next(true);
    expect(spy3).toHaveBeenCalledWith(SVGProperties.visibility, 'visible');

    component.gridService.visible.next(false);
    expect(spy3).toHaveBeenCalledWith(SVGProperties.visibility, 'hidden');
  });

  it('#ngOnInit should init to conitnue drawing', () => {
    history.pushState({
        continueDrawing: true
    }, 'mockState');
    localStorage.setItem('myWidth', '100');
    localStorage.setItem('myHeight', '200');
    localStorage.setItem('myColor', '#FFFFFF');
    localStorage.setItem('myInnerSvg', '<svg></svg>');
    const spy = spyOn(component['image'].nativeElement, 'setAttribute');
    component.ngOnInit();
    const allArgs = spy.calls.allArgs();
    expect(allArgs[3]).toEqual([SVGProperties.height, '200']);
    expect(allArgs[4]).toEqual([SVGProperties.width, '100']);
  });
});
