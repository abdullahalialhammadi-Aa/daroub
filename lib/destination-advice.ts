import {translate,type Locale} from './terrain';
export const adviceWords:Record<string,string[]>={
 title:['خطتك المناسبة لهذه الوجهة','A plan for this destination','Préparer cette destination','适合此目的地的计划','इस गंतव्य की तैयारी'],
 visit:['ماذا يمكنك أن تفعل؟','What can you do?','Que faire sur place ?','可以做什么？','क्या कर सकते हैं?'],
 clothing:['ماذا ترتدي؟','What should you wear?','Quels vêtements prévoir ?','穿什么？','क्या पहनें?'],
 transport:['كيف تصل وتتنقل؟','How do you get around?','Comment se déplacer ?','如何到达和出行？','कैसे पहुँचें और घूमें?'],
 season:['متى تذهب وما الذي تتحقق منه؟','When to go and what to check','Quand partir et que vérifier ?','何时前往，需要确认什么？','कब जाएँ और क्या जाँचें?'],
 more:['النشاط والملابس والتنقل والموسم','Activities, clothing, transport and seasons','Activités, vêtements, transport et saisons','活动、衣着、交通和季节','गतिविधियाँ, कपड़े, परिवहन और मौसम'],
 full:['دليل الوجهة الكامل','Full destination guide','Guide complet de la destination','完整目的地指南','पूरा गंतव्य गाइड'],
 sources:['المراجع وتاريخ المراجعة','Sources and review dates','Sources et dates de vérification','资料来源和核查日期','स्रोत और समीक्षा तिथियाँ'],
 coordinates:['موقع تقريبي للمنطقة، وليس نقطة بداية مسار أو تصريح دخول.','Approximate area marker, not a trailhead or entry permission.','Repère approximatif, pas un départ de sentier ni une autorisation d’accès.','区域大致位置，并非步道起点或入场许可。','क्षेत्र का अनुमानित स्थान; पगडंडी का आरंभ या प्रवेश अनुमति नहीं।']
};
export const adviceText=(locale:Locale,key:string)=>translate(locale,adviceWords[key]??[key]);
export function advicePreview(text:string){
 const end=text.search(/[.!?。！？।]\s|[。！？।]/u);return end>=0?text.slice(0,end+1):text;
}
