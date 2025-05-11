import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEntityViewComponent } from './my-entity-view.component';

describe('MyEntityViewComponent', () => {
  let component: MyEntityViewComponent;
  let fixture: ComponentFixture<MyEntityViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEntityViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEntityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
