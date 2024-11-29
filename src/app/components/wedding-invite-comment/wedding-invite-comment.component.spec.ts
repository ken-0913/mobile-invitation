import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeddingInviteCommentComponent } from './wedding-invite-comment.component';

describe('WeddingInviteCommentComponent', () => {
  let component: WeddingInviteCommentComponent;
  let fixture: ComponentFixture<WeddingInviteCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeddingInviteCommentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeddingInviteCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
