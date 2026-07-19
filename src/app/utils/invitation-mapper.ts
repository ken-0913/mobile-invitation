import { Invitation } from '../models/invitation.model';

/** Firestore raw 데이터 또는 직렬화된 Invitation 데이터를 화면 모델로 변환한다. */
export function toInvitation(data: any): Invitation {
  if (data.groom || data.bride || data.wedding) {
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

  if (data.groomName || data.brideName || data.weddingAt) {
    return toInvitationFromPublicApi(data);
  }

  const weddingDate = toDate(data.wedding_at) ?? new Date();
  const coverImage = data.cover_image_url ?? '';
  const galleryImages = Array.isArray(data.gallery_image_urls)
    ? data.gallery_image_urls
    : [];
  const images = coverImage ? [coverImage, ...galleryImages] : galleryImages;
  const showAccounts = data.show_bank_accounts !== false;

  return {
    status: data.is_published ? 'published' : 'draft',
    createdAt: toDate(data.created_at),
    updatedAt: toDate(data.updated_at),
    wedding: {
      dateTime: weddingDate,
      venue: {
        name: data.venue_name ?? '',
        address: data.venue_address ?? '',
        lat: toNumber(data.venue_lat),
        lng: toNumber(data.venue_lng),
      },
    },
    groom: {
      name: data.groom_name ?? '',
      nameEn: data.groom_name_en ?? data.groom_name ?? '',
      father: data.groom_father_name ?? data.groom_parent_names,
      mother: data.groom_mother_name,
      order: data.groom_order ?? '아들',
    },
    bride: {
      name: data.bride_name ?? '',
      nameEn: data.bride_name_en ?? data.bride_name ?? '',
      father: data.bride_father_name ?? data.bride_parent_names,
      mother: data.bride_mother_name,
      order: data.bride_order ?? '딸',
    },
    content: {
      coverTitle: data.cover_title ?? "YOU'RE INVITED TO THE WEDDING OF",
      greeting: data.greeting ?? '',
    },
    gallery: {
      coverImage,
      images,
    },
    accounts: {
      groom: showAccounts
        ? toAccounts(data.groom_bank_name, data.groom_account_number, data.groom_account_holder)
        : [],
      bride: showAccounts
        ? toAccounts(data.bride_bank_name, data.bride_account_number, data.bride_account_holder)
        : [],
    },
    transport: {
      subway: data.subway,
      bus: data.bus,
      parking: data.parking,
    },
    share: {
      title: data.share_title ?? `${data.groom_name ?? ''} ♥ ${data.bride_name ?? ''} 결혼합니다`,
      description:
        data.share_description ??
        `${formatDate(weddingDate)} ${data.venue_name ?? ''}`.trim(),
      imageUrl: data.share_image_url ?? coverImage,
    },
  };
}

function toInvitationFromPublicApi(data: any): Invitation {
  const weddingDate = toDate(data.weddingAt) ?? new Date();
  const coverImage = data.coverImageUrl ?? '';
  const galleryImages = Array.isArray(data.galleryImageUrls)
    ? data.galleryImageUrls
    : [];
  const images = coverImage ? [coverImage, ...galleryImages] : galleryImages;

  return {
    status: 'published',
    wedding: {
      dateTime: weddingDate,
      venue: {
        name: data.venueName ?? '',
        address: data.venueAddress ?? '',
        lat: 0,
        lng: 0,
      },
    },
    groom: {
      name: data.groomName ?? '',
      nameEn: data.groomName ?? '',
      father: data.groomParentNames,
      order: '아들',
    },
    bride: {
      name: data.brideName ?? '',
      nameEn: data.brideName ?? '',
      father: data.brideParentNames,
      order: '딸',
    },
    content: {
      coverTitle: "YOU'RE INVITED TO THE WEDDING OF",
      greeting: '',
    },
    gallery: {
      coverImage,
      images,
    },
    accounts: {
      groom: toPublicApiAccounts(data.bankAccounts?.groom),
      bride: toPublicApiAccounts(data.bankAccounts?.bride),
    },
    transport: {},
    share: {
      title: `${data.groomName ?? ''} ♥ ${data.brideName ?? ''} 결혼합니다`,
      description: `${formatDate(weddingDate)} ${data.venueName ?? ''}`.trim(),
      imageUrl: coverImage,
    },
  };
}

function toDate(value: any): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

function toNumber(value: any): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toAccounts(bank: any, number: any, holder: any) {
  if (!bank || !number || !holder) {
    return [];
  }
  return [{ bank, number, holder }];
}

function toPublicApiAccounts(account: any) {
  if (!account?.bankName || !account?.number || !account?.holder) {
    return [];
  }

  return [
    {
      bank: account.bankName,
      number: account.number,
      holder: account.holder,
    },
  ];
}

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
