import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypekitLoaderComponent } from './type-kit-loader.component';

describe('TypeKitLoaderComponent', () => {
  let component: TypekitLoaderComponent;
  let fixture: ComponentFixture<TypekitLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypekitLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypekitLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
