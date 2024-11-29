import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingGalleryComponent } from './wedding-gallery.component';

describe('WeddingGalleryComponent', () => {
  let component: WeddingGalleryComponent;
  let fixture: ComponentFixture<WeddingGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
