import type { GuideSection, Localized, SourceReference } from '../toolkit-types';

/** UAE catalogue additions (2026-09-18). Shared helpers so every place module has the same section set,
 *  chapter titles and review date. Map coordinates are approximate place markers, never trailheads. */
export const UAE = 'AE';
export const UAE_TZ = 'Asia/Dubai';
export const reviewedAt = '2026-09-18';

export const sectionTitles: Record<string, Localized> = {
  place: ['المكان وطبيعة التضاريس', 'Place and terrain', 'Lieu et relief', '地点与地形', 'स्थान और भूभाग'],
  equipment: ['المعدات والاستعداد', 'Equipment and preparation', 'Matériel et préparation', '装备与准备', 'सामान और तैयारी'],
  clothing: ['الملابس والأحذية', 'Clothing and footwear', 'Vêtements et chaussures', '衣物与鞋履', 'कपड़े और जूते'],
  transport: ['الوصول والتنقل', 'Access and transport', 'Accès et déplacements', '交通与抵达', 'पहुँच और परिवहन'],
  season: ['الموسم والظروف', 'Season and conditions', 'Saison et conditions', '季节与条件', 'मौसम और परिस्थितियाँ'],
  nature: ['الطبيعة وحدود التعرف', 'Nature and identification limits', 'Nature et limites d’identification', '自然与识别局限', 'प्रकृति और पहचान की सीमाएँ'],
  hazard: ['احتياطات الزيارة', 'Visit precautions', 'Précautions de visite', '游览注意事项', 'यात्रा की सावधानियाँ'],
  visit: ['اختيار النشاط والحجز', 'Activity choice and booking', 'Activités et réservation', '活动选择与预约', 'गतिविधि और बुकिंग'],
  rules: ['القواعد والتصاريح', 'Rules and permits', 'Règles et permis', '规则与许可', 'नियम और अनुमतियाँ'],
};
/** Every UAE place carries these nine chapters in this order. */
export const sectionOrder = ['place', 'equipment', 'clothing', 'transport', 'season', 'nature', 'hazard', 'visit', 'rules'] as const;
export const section = (id: keyof typeof sectionTitles & string, body: Localized, sourceIds: string[]): GuideSection => ({ id, title: sectionTitles[id], body, sourceIds });

/** Sources shared by every UAE place. Verified 2026-09-18. */
export const sharedUaeSources: SourceReference[] = [
  { id: 'uae-emergency', title: 'UAE Government portal · Handling emergencies (police 999, ambulance 998, civil defence 997)', url: 'https://u.ae/en/information-and-services/justice-safety-and-the-law/Safety/handling-emergencies', reviewedAt },
];
