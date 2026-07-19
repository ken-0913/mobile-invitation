import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, map, startWith, tap } from 'rxjs';

import { InvitationService } from '../../services/invitation.service';
import { Invitation } from '../../models/invitation.model';
import { shortDateTime } from '../../utils/date-format';
import { NotFoundPageComponent } from '../not-found-page/not-found-page.component';

import { TypekitLoaderComponent } from '../../components/type-kit-loader/type-kit-loader.component';
import { FirstMainComponent } from '../../components/first-main/first-main.component';
import { WeddingInviteCommentComponent } from '../../components/wedding-invite-comment/wedding-invite-comment.component';
import { WeddingCalanderComponent } from '../../components/wedding-calander/wedding-calander.component';
import { WeddingGalleryV2Component } from '../../components/wedding-gallery-v2/wedding-gallery-v2.component';
import { WeddingLocationComponent } from '../../components/wedding-location/wedding-location.component';
import { WeddingAccountComponent } from '../../components/wedding-account/wedding-account.component';
import { KakaoShareComponent } from '../../components/kakao-share/kakao-share.component';
import { WeddingFoorterComponent } from '../../components/wedding-footer/wedding-foorter.component';

/**
 * 청첩장 한 건을 렌더링하는 페이지.
 * 라우트 파라미터 shortId 로 InvitationService 에서 데이터를 받아
 * 각 섹션 컴포넌트에 [invitation] 으로 주입한다.
 * SSR 시 카카오 미리보기용 OG 메타태그도 여기서 설정한다.
 */
@Component({
  selector: 'app-invitation-page',
  imports: [
    AsyncPipe,
    TypekitLoaderComponent,
    FirstMainComponent,
    WeddingInviteCommentComponent,
    WeddingCalanderComponent,
    WeddingGalleryV2Component,
    WeddingLocationComponent,
    WeddingAccountComponent,
    KakaoShareComponent,
    WeddingFoorterComponent,
    NotFoundPageComponent,
  ],
  templateUrl: './invitation-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvitationPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(InvitationService);
  private title = inject(Title);
  private meta = inject(Meta);

  state$!: Observable<InvitationPageState>;

  ngOnInit(): void {
    const shortId = this.route.snapshot.paramMap.get('shortId') ?? '';
    const loadingState: InvitationPageState = { status: 'loading' };

    this.state$ = this.service.getInvitation(shortId).pipe(
      tap((inv) => inv && this.applyMetaTags(inv)),
      map((inv): InvitationPageState =>
        inv ? { status: 'found', invitation: inv } : { status: 'notFound' },
      ),
      startWith(loadingState),
    );
  }

  /** 카카오톡 링크 미리보기(OG) 및 문서 제목 설정 */
  private applyMetaTags(inv: Invitation): void {
    const title = inv.share?.title ?? `${inv.groom.name} ♥ ${inv.bride.name} 결혼합니다`;
    const description =
      inv.share?.description ?? shortDateTime(inv.wedding.dateTime);
    const image = inv.share?.imageUrl ?? inv.gallery.coverImage;

    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'description', content: description });
  }
}

type InvitationPageState =
  | { status: 'loading' }
  | { status: 'found'; invitation: Invitation }
  | { status: 'notFound' };
