import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section, sectionOrder } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-sir-bani-yas-visit-island', title: 'Visit Abu Dhabi · Sir Bani Yas Island', url: 'https://visitabudhabi.ae/en/where-to-go/islands/sir-bani-yas-island', reviewedAt },
  { id: 'uae-sir-bani-yas-wildlife-park', title: 'Visit Abu Dhabi · Arabian Wildlife Park', url: 'https://visitabudhabi.ae/en/things-to-do/nature-and-wildlife/wildlife/arabian-wildlife-park', reviewedAt },
  { id: 'uae-sir-bani-yas-nature-drive', title: 'Anantara · Nature drive', url: 'https://www.anantara.com/en/desert-islands-sir-bani-yas/island-discovery/nature-drive', reviewedAt },
  { id: 'uae-sir-bani-yas-kayaking', title: 'Anantara · Kayaking in Abu Dhabi', url: 'https://www.anantara.com/en/al-yamm-sir-bani-yas/experiences/kayaking', reviewedAt },
  { id: 'uae-sir-bani-yas-island-discovery', title: 'Anantara · Desert Islands island discovery', url: 'https://www.anantara.com/en/desert-islands-sir-bani-yas/island-discovery', reviewedAt },
  { id: 'uae-sir-bani-yas-conservation', title: 'Anantara · From extinction to the wild', url: 'https://www.anantara.com/en/blog/from-extinction-to-the-wild', reviewedAt },
  { id: 'uae-sir-bani-yas-protected-areas', title: 'Environment Agency Abu Dhabi · Experience Green Abu Dhabi', url: 'https://www.ead.gov.ae/en/experience-green-abu-dhabi', reviewedAt },
  { id: 'uae-sir-bani-yas-marine-conditions', title: 'National Center of Meteorology · ALBAHAR', url: 'https://albahar.ncm.gov.ae/', reviewedAt },
  { id: 'uae-sir-bani-yas-warnings', title: 'National Center of Meteorology · Early Warnings for All', url: 'https://ew4all.ncm.gov.ae/?lang=en', reviewedAt },
  { id: 'uae-sir-bani-yas-life-below-water', title: 'UAE Government portal · Life below water', url: 'https://u.ae/en/about-the-uae/leaving-no-one-behind/14lifebelowwater', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-sir-bani-yas-arabian-oryx', coverage: 'local',
    name: ['المها العربي', 'Arabian oryx', 'Oryx d’Arabie', '阿拉伯大羚羊', 'अरबी ओरिक्स'],
    description: ['توثق المصادر وجود المها في منتزه الحياة البرية. هذا للتعرّف العام ولا يضمن رؤيته في أي جولة.', 'Sources document oryx in the wildlife park. This is broad recognition guidance and does not guarantee a sighting on any drive.', 'Les sources signalent l’oryx dans le parc animalier. Cette note aide seulement à l’identifier en général, sans garantir l’observation.', '资料记录野生动物园内有阿拉伯大羚羊。本说明仅作概括认识，不保证每次行程都能看到。', 'स्रोत वन्यजीव पार्क में ओरिक्स का उल्लेख करते हैं। यह सामान्य पहचान है, किसी ड्राइव में दिखना निश्चित नहीं।'],
    precaution: ['راقبه من المركبة أو مع المرشد فقط؛ لا تقترب أو تطعمه.', 'Observe only from the vehicle or with the guide; do not approach or feed it.', 'Observez depuis le véhicule ou avec le guide ; ne l’approchez pas et ne le nourrissez pas.', '只从车辆内或随向导观察，不要靠近或投喂。', 'केवल वाहन से या गाइड के साथ देखें; पास न जाएँ और भोजन न दें।'],
    sourceIds: ['uae-sir-bani-yas-visit-island', 'uae-sir-bani-yas-nature-drive'],
  },
  {
    id: 'uae-sir-bani-yas-sand-gazelle', coverage: 'local',
    name: ['غزال الرمال', 'Sand gazelle', 'Gazelle des sables', '沙漠瞪羚', 'रेतीली गज़ेल'],
    description: ['تذكر صفحة الحفظ غزلان الرمال ضمن أنواع الجزيرة. قد تختلط على الزائر مع ظباء أخرى، فلا تعتمد على هذا النص للتحديد الدقيق.', 'The conservation page lists sand gazelles among island species. Visitors may confuse them with other antelope, so this is not a precise field key.', 'La page de conservation cite des gazelles des sables. Elles peuvent être confondues avec d’autres antilopes ; ce n’est pas une clé de terrain.', '保护页面列出沙漠瞪羚。游客可能会与其他羚类混淆，本条不是精确野外鉴定工具。', 'संरक्षण पृष्ठ द्वीप पर रेतीली गज़ेल बताता है। वे अन्य हिरणों जैसी लग सकती हैं; यह सटीक पहचान कुंजी नहीं है।'],
    precaution: ['اترك مسافة ولا تطاردها بالتصوير أو الدراجة.', 'Keep distance and do not chase it for photographs or by bicycle.', 'Gardez vos distances, sans la poursuivre pour une photo ni à vélo.', '保持距离，不要为拍照或骑车追逐。', 'दूरी रखें; फोटो या साइकिल से पीछा न करें।'],
    sourceIds: ['uae-sir-bani-yas-conservation'],
  },
  {
    id: 'uae-sir-bani-yas-cheetah', coverage: 'local',
    name: ['الفهد الصياد', 'Cheetah', 'Guépard', '猎豹', 'चीता'],
    description: ['تذكر المصادر الفهود في المحمية وبرنامج إعادة التأهيل. وجود مفترس لا يعني اقتراباً آمناً أو مشاهدة مضمونة.', 'Sources mention cheetahs in the reserve and rewilding programme. A predator’s presence is not an invitation to approach or a guaranteed sighting.', 'Les sources mentionnent les guépards et un programme de réensauvagement. La présence d’un prédateur n’autorise pas l’approche et ne garantit rien.', '资料提到保护区的猎豹及野化项目。有食肉动物不代表可以靠近，也不保证能见到。', 'स्रोत रिज़र्व और रीवाइल्डिंग कार्यक्रम में चीते बताते हैं। शिकारी की मौजूदगी पास जाने का निमंत्रण या दिखने की गारंटी नहीं है।'],
    precaution: ['اتبع تعليمات المرشد والمركبة؛ لا تفتح الباب أو تنزل لالتقاط صورة.', 'Follow guide and vehicle instructions; do not open doors or get out for a photo.', 'Suivez les consignes du guide et du véhicule ; n’ouvrez pas la porte et ne descendez pas pour une photo.', '遵守向导和车辆指示，不要开门或下车拍照。', 'गाइड और वाहन के निर्देश मानें; फोटो के लिए दरवाज़ा न खोलें और न उतरें।'],
    sourceIds: ['uae-sir-bani-yas-nature-drive', 'uae-sir-bani-yas-conservation'],
  },
  {
    id: 'uae-sir-bani-yas-giraffe', coverage: 'local',
    name: ['الزرافة', 'Giraffe', 'Girafe', '长颈鹿', 'जिराफ़'],
    description: ['تسجل صفحة أبوظبي والقيادة الطبيعية الزرافات في المنتزه. هذه قائمة مشاهدة محتملة وليست وعداً بموقع أو وقت محدد.', 'Visit Abu Dhabi and the nature drive page record giraffes in the park. This is a possible sighting note, not a promise of place or timing.', 'Visit Abu Dhabi et la sortie nature signalent des girafes dans le parc. C’est une possibilité d’observation, sans promesse de lieu ni d’horaire.', '阿布扎比旅游和自然车游页面记录园内有长颈鹿。这只是可能观察提示，并非承诺地点或时间。', 'Visit Abu Dhabi और नेचर ड्राइव पृष्ठ पार्क में जिराफ़ बताते हैं। यह संभावित दर्शन है, स्थान या समय का वादा नहीं।'],
    precaution: ['لا تمد يدك أو طعامك من المركبة؛ التصوير يكون من المسافة التي يحددها المرشد.', 'Do not extend hands or food from the vehicle; photograph only from the distance set by the guide.', 'Ne tendez ni main ni nourriture hors du véhicule ; photographiez à la distance fixée par le guide.', '不要从车内伸手或递食物；只在向导规定距离拍摄。', 'वाहन से हाथ या भोजन बाहर न करें; गाइड द्वारा तय दूरी से ही फोटो लें।'],
    sourceIds: ['uae-sir-bani-yas-visit-island', 'uae-sir-bani-yas-nature-drive'],
  },
  {
    id: 'uae-sir-bani-yas-dugong', coverage: 'local',
    name: ['الأطوم', 'Dugong', 'Dugong', '儒艮', 'डुगोंग'],
    description: ['تذكر صفحة التجديف والمقال الحفظي الأطوم في مياه الجزيرة أو حولها. الرؤية البحرية تعتمد على الحالة ولا ينبغي افتراضها.', 'The kayaking page and conservation article mention dugongs in or around island waters. Marine visibility is condition-dependent and should not be assumed.', 'La page de kayak et l’article de conservation citent le dugong autour de l’île. La visibilité en mer dépend des conditions.', '皮划艇页面和保护文章提到岛周水域有儒艮。海上可见度受条件影响，不应默认可见。', 'कयाक पृष्ठ और संरक्षण लेख द्वीप के आसपास डुगोंग बताते हैं। समुद्री दृश्यता स्थिति पर निर्भर है।'],
    precaution: ['لا تطارده بالقارب أو المجداف؛ اترك المسار للمشغّل وتجنب لمس الحياة البحرية.', 'Do not pursue it by boat or paddle; leave routing to the operator and avoid touching marine life.', 'Ne le poursuivez pas en bateau ni à la pagaie ; laissez l’itinéraire à l’opérateur et ne touchez pas la vie marine.', '不要用船或桨追逐；路线交由运营方安排，避免触碰海洋生物。', 'नाव या पैडल से पीछा न करें; मार्ग संचालक पर छोड़ें और समुद्री जीवों को न छुएँ।'],
    sourceIds: ['uae-sir-bani-yas-kayaking', 'uae-sir-bani-yas-conservation'],
  },
  {
    id: 'uae-sir-bani-yas-jellyfish', coverage: 'terrain-example',
    name: ['قناديل البحر', 'Jellyfish', 'Méduses', '水母', 'जेलीफ़िश'],
    description: ['مثال ساحلي احترازي عام: لم توثق المصادر المقروءة نوعاً محدداً هنا، لكن نشاط البحر والسباحة السطحية يتطلبان فحص الحالة يومياً.', 'General coastal precaution example: the fetched sources did not document a specific local species, but water activities still require same-day condition checks.', 'Exemple côtier de prudence : les sources lues ne citent pas d’espèce locale précise, mais les activités nautiques exigent une vérification le jour même.', '一般海岸防范示例：已读资料未记录当地具体种类，但水上活动仍需当天核对条件。', 'सामान्य तटीय सावधानी: पढ़े स्रोत किसी स्थानीय प्रजाति को दर्ज नहीं करते, फिर भी जल गतिविधियों में उसी दिन स्थिति जाँचें।'],
    precaution: ['استنتاج عملي: اسأل المشغّل عن اللسعات أو التحذيرات قبل النزول؛ اخرج من الماء عند التنبيه.', 'Practical inference: ask the operator about stings or warnings before entering; leave the water if advised.', 'Déduction pratique : demandez à l’opérateur les piqûres ou alertes avant d’entrer ; sortez si on vous le demande.', '实用推断：下水前询问运营方是否有蜇伤或警报；收到提示就离水。', 'व्यावहारिक अनुमान: उतरने से पहले संचालक से डंक या चेतावनी पूछें; सलाह मिले तो पानी से बाहर आएँ।'],
    sourceIds: ['uae-sir-bani-yas-marine-conditions', 'uae-sir-bani-yas-warnings'],
  },
];

const sections = [
  section('place', [
    'جزيرة صير بني ياس محمية جزيرية في منطقة الظفرة، وفي قلبها منتزه الحياة البرية العربية. المؤشر تقريبي للجزيرة وليس بداية مسار أو مرسى انطلاق؛ الصورة توضيحية لتضاريس الساحل. خطط على أنها زيارة منظّمة لا تجوالاً مفتوحاً، وتحقق من التفاصيل في يوم الوصول.',
    'Sir Bani Yas is an island reserve in Al Dhafra with the Arabian Wildlife Park at its centre. The marker is an approximate area marker, not a trailhead or jetty; the image is illustrative of coast terrain. Plan it as an operated visit, not open roaming, and check details on the day.',
    'Sir Bani Yas est une réserve insulaire d’Al Dhafra, avec l’Arabian Wildlife Park en son centre. Le repère est approximatif, ni départ de sentier ni jetée ; l’image illustre le littoral. Préparez une visite encadrée, pas une exploration libre, et vérifiez le jour même.',
    '萨巴尼亚斯岛是达夫拉地区的岛屿保护地，阿拉伯野生动物园位于其中。标记仅示大致区域，不是步道起点或码头；图片为海岸地形示意。请按运营行程规划，不当作自由穿越，并在当天核对信息。',
    'सर बनी यस अल धफ़रा का द्वीपीय रिज़र्व है, जिसके केंद्र में अरबी वन्यजीव पार्क है। चिह्न अनुमानित क्षेत्र है, पगडंडी या जेटी नहीं; चित्र तट भूभाग का उदाहरण है। इसे संचालित यात्रा मानकर योजना बनाएँ, खुली घूमने की जगह नहीं, और उसी दिन जाँचें।',
  ], ['uae-sir-bani-yas-visit-island', 'uae-sir-bani-yas-wildlife-park']),
  section('equipment', [
    'استنتاج عملي: احمل حجزك وهوية مناسبة ونسخة غير متصلة من تعليمات المشغّل. للتجديف أو السباحة السطحية اسأل عما يوفَّر من سترة أو معدات قبل شراء بدائل. أضف ماءً شخصياً وحماية للشمس، فالمتاجر والنقل بين مرافق الجزيرة مرتبطان ببرنامجك.',
    'Practical inference: carry your booking, suitable ID and offline operator instructions. For kayaking or snorkelling, ask what life jacket or equipment is provided before buying alternatives. Add personal water and sun protection, because shops and transfers on the island depend on your programme.',
    'Déduction pratique : gardez réservation, pièce d’identité adaptée et consignes hors ligne. Pour kayak ou snorkeling, demandez quel gilet ou matériel est fourni avant d’acheter autre chose. Prévoyez eau et protection solaire, car boutiques et transferts dépendent du programme.',
    '实用推断：携带预订、合适身份证件，并离线保存运营方说明。皮划艇或浮潜前，先询问救生衣和装备提供情况，再决定是否自备。另备个人饮水和防晒，因为岛上商店和接送取决于行程安排。',
    'व्यावहारिक अनुमान: बुकिंग, उचित पहचान और संचालक निर्देश ऑफलाइन रखें। कयाक या स्नॉर्कलिंग के लिए कौन-सी जैकेट या सामग्री मिलती है, पहले पूछें। अपना पानी और धूप से बचाव रखें, क्योंकि द्वीप पर दुकानें और ट्रांसफर आपके कार्यक्रम पर निर्भर हैं।',
  ], ['uae-sir-bani-yas-kayaking', 'uae-sir-bani-yas-island-discovery']),
  section('clothing', [
    'نصيحة عامة وليست شرطاً محلياً: اختر ملابس خفيفة ساترة وقبعة ونظارة شمس، وحذاءً ثابتاً يصلح للنزول من المركبة أو ركوب الدراجة. للأنشطة البحرية أضف ملابس تجف سريعاً وقطعة جافة للعودة، واتبع تعليمات المنتجع عند تبديل الملابس.',
    'General advice, not a local requirement: use light covering clothes, hat, sunglasses and stable footwear for leaving vehicles or cycling. For water activities, add quick-dry clothing and a dry layer for return, and follow the resort’s changing arrangements.',
    'Conseil général, pas une exigence locale : vêtements légers couvrants, chapeau, lunettes et chaussures stables pour descendre du véhicule ou faire du vélo. Pour l’eau, ajoutez tenue à séchage rapide et couche sèche au retour, selon les consignes du complexe.',
    '一般建议，并非当地规定：穿轻薄遮蔽衣物，戴帽子和太阳镜，穿适合下车或骑行的稳固鞋。水上活动可加速干衣物和返程干衣，并遵守度假村更衣安排。',
    'सामान्य सलाह, स्थानीय नियम नहीं: हल्के ढकने वाले कपड़े, टोपी, धूप का चश्मा और वाहन से उतरने या साइकिल के लिए स्थिर जूते पहनें। जल गतिविधि में जल्दी सूखने वाले कपड़े और वापसी की सूखी परत रखें, तथा रिज़ॉर्ट निर्देश मानें।',
  ], ['uae-sir-bani-yas-kayaking', 'uae-sir-bani-yas-island-discovery']),
  section('transport', [
    'تذكر صفحة منتزه الحياة البرية الوصول براً إلى مرسى صير بني ياس ثم قارباً مجانياً إلى الجزيرة. رتّب النقل مع المنتجع أو المشغّل ولا تستخدم الإحداثيات كتعليمات قيادة نهائية. إذا تغيّر البحر أو الجدول، قد تتغير القوارب أو الأنشطة؛ تحقق قبل الانطلاق.',
    'The wildlife park page describes road access to Sir Bani Yas jetty followed by a complimentary boat to the island. Arrange transfers with the resort or operator and do not use coordinates as final driving instructions. If sea state or schedule changes, boats or activities may change; check before leaving.',
    'La page du parc indique un accès routier jusqu’à la jetée de Sir Bani Yas puis un bateau gratuit. Organisez les transferts avec le complexe ou l’opérateur, sans prendre les coordonnées pour itinéraire final. Mer ou horaire peuvent modifier bateaux et activités ; vérifiez avant départ.',
    '野生动物园页面说明先驾车到萨巴尼亚斯码头，再乘免费船上岛。请与度假村或运营方安排接送，不要把坐标当作最终驾驶指引。海况或时间表变化时，船班或活动可能调整；出发前核对。',
    'वन्यजीव पार्क पृष्ठ सड़क से सर बनी यस जेटी और फिर निःशुल्क नाव बताता है। रिज़ॉर्ट या संचालक से ट्रांसफर तय करें; निर्देशांक को अंतिम ड्राइविंग निर्देश न मानें। समुद्र या समय बदलने पर नाव और गतिविधि बदल सकती है; निकलने से पहले जाँचें।',
  ], ['uae-sir-bani-yas-wildlife-park', 'uae-sir-bani-yas-marine-conditions']),
  section('season', [
    'المركز الوطني للأرصاد يوفّر تنبيهات وخدمة بحرية، ومصادر الجزيرة تعرض أنشطة خارجية وبحرية. قرار التخطيط لا يعتمد على الشمس وحدها: الرياح أو حالة البحر قد تجعل التجديف أو السباحة السطحية غير مناسبة. راجع التحذيرات والتوقعات في يوم الزيارة.',
    'The National Center of Meteorology provides warnings and a marine service, while island sources list outdoor and water activities. Planning should not rely on sunshine alone: wind or sea state may make kayaking or snorkelling unsuitable. Check warnings and forecasts on the visit day.',
    'Le Centre national de météorologie publie alertes et service maritime, tandis que les sources de l’île listent activités de plein air et nautiques. Ne jugez pas à l’ensoleillement seul : vent ou mer peuvent rendre kayak ou snorkeling inadaptés. Vérifiez le jour même.',
    '国家气象中心提供预警和海况服务，岛屿资料列出户外与水上活动。规划不能只看晴天：风或海况可能使皮划艇或浮潜不适合。请在游览当天查看预警和预报。',
    'राष्ट्रीय मौसम केंद्र चेतावनी और समुद्री सेवा देता है, और द्वीप स्रोत बाहरी व जल गतिविधियाँ बताते हैं। केवल धूप देखकर योजना न बनाएँ: हवा या समुद्र की दशा कयाक या स्नॉर्कलिंग को अनुपयुक्त बना सकती है। यात्रा के दिन चेतावनी जाँचें।',
  ], ['uae-sir-bani-yas-marine-conditions', 'uae-sir-bani-yas-warnings', 'uae-sir-bani-yas-island-discovery']),
  section('nature', [
    'تسجل المصادر المها والغزلان والفهود والزرافات، كما تذكر المياه حول الجزيرة للسلاحف والدلافين والأطوم. القائمة هنا أمثلة موثقة وليست جرداً كاملاً أو مفتاح تعريف. راقب من المسافة التي يحددها المرشد، ولا تطعم أو تلمس الحياة البرية أو البحرية.',
    'Sources record oryx, gazelles, cheetahs and giraffes, and mention waters around the island for turtles, dolphins and dugongs. The list here is documented examples, not a complete inventory or identification key. Observe from the guide’s distance; do not feed or touch wildlife or marine life.',
    'Les sources citent oryx, gazelles, guépards et girafes, ainsi que tortues, dauphins et dugongs autour de l’île. La liste donne des exemples documentés, non un inventaire ni une clé. Observez à la distance fixée par le guide, sans nourrir ni toucher.',
    '资料记录有大羚羊、瞪羚、猎豹和长颈鹿，也提到岛周水域的海龟、海豚和儒艮。此列表是有出处的示例，不是完整名录或鉴定工具。按向导规定距离观察，不投喂、不触碰野生或海洋生物。',
    'स्रोत ओरिक्स, गज़ेल, चीते और जिराफ़ तथा द्वीप के आसपास कछुए, डॉल्फ़िन और डुगोंग बताते हैं। यह दर्ज उदाहरण हैं, पूरी सूची या पहचान कुंजी नहीं। गाइड द्वारा तय दूरी से देखें; वन्य या समुद्री जीवों को न खिलाएँ, न छुएँ।',
  ], ['uae-sir-bani-yas-visit-island', 'uae-sir-bani-yas-conservation', 'uae-sir-bani-yas-kayaking']),
  section('hazard', [
    'المخاطر الرئيسية تخطيطية: مفترسات ضمن محمية، حر وانكشاف، وحالة بحر قد لا تناسب النشاط رغم صفاء السماء. استنتاج عملي: ابقَ في المركبة أو مع المرشد، وانهِ النشاط عند طلب المشغّل. للطوارئ في الإمارات: الشرطة 999، الإسعاف 998، الدفاع المدني 997.',
    'Main hazards are planning-related: predators within a reserve, heat and exposure, and sea state that may be unsuitable despite clear skies. Practical inference: stay in the vehicle or with the guide, and stop when the operator says so. UAE emergencies: police 999, ambulance 998, civil defence 997.',
    'Les risques tiennent surtout à la préparation : prédateurs en réserve, chaleur et exposition, mer parfois inadaptée malgré le soleil. Restez dans le véhicule ou avec le guide et cessez l’activité si l’opérateur le demande. Urgences UAE : police 999, ambulance 998, défense civile 997.',
    '主要风险在于规划：保护区内有食肉动物、高温暴晒，以及即使晴朗也可能不适合活动的海况。实用推断：留在车内或跟随向导，运营方要求时停止活动。阿联酋紧急电话：警察999、救护998、民防997。',
    'मुख्य जोखिम योजना से जुड़े हैं: रिज़र्व में शिकारी, गर्मी और खुलापन, तथा साफ़ आसमान में भी अनुपयुक्त समुद्र। व्यावहारिक अनुमान: वाहन में या गाइड के साथ रहें, और संचालक कहे तो गतिविधि रोकें। UAE आपातकाल: पुलिस 999, एम्बुलेंस 998, सिविल डिफेन्स 997।',
  ], ['uae-sir-bani-yas-nature-drive', 'uae-sir-bani-yas-marine-conditions', 'uae-sir-bani-yas-warnings', 'uae-emergency']),
  section('visit', [
    'للمرة الأولى اختر نشاطاً واحداً محجوزاً جيداً: قيادة حياة برية، أو تجديفاً هادئاً، أو سباحة سطحية عند ملاءمة البحر، أو ركوب دراجة قصير. تؤكد المصادر وجود هذه الخيارات لكنها لا تضمن توافرها يومياً. احجز، ثم أعد التأكيد على الوقت والطقس وشروط المشاركة.',
    'For a first visit, choose one well-booked activity: wildlife drive, calm kayaking, snorkelling when the sea is suitable, or a short bicycle outing. Sources confirm these options but not daily availability. Book, then reconfirm time, weather and participation conditions.',
    'Pour une première visite, choisissez une activité bien réservée : safari faune, kayak calme, snorkeling si la mer convient, ou courte sortie à vélo. Les sources confirment ces options, sans disponibilité quotidienne garantie. Réservez puis reconfirmez horaire, météo et conditions.',
    '首次到访可选择一个预订明确的活动：野生动物车游、平静水域皮划艇、海况合适时浮潜，或短途骑行。资料确认有这些选项，但不保证每天开放。先预订，再复核时间、天气和参加条件。',
    'पहली यात्रा में एक अच्छी तरह बुक गतिविधि चुनें: वन्यजीव ड्राइव, शांत कयाक, समुद्र ठीक हो तो स्नॉर्कलिंग, या छोटी साइकिल सैर। स्रोत विकल्प बताते हैं, रोज़ उपलब्धता की गारंटी नहीं। बुक करें, फिर समय, मौसम और भागीदारी शर्तें फिर जाँचें।',
  ], ['uae-sir-bani-yas-nature-drive', 'uae-sir-bani-yas-kayaking', 'uae-sir-bani-yas-island-discovery']),
  section('rules', [
    'الوصول إلى الحياة البرية يكون عبر جولات ومركبات مرخّصة لا بتتبع الحيوانات ذاتياً. المناطق المحمية في أبوظبي تتطلب احترام البيئة وبعضها لا يفتح إلا بتصاريح. لا تستخدم الدرون، ولا تجمع كائنات أو شعاباً أو أصدافاً. اتبع شروط المنتجع والبحر، واحتفظ بأرقام الطوارئ.',
    'Wildlife access is through operated drives and authorised vehicles, not self-tracking animals. Abu Dhabi protected areas require respect for the environment and some open only by permit. Do not fly drones or collect organisms, corals or shells. Follow resort and marine conditions, and keep emergency numbers.',
    'L’accès à la faune se fait par sorties encadrées et véhicules autorisés, pas par recherche autonome. Les aires protégées d’Abou Dhabi exigent le respect du milieu et certaines ne s’ouvrent qu’avec permis. Pas de drone ni de collecte d’organismes, coraux ou coquillages. Gardez les numéros d’urgence.',
    '野生动物访问应通过运营车游和授权车辆进行，不可自行追踪动物。阿布扎比保护区要求尊重环境，部分区域仅凭许可开放。不要放飞无人机，不采集生物、珊瑚或贝壳。遵守度假村和海况要求，并保存紧急电话。',
    'वन्यजीव पहुँच संचालित ड्राइव और अधिकृत वाहनों से है, स्वयं जानवर ढूँढने से नहीं। अबू धाबी संरक्षित क्षेत्रों में पर्यावरण सम्मान ज़रूरी है और कुछ केवल परमिट से खुलते हैं। ड्रोन न उड़ाएँ, जीव, कोरल या सीप न लें। रिज़ॉर्ट व समुद्री शर्तें मानें और आपात नंबर रखें।',
  ], ['uae-sir-bani-yas-nature-drive', 'uae-sir-bani-yas-protected-areas', 'uae-sir-bani-yas-life-below-water', 'uae-emergency']),
];

if (sections.map(({ id }) => id).join('|') !== sectionOrder.join('|')) throw new Error('Unexpected section order');

export const destination = {
  id: 'sir-bani-yas', country: UAE, terrainId: 'coast', terrainIndex: 3, lat: 24.3167, lon: 52.6042, timezone: UAE_TZ,
  names: ['جزيرة صير بني ياس ومنتزه الحياة البرية العربية', 'Sir Bani Yas Island and Arabian Wildlife Park', 'Île de Sir Bani Yas et Arabian Wildlife Park', '萨巴尼亚斯岛和阿拉伯野生动物园', 'सर बनी यस द्वीप और अरबी वन्यजीव पार्क'],
  summary: ['جزيرة محمية في الظفرة لقيادة حياة برية منظّمة وأنشطة بحرية تعتمد على الطقس؛ المؤشر تقريبي والصورة توضيحية.', 'An Al Dhafra island reserve for operated wildlife drives and weather-dependent water activities; marker approximate, image illustrative.', 'Réserve insulaire d’Al Dhafra pour safaris encadrés et activités nautiques selon météo ; repère approximatif, image illustrative.', '达夫拉岛屿保护地，可参加运营野生动物车游和受天气影响的水上活动；标记近似，图片示意。', 'अल धफ़रा का द्वीपीय रिज़र्व; संचालित वन्यजीव ड्राइव और मौसम पर निर्भर जल गतिविधियाँ। चिह्न अनुमानित, चित्र उदाहरणात्मक।'],
  image: '/images/coast.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-sir-bani-yas-visit-island', 'uae-sir-bani-yas-wildlife-park', 'uae-sir-bani-yas-nature-drive', 'uae-sir-bani-yas-kayaking'],
  species,
  sections,
} satisfies Destination & { country: typeof UAE };

export const rules: PackingRule[] = [
  {
    id: 'uae-sir-bani-yas-booking-id', version: 1, equipmentId: 'uae-sir-bani-yas-booking-id',
    label: ['إثبات الحجز والهوية', 'Booking proof and ID', 'Preuve de réservation et identité', '预订凭证和身份证件', 'बुकिंग प्रमाण और पहचान'],
    category: 'essentials', terrainIds: ['coast'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['الوصول إلى الجزيرة والأنشطة مرتبطان بترتيبات المنتجع أو المشغّل؛ احتفظ بالتفاصيل دون اتصال.', 'Island access and activities depend on resort or operator arrangements; keep details offline.', 'L’accès et les activités dépendent du complexe ou de l’opérateur ; gardez les détails hors ligne.', '上岛和活动取决于度假村或运营方安排；请离线保存详情。', 'द्वीप पहुँच और गतिविधियाँ रिज़ॉर्ट या संचालक व्यवस्था पर निर्भर हैं; विवरण ऑफलाइन रखें।'],
    sourceIds: ['uae-sir-bani-yas-wildlife-park'], coverage: 'local', destinationIds: ['sir-bani-yas'],
  },
  {
    id: 'uae-sir-bani-yas-life-jacket-check', version: 1, equipmentId: 'uae-sir-bani-yas-life-jacket-check',
    label: ['تأكيد سترة النجاة الملائمة', 'Fitted life-jacket confirmation', 'Confirmation du gilet ajusté', '合身救生衣确认', 'सही फिट जीवन-जैकेट पुष्टि'],
    category: 'safety', terrainIds: ['coast'], activities: ['boating', 'swimming'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['تذكر المصادر التجديف والأنشطة البحرية؛ أكّد ما يوفّره المشغّل والمقاس قبل النزول للماء.', 'Sources list kayaking and water activities; confirm operator-provided gear and fit before entering the water.', 'Les sources citent kayak et activités nautiques ; confirmez matériel fourni et taille avant l’eau.', '资料列出皮划艇和水上活动；下水前确认运营方装备和尺码。', 'स्रोत कयाक और जल गतिविधियाँ बताते हैं; पानी में जाने से पहले संचालक का सामान और फिट पूछें।'],
    sourceIds: ['uae-sir-bani-yas-kayaking', 'uae-sir-bani-yas-island-discovery'], coverage: 'local', destinationIds: ['sir-bani-yas'],
  },
  {
    id: 'uae-sir-bani-yas-sun-protection', version: 1, equipmentId: 'uae-sir-bani-yas-sun-protection',
    label: ['حماية شخصية من الشمس', 'Personal sun protection', 'Protection solaire personnelle', '个人防晒用品', 'व्यक्तिगत धूप सुरक्षा'],
    category: 'clothing', terrainIds: ['coast'], activities: ['cycling', 'walking', 'boating'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['الأنشطة المعلنة خارجية ومكشوفة؛ هذه نصيحة عامة وليست شرطاً محلياً، وتعدّل حسب التوقعات.', 'Advertised activities are outdoors and exposed; this is general advice, not a local requirement, adjusted to the forecast.', 'Les activités annoncées sont extérieures et exposées ; conseil général, non obligation locale, à adapter à la météo.', '公布活动在户外且暴露；这是一般建议，并非当地规定，请按预报调整。', 'बताई गतिविधियाँ बाहर और खुली हैं; यह सामान्य सलाह है, स्थानीय नियम नहीं, पूर्वानुमान से बदलें।'],
    sourceIds: ['uae-sir-bani-yas-island-discovery', 'uae-sir-bani-yas-warnings'], coverage: 'local', destinationIds: ['sir-bani-yas'],
  },
  {
    id: 'uae-sir-bani-yas-marine-forecast', version: 1, equipmentId: 'uae-sir-bani-yas-marine-forecast',
    label: ['فحص حالة البحر يوم الزيارة', 'Same-day marine condition check', 'Vérification maritime du jour', '当天海况核对', 'उसी दिन समुद्री स्थिति जाँच'],
    category: 'safety', terrainIds: ['coast'], activities: ['boating', 'swimming'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['قد لا يناسب البحر النشاط رغم صفاء السماء؛ راجع خدمة البحر والتنبيهات وأكد قرار المشغّل.', 'The sea may be unsuitable despite sunshine; review the marine service and warnings, then confirm the operator’s decision.', 'La mer peut être inadaptée malgré le soleil ; consultez service maritime et alertes, puis confirmez avec l’opérateur.', '即使晴朗，海况也可能不适合活动；查看海况服务和预警，并确认运营方决定。', 'धूप में भी समुद्र अनुपयुक्त हो सकता है; समुद्री सेवा और चेतावनी देखें, फिर संचालक से पुष्टि करें।'],
    sourceIds: ['uae-sir-bani-yas-marine-conditions', 'uae-sir-bani-yas-warnings'], coverage: 'local', destinationIds: ['sir-bani-yas'],
  },
];
