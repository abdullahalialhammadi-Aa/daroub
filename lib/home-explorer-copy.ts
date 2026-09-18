import {translate, type Locale} from './terrain';
import type {Localized} from './toolkit-types';

export const homeExplorerWords: Record<string, Localized> = {
  eyebrow: ['وجهة واضحة. استعداد أفضل.', 'Know your destination. Prepare well.', 'Découvrez votre destination. Préparez-vous.', '了解目的地，从容准备。', 'गंतव्य जानें। बेहतर तैयारी करें।'],
  title: ['إلى أين تأخذك رحلتك القادمة؟', 'Where will you go next?', 'Quelle sera votre prochaine destination ?', '下一程，去哪里？', 'अगली यात्रा कहाँ होगी?'],
  intro: ['اكتشف المكان، افهم تضاريسه، وجهّز رحلتك بما يناسبه.', 'Find a place, understand its terrain, and prepare for the journey.', 'Explorez un lieu, comprenez son terrain et préparez votre voyage.', '探索地点，了解地形，为旅程做好准备。', 'जगह खोजें, उसका भूभाग समझें और यात्रा की तैयारी करें।'],
  browse: ['ابحث عن وجهة', 'Find a destination', 'Trouver une destination', '查找目的地', 'गंतव्य खोजें'],
  globe: ['استكشف الكرة الأرضية', 'Explore the globe', 'Explorer le globe', '探索地球', 'ग्लोब पर खोजें'],
  destinations: ['اختر وجهتك', 'Choose your destination', 'Choisissez votre destination', '选择目的地', 'अपना गंतव्य चुनें'],
  destinationsIntro: ['تعرّف على المكان وطقسه وتجهيزاته قبل أن تبدأ خطتك.', 'Explore a place, its weather and equipment before building your plan.', 'Découvrez le lieu, sa météo et son équipement avant de préparer votre itinéraire.', '先了解地点、天气和装备，再开始规划。', 'योजना बनाने से पहले जगह, मौसम और उपकरण जानें।'],
  search: ['اسم الوجهة أو نوع التضاريس', 'Destination name or terrain', 'Nom de destination ou terrain', '目的地名称或地形', 'गंतव्य का नाम या भूभाग'],
  searchHint: ['مثلاً: ليوا، الغابات، آيسلندا…', 'Try Liwa, forests, Iceland…', 'Ex. : Liwa, forêts, Islande…', '例如：利瓦、森林、冰岛…', 'जैसे: लीवा, वन, आइसलैंड…'],
  clearSearch: ['مسح البحث', 'Clear search', 'Effacer la recherche', '清除搜索', 'खोज हटाएँ'],
  filter: ['تصفية الوجهات حسب التضاريس', 'Filter destinations by terrain', 'Filtrer les destinations par terrain', '按地形筛选目的地', 'भूभाग के अनुसार गंतव्य छाँटें'],
  all: ['كل التضاريس', 'All terrains', 'Tous les terrains', '全部地形', 'सभी भूभाग'],
  results: ['الوجهات الظاهرة', 'Destinations shown', 'Destinations affichées', '显示的目的地', 'दिखाए गए गंतव्य'],
  empty: ['لم نجد وجهة بهذه الخيارات', 'No destinations match', 'Aucune destination correspondante', '没有匹配的目的地', 'कोई गंतव्य नहीं मिला'],
  emptyHint: ['جرّب اسماً آخر أو اعرض كل التضاريس. يمكنك أيضاً اختيار أي نقطة على الكرة الأرضية.', 'Try another name or all terrains. You can also choose any point on the globe.', 'Essayez un autre nom ou tous les terrains. Vous pouvez aussi choisir un point sur le globe.', '请尝试其他名称或全部地形，也可以在地球上选择任意地点。', 'दूसरा नाम या सभी भूभाग चुनें। ग्लोब पर कोई भी बिंदु भी चुन सकते हैं।'],
  reset: ['إظهار كل الوجهات', 'Show all destinations', 'Afficher toutes les destinations', '显示全部目的地', 'सभी गंतव्य दिखाएँ'],
  explorePlace: ['استكشف الوجهة', 'Explore destination', 'Explorer la destination', '探索目的地', 'गंतव्य देखें'],
  planPlace: ['خطّط لرحلة هنا', 'Plan a trip here', 'Préparer un voyage ici', '规划此地行程', 'यहाँ की यात्रा बनाएँ'],
  ready: ['اخترت وجهتك؟ ابدأ خطتك', 'Have a destination? Start your plan', 'Destination choisie ? Préparez votre voyage', '选好目的地了？开始规划', 'गंतव्य चुन लिया? योजना बनाएँ'],
  readyHint: ['الوجهة، النشاط، وعدد المشاركين — ثم قائمة تجهيز تناسب رحلتك.', 'Destination, activity and group size — then a packing list for your trip.', 'Destination, activité et taille du groupe, puis une liste de matériel adaptée.', '选择目的地、活动和人数，再准备行李清单。', 'गंतव्य, गतिविधि और यात्रियों की संख्या — फिर यात्रा की सामान सूची।'],
  openPlanner: ['فتح مخطّط الرحلة', 'Open trip planner', 'Ouvrir le planificateur', '打开行程规划', 'यात्रा योजनाकार खोलें'],
  terrains: ['تعرّف على التضاريس', 'Get to know the terrain', 'Comprendre les terrains', '了解不同地形', 'भूभाग को जानें'],
  terrainsIntro: ['لكل بيئة متطلبات مختلفة. ابدأ بالأساسيات.', 'Every environment calls for different preparation. Start with the essentials.', 'Chaque milieu demande une préparation différente. Commencez par les bases.', '不同环境需要不同准备，从基本知识开始。', 'हर परिवेश की तैयारी अलग है। बुनियादी बातों से शुरू करें।'],
  terrainGuide: ['دليل التضاريس', 'Terrain guide', 'Guide du terrain', '地形指南', 'भूभाग मार्गदर्शिका'],
  support: ['أدوات ترافق استعدادك', 'Tools for your preparation', 'Des outils pour vous préparer', '出行准备工具', 'तैयारी में मददगार उपकरण'],
  assistant: ['اسأل مساعد دروب', 'Ask the Daroub assistant', 'Demander à l’assistant Daroub', '询问 Daroub 助手', 'Daroub सहायक से पूछें'],
  assistantHint: ['اسأل عن المكان أو التجهيزات، واقرأ المصادر مع الإجابة.', 'Ask about a place or equipment, with sources alongside the answer.', 'Posez vos questions sur un lieu ou le matériel, avec les sources de la réponse.', '询问地点或装备，并查看回答的来源。', 'जगह या उपकरण के बारे में पूछें और उत्तर के साथ स्रोत देखें।'],
  health: ['افهم اتصال جهازك', 'Check device compatibility', 'Vérifier la compatibilité du capteur', '查看设备兼容性', 'उपकरण की अनुकूलता जाँचें'],
  healthHint: ['راجع الأجهزة المدعومة لقراءة النبض وحدود التنبيهات.', 'Review supported heart-rate devices and how reading alerts work.', 'Consultez les capteurs cardiaques compatibles et le fonctionnement des alertes.', '了解支持的心率设备及读数提醒的工作方式。', 'समर्थित हृदयगति उपकरण और रीडिंग अलर्ट की जानकारी देखें।'],
  saved: ['رحلاتك وتجهيزاتك', 'Your trips and gear', 'Vos voyages et votre matériel', '你的行程与装备', 'आपकी यात्राएँ और उपकरण'],
  savedHint: ['تابع خططك وقوائم التجهيز من مساحة الرحلات.', 'Continue your plans and packing lists in your trip workspace.', 'Retrouvez vos plans et listes de matériel dans votre espace voyages.', '在行程空间继续完善计划与行李清单。', 'यात्रा कार्यक्षेत्र में योजनाएँ और सामान सूचियाँ जारी रखें।'],
};

export function homeText(locale: Locale, key: string): string {
  return translate(locale, homeExplorerWords[key] ?? homeExplorerWords.destinations);
}
