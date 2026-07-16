import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, Firestore } from 'firebase/firestore/lite';

import { environment } from '../../environments/environment';
import { Invitation } from '../models/invitation.model';
import { SAMPLE_INVITATION } from '../data/sample-invitation';

/**
 * 청첩장 데이터 조회.
 *
 * 조회 패턴은 shortId 로 문서 하나를 읽는 단건 read 뿐이므로
 * 실시간 구독이 필요 없는 firebase/firestore/lite(REST 기반)를 사용한다.
 * SSR(Node)·브라우저 양쪽에서 동일하게 동작한다.
 *
 * environment.useSampleData=true 이면 Firestore 없이 샘플을 반환한다.
 */
@Injectable({ providedIn: 'root' })
export class InvitationService {
  private db?: Firestore;

  /** shortId 로 청첩장 1건 조회. 없으면 null */
  getInvitation(shortId: string): Observable<Invitation | null> {
    if (environment.useSampleData) {
      return of(SAMPLE_INVITATION);
    }
    return from(this.fetchFromFirestore(shortId));
  }

  private async fetchFromFirestore(shortId: string): Promise<Invitation | null> {
    const snap = await getDoc(doc(this.firestore(), 'invitations', shortId));
    if (!snap.exists()) {
      return null;
    }
    return this.toInvitation(snap.data());
  }

  private firestore(): Firestore {
    if (!this.db) {
      const app: FirebaseApp = getApps().length
        ? getApps()[0]
        : initializeApp(environment.firebase);
      this.db = getFirestore(app);
    }
    return this.db;
  }

  /** Firestore raw 데이터를 도메인 모델로 변환 (Timestamp -> Date) */
  private toInvitation(data: any): Invitation {
    return {
      ...data,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      wedding: {
        ...data.wedding,
        dateTime: toDate(data.wedding?.dateTime) ?? new Date(),
      },
    } as Invitation;
  }
}

/** Firestore Timestamp / ISO 문자열 / Date 어느 쪽이든 Date 로 변환 */
function toDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}
