import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingCalanderComponent } from './wedding-calander.component';

describe('WeddingCalanderComponent', () => {
  let component: WeddingCalanderComponent;
  let fixture: ComponentFixture<WeddingCalanderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingCalanderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingCalanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
