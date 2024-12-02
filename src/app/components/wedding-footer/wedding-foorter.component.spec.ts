import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingFoorterComponent } from './wedding-foorter.component';

describe('WeddingFoorterComponent', () => {
  let component: WeddingFoorterComponent;
  let fixture: ComponentFixture<WeddingFoorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingFoorterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingFoorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
