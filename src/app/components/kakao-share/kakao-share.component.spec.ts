import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KakaoShareComponent } from './kakao-share.component';

describe('KakaoShareComponent', () => {
  let component: KakaoShareComponent;
  let fixture: ComponentFixture<KakaoShareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KakaoShareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KakaoShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
