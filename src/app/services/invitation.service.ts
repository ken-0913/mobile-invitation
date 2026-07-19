import { HttpClient } from '@angular/common/http';
import { Injectable, REQUEST, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { Invitation } from '../models/invitation.model';
import { toInvitation } from '../utils/invitation-mapper';

/** 청첩장 데이터 조회. 프론트는 Firebase에 직접 접근하지 않고 백엔드 API만 호출한다. */
@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private request = inject(REQUEST, { optional: true });

  /** shortId(slug 또는 문서 ID)로 청첩장 1건 조회. 없으면 null */
  getInvitation(shortId: string): Observable<Invitation | null> {
    if (!shortId) {
      return of(null);
    }

    return this.http
      .get<Invitation>(this.apiUrl(shortId))
      .pipe(
        map((invitation) => toInvitation(invitation)),
        catchError(() => of(null)),
      );
  }

  private apiUrl(shortId: string): string {
    const path = `/api/invitations/${encodeURIComponent(shortId)}`;

    if (!this.request) {
      return path;
    }

    return new URL(path, this.request.url).toString();
  }
}
