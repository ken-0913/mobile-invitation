import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeKitLoaderComponent } from './type-kit-loader.component';

describe('TypeKitLoaderComponent', () => {
  let component: TypeKitLoaderComponent;
  let fixture: ComponentFixture<TypeKitLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeKitLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeKitLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
