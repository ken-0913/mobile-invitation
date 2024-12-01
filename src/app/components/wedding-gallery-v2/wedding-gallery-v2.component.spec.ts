import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingGalleryV2Component } from './wedding-gallery-v2.component';

describe('WeddingGalleryV2Component', () => {
  let component: WeddingGalleryV2Component;
  let fixture: ComponentFixture<WeddingGalleryV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingGalleryV2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingGalleryV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
