import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingAccountComponent } from './wedding-account.component';

describe('WeddingAccountComponent', () => {
  let component: WeddingAccountComponent;
  let fixture: ComponentFixture<WeddingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
