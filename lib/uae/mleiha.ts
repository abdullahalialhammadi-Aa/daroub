import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-mleiha-visit-city', title: 'Visit Sharjah · Mleiha City', url: 'https://www.visitsharjah.com/en/regions/central-region/mleiha/', reviewedAt },
  { id: 'uae-mleiha-national-park', title: 'Visit Sharjah · Mleiha National Park', url: 'https://www.visitsharjah.com/en/activities/adventure/mleiha-national-park/', reviewedAt },
  { id: 'uae-mleiha-jebel-faya', title: 'Visit Sharjah · Jebel Faya', url: 'https://www.visitsharjah.com/en/activities/heritage/jebel-faya/', reviewedAt },
  { id: 'uae-mleiha-biodiversity', title: 'Aletihad · Mleiha Park records 100+ species of flora, fauna in its habitat', url: 'https://en.aletihad.ae/news/culture/4580377/mleiha-park-records-100--species-of-flora--fauna-in-its-habi', reviewedAt },
  { id: 'uae-mleiha-weather-maps', title: 'National Center of Meteorology · Ghaith UAE Weather Maps', url: 'https://ghaith.ncm.gov.ae/?lang=en', reviewedAt },
  { id: 'uae-mleiha-drone-rules', title: 'General Civil Aviation Authority · UAS Registration', url: 'https://www.gcaa.gov.ae/en/pages/UASRegistration.aspx', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-mleiha-ghaf', coverage: 'local', sourceIds: ['uae-mleiha-biodiversity'],
    name: ['شجرة الغاف', 'Ghaf tree', 'Ghaf', '牧豆树', 'गाफ़ वृक्ष'],
    description: ['تسجل مراجعة التنوع الحيوي في مليحة الغاف ضمن النباتات المحلية التي تثبت التربة وتوفر موائل دقيقة في الصحراء.', 'Mleiha biodiversity reporting lists ghaf among native plants that stabilise soil and create small desert microhabitats.', 'Le bilan de biodiversité de Mleiha cite le ghaf parmi les plantes indigènes qui stabilisent le sol et créent de petits habitats désertiques.', '姆莱哈生物多样性资料把牧豆树列为本地植物，可稳固土壤并形成小型沙漠生境。', 'मलैहा की जैव विविधता सूचना में गाफ़ को स्थानीय पौधा बताया गया है, जो मिट्टी को थामता और छोटे रेगिस्तानी आवास बनाता है।'],
    precaution: ['لا تكسر الأغصان ولا تجمع الحطب؛ راقب الظل والحياة حول الشجرة من مسافة مناسبة.', 'Do not break branches or collect firewood; observe shade and wildlife around the tree from a respectful distance.', 'Ne cassez pas de branches et ne ramassez pas de bois ; observez l’ombre et la faune autour de l’arbre à distance.', '不要折枝或拾柴；请在适当距离观察树荫及周边生物。', 'टहनियाँ न तोड़ें और लकड़ी न लें; पेड़ की छाया और आसपास के जीवों को दूरी से देखें।'],
  },
  {
    id: 'uae-mleiha-arabian-red-fox', coverage: 'local', sourceIds: ['uae-mleiha-biodiversity'],
    name: ['الثعلب الأحمر العربي', 'Arabian red fox', 'Renard roux d’Arabie', '阿拉伯赤狐', 'अरबी लाल लोमड़ी'],
    description: ['تذكر مراجعة مليحة الثعلب الأحمر العربي بين الثدييات المتكيفة مع الصحراء داخل المتنزه.', 'Mleiha reporting identifies the Arabian red fox among desert-adapted mammals recorded in the park.', 'Le bilan de Mleiha mentionne le renard roux d’Arabie parmi les mammifères adaptés au désert dans le parc.', '姆莱哈资料记录阿拉伯赤狐为园区内适应沙漠的哺乳动物之一。', 'मलैहा की सूचना में अरबी लाल लोमड़ी को उद्यान में दर्ज रेगिस्तान-अनुकूल स्तनपायी बताया गया है।'],
    precaution: ['لا تطعم الثعالب ولا تترك الطعام مكشوفاً في المخيم؛ وجودها لا يضمن رؤيتها.', 'Do not feed foxes or leave food exposed at camp; a recorded presence does not guarantee sightings.', 'Ne nourrissez pas les renards et ne laissez pas de nourriture au camp ; leur présence signalée ne garantit aucune observation.', '不要投喂狐狸，营地食物不要外露；记录存在并不保证能看到。', 'लोमड़ियों को भोजन न दें और शिविर में खाना खुला न छोड़ें; दर्ज उपस्थिति देखने की गारंटी नहीं है।'],
  },
  {
    id: 'uae-mleiha-sand-gazelle', coverage: 'local', sourceIds: ['uae-mleiha-biodiversity'],
    name: ['غزال الرمال', 'Sand gazelle', 'Gazelle des sables', '沙瞪羚', 'रेतीला गज़ेल'],
    description: ['تسجل مراجعة مليحة غزال الرمال ضمن الثدييات الصحراوية في نطاق المتنزه المحمي.', 'The Mleiha assessment records sand gazelle among desert mammals in the protected park landscape.', 'L’évaluation de Mleiha cite la gazelle des sables parmi les mammifères du paysage désertique protégé.', '姆莱哈评估将沙瞪羚列为受保护沙漠景观中的哺乳动物。', 'मलैहा आकलन में रेतीले गज़ेल को संरक्षित रेगिस्तानी क्षेत्र के स्तनपायियों में दर्ज किया गया है।'],
    precaution: ['راقبها بهدوء من بعيد ولا تلاحقها بالمركبة أو سيراً؛ التزم بالمسار أو تعليمات المرشد.', 'Observe quietly from a distance and never pursue by vehicle or on foot; stay with the route or guide instructions.', 'Observez calmement à distance sans poursuite en véhicule ni à pied ; restez sur l’itinéraire ou avec le guide.', '请安静远观，不要驾车或步行追逐；遵守路线或向导指示。', 'दूरी से शांतिपूर्वक देखें और वाहन या पैदल पीछा न करें; मार्ग या गाइड के निर्देश मानें।'],
  },
  {
    id: 'uae-mleiha-arabian-horned-viper', coverage: 'local', sourceIds: ['uae-mleiha-biodiversity'],
    name: ['الأفعى المقرنة العربية', 'Arabian horned viper', 'Vipère à cornes d’Arabie', '阿拉伯角蝰', 'अरबी सींगदार वाइपर'],
    description: ['تذكر مراجعة مليحة الأفعى المقرنة العربية بين الزواحف الصحراوية؛ هذا إدراج خطر محتمل لا دعوة للبحث عنها.', 'Mleiha reporting lists the Arabian horned viper among desert reptiles; this is a hazard note, not a reason to search for it.', 'Le bilan de Mleiha cite la vipère à cornes d’Arabie parmi les reptiles du désert ; c’est une alerte, non une invitation à la chercher.', '姆莱哈资料列出阿拉伯角蝰等沙漠爬行动物；这是风险提示，不是寻找建议。', 'मलैहा सूचना में अरबी सींगदार वाइपर को रेगिस्तानी सरीसृप बताया गया है; यह जोखिम सूचना है, खोजने का कारण नहीं।'],
    precaution: ['لا تضع اليدين في الشقوق أو تحت الحجارة، واستخدم ضوءاً ليلاً، واطلب الإسعاف فوراً عند اللدغ.', 'Keep hands out of cracks and under stones, use a light at night, and call medical help immediately after a bite.', 'Ne mettez pas les mains dans les fissures ni sous les pierres, utilisez une lampe la nuit et appelez les secours après morsure.', '不要把手伸入裂缝或石下，夜间用灯；若被咬请立即求医。', 'दरारों या पत्थरों के नीचे हाथ न डालें, रात में रोशनी रखें, और काटने पर तुरंत चिकित्सा सहायता बुलाएँ।'],
  },
  {
    id: 'uae-mleiha-fat-tailed-scorpion', coverage: 'local', sourceIds: ['uae-mleiha-biodiversity'],
    name: ['العقرب العربي عريض الذيل', 'Arabian fat-tailed scorpion', 'Scorpion arabe à queue épaisse', '阿拉伯肥尾蝎', 'अरबी मोटी-पूँछ बिच्छू'],
    description: ['تسجل مراجعة مليحة هذا العقرب السام بين مفصليات الأرجل؛ قد يكون تحت الصخور أو قرب المخيمات.', 'Mleiha reporting records this venomous scorpion among arachnids; it may shelter under rocks or near camps.', 'Le bilan de Mleiha recense ce scorpion venimeux parmi les arachnides ; il peut s’abriter sous les pierres ou près des camps.', '姆莱哈资料记录这种有毒蝎子；它可能藏在石下或营地附近。', 'मलैहा सूचना में इस विषैले बिच्छू को दर्ज किया गया है; यह पत्थरों के नीचे या शिविरों के पास छिप सकता है।'],
    precaution: ['افحص الحذاء والحقيبة قبل الاستخدام، ولا تمش حافي القدمين ليلاً، واطلب المساعدة الطبية عند اللسع.', 'Check shoes and bags before use, avoid barefoot walking at night, and seek medical help after a sting.', 'Vérifiez chaussures et sacs avant usage, évitez de marcher pieds nus la nuit et consultez après piqûre.', '使用前检查鞋和包，夜间不要赤脚行走；被蜇后请就医。', 'जूते और बैग उपयोग से पहले देखें, रात में नंगे पैर न चलें, और डंक लगने पर चिकित्सा सहायता लें।'],
  },
];

export const destination: Destination & { country: typeof UAE } = {
  id: 'mleiha', country: UAE, terrainId: 'desert', terrainIndex: 0, lat: 25.1324, lon: 55.8605, timezone: UAE_TZ,
  names: ['مليحة', 'Mleiha', 'Mleiha', '姆莱哈', 'मलैहा'],
  summary: [
    'منطقة صحراوية وتراثية في الشارقة حول مركز مليحة، فوسل روك وجبل الفاية؛ خطط للحرارة والحجز المسبق.',
    'Sharjah desert and heritage area around Mleiha Archaeological Centre, Fossil Rock and Jebel Faya; plan for heat and booking.',
    'Zone désertique et patrimoniale de Sharjah autour du centre de Mleiha, de Fossil Rock et de Jebel Faya ; prévoyez chaleur et réservation.',
    '沙迦的沙漠与遗产区域，围绕姆莱哈考古中心、化石岩和法亚山；请为高温和预约做准备。',
    'शारजाह का रेगिस्तानी और विरासत क्षेत्र, मलैहा केंद्र, फॉसिल रॉक और जबल फाया के आसपास; गर्मी और बुकिंग की तैयारी करें।',
  ],
  image: '/images/desert.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-mleiha-visit-city', 'uae-mleiha-national-park', 'uae-mleiha-biodiversity'],
  species,
  sections: [
    section('place', [
      'تصف Visit Sharjah مليحة في المنطقة الوسطى وجهة تجمع الآثار والطبيعة والمغامرة، وتذكر مركز مليحة وفوسل روك وجبل الفاية. المؤشر هنا تقريبي لمنطقة المركز وفوسل روك، وليس بداية مسار؛ والصورة توضيحية. تحقق من حالة الموقع في يوم الزيارة.',
      'Visit Sharjah describes Mleiha in the Central Region as archaeology, nature and adventure around the centre, Fossil Rock and Jebel Faya. This is an approximate area marker for the centre and Fossil Rock, not a trailhead; the image is illustrative. Check site status on the day.',
      'Visit Sharjah présente Mleiha, dans la région centrale, comme un lieu d’archéologie, de nature et d’activités autour du centre, de Fossil Rock et de Jebel Faya. Le repère est approximatif, pas un départ de sentier ; image illustrative. Vérifiez le jour même.',
      '沙迦旅游资料将中部地区的姆莱哈描述为结合考古、自然和活动的地点，范围包括中心、化石岩和法亚山。此标记仅为中心和化石岩一带的近似位置，不是步道入口；图片为示意。请当天核实开放情况。',
      'शारजाह पर्यटन मलैहा को मध्य क्षेत्र में पुरातत्व, प्रकृति और गतिविधियों वाला स्थान बताता है, जिसमें केंद्र, फॉसिल रॉक और जबल फाया शामिल हैं। यह केंद्र और फॉसिल रॉक क्षेत्र का अनुमानित चिह्न है, पगडंडी आरंभ नहीं; चित्र संकेतात्मक है। उसी दिन स्थिति जाँचें।',
    ], ['uae-mleiha-visit-city', 'uae-mleiha-national-park']),
    section('equipment', [
      'استنتاج عملي: لأن الأنشطة المعلنة تشمل المشي والرحلات الصحراوية والتخييم، احمل ماءً احتياطياً وملاحة تعمل دون اتصال وهاتفاً مشحوناً. اسأل المشغّل عما يوفَّر في الجولة أو المخيم، ولا تفترض أن معدات المشي أو الإنقاذ مشمولة.',
      'Practical inference: because advertised activities include hiking, desert trips and camping, carry reserve water, offline navigation and a charged phone. Ask the operator what is supplied on a tour or camp, and do not assume walking or recovery equipment is included.',
      'Déduction pratique : les activités annoncées incluant marche, sorties désertiques et campement, emportez eau de réserve, navigation hors ligne et téléphone chargé. Demandez ce que fournit l’opérateur ; ne supposez pas que marche ou dépannage sont inclus.',
      '实用推断：公开活动包括徒步、沙漠行程和露营，请携带备用饮水、离线导航和充满电的手机。向运营方确认行程或营地提供哪些物品，不要默认包含徒步或救援装备。',
      'व्यावहारिक निष्कर्ष: घोषित गतिविधियों में पैदल चलना, रेगिस्तानी यात्रा और शिविर शामिल हैं, इसलिए अतिरिक्त पानी, बिना नेटवर्क चलने वाला मार्गदर्शन और भरा हुआ फोन रखें। संचालक से पूछें कि क्या दिया जाएगा; पैदल या बचाव सामान शामिल मानकर न चलें।',
    ], ['uae-mleiha-national-park', 'uae-mleiha-weather-maps']),
    section('clothing', [
      'نصيحة عامة وليست شرطاً محلياً: اختر ملابس تغطي الجلد وقبعة ونظارة شمسية، وحذاءً مغلقاً مناسباً للرمل والحصى حول فوسل روك. خذ طبقة خفيفة للمساء إذا كان برنامجك يمتد إلى مشاهدة النجوم أو المخيم، وراجع التوقعات في يومها.',
      'General advice, not a local requirement: use covering clothing, a hat, sunglasses and closed footwear suited to sand and gravel around Fossil Rock. Pack a light layer if your plan extends to stargazing or camp, and check the forecast on the day.',
      'Conseil général, non exigence locale : portez vêtements couvrants, chapeau, lunettes et chaussures fermées adaptées au sable et au gravier près de Fossil Rock. Ajoutez une couche légère pour l’observation nocturne ou le camp, puis vérifiez la météo.',
      '一般建议，并非当地规定：穿遮蔽衣物、戴帽子和太阳镜，并使用适合化石岩周边沙地与砾石的包脚鞋。若计划观星或露营，带一件轻便外层，并在当天查看预报。',
      'सामान्य सलाह, स्थानीय नियम नहीं: ढकने वाले कपड़े, टोपी, धूप का चश्मा और फॉसिल रॉक के रेत-कंकड़ के लिए बंद जूते पहनें। तारों का अवलोकन या शिविर हो तो हल्की परत रखें और उसी दिन मौसम देखें।',
    ], ['uae-mleiha-national-park', 'uae-mleiha-weather-maps']),
    section('transport', [
      'تذكر المصادر أن الزوار يستكشفون مليحة عبر تجارب موجهة ومغامرات صحراوية. استنتاج عملي: ثبت نقطة اللقاء والعودة مع المركز أو المشغّل قبل الانطلاق، ولا تعامل مؤشر الخريطة كطريق قيادة خارجية. قد تتغير الرمال والرؤية؛ تحقق في يوم الزيارة.',
      'Sources describe guided experiences and desert adventure in Mleiha. Practical inference: confirm the meeting point and return plan with the centre or operator before leaving, and do not treat the map marker as an off-road route. Sand and visibility can change; check on the day.',
      'Les sources décrivent des expériences guidées et des activités désertiques à Mleiha. Déduction pratique : confirmez rendez-vous et retour avec le centre ou l’opérateur, sans utiliser le repère comme piste tout-terrain. Sable et visibilité changent ; vérifiez le jour même.',
      '资料介绍姆莱哈有向导体验和沙漠活动。实用推断：出发前与中心或运营方确认集合点和返程安排，不要把地图标记当作越野路线。沙况和能见度会变化；请当天核实。',
      'स्रोत मलैहा में निर्देशित अनुभव और रेगिस्तानी गतिविधियाँ बताते हैं। व्यावहारिक निष्कर्ष: निकलने से पहले केंद्र या संचालक से मिलने और लौटने की योजना पक्की करें, और नक्शे के चिह्न को ऑफ-रोड मार्ग न मानें। रेत और दृश्यता बदल सकती है; उसी दिन जाँचें।',
    ], ['uae-mleiha-national-park', 'uae-mleiha-visit-city']),
    section('season', [
      'يتيح المركز الوطني للأرصاد خرائط طقس إماراتية محدثة. لا تترجم الخريطة العامة إلى ضمان محلي لفوسل روك؛ استخدمها مع توقعات اليوم، وقلل المشي المكشوف عند الحر أو الغبار أو ضعف الرؤية. أعد الحجز إذا أصبحت الظروف غير مناسبة.',
      'The National Center of Meteorology provides UAE weather maps. Do not treat a general map as a local guarantee for Fossil Rock; pair it with the day forecast and reduce exposed walking in heat, dust or poor visibility. Rebook if conditions are unsuitable.',
      'Le Centre national de météorologie fournit des cartes météo des Émirats. Ne les prenez pas pour une garantie locale à Fossil Rock ; comparez avec la prévision du jour et limitez la marche exposée en cas de chaleur, poussière ou faible visibilité. Reportez si besoin.',
      '国家气象中心提供阿联酋天气图。不要把总体地图视为化石岩当地保证；应结合当天预报，高温、扬尘或能见度差时减少暴露徒步。条件不合适时请改期。',
      'राष्ट्रीय मौसम केंद्र अमीरात के मौसम नक्शे देता है। सामान्य नक्शे को फॉसिल रॉक की स्थानीय गारंटी न मानें; उसी दिन के पूर्वानुमान के साथ देखें और गर्मी, धूल या कम दृश्यता में खुली पैदल यात्रा घटाएँ। स्थिति ठीक न हो तो बुकिंग बदलें।',
    ], ['uae-mleiha-weather-maps']),
    section('nature', [
      'تسجل مراجعة بيئية في مليحة أكثر من مئة نوع ضمن منظر صحراوي محمي، منها نباتات وثدييات وزواحف وطيور ولافقاريات. هذا يساعد على التخطيط للمشاهدة الهادئة، لكنه لا يضمن رؤية أي نوع. لا تجمع نباتات أو أحجاراً أو حفريات، وابق مع المرشد.',
      'An ecological assessment at Mleiha records more than one hundred species in a protected desert landscape, including plants, mammals, reptiles, birds and invertebrates. This supports quiet observation planning, not guaranteed sightings. Do not collect plants, stones or fossils; stay with the guide.',
      'Une évaluation écologique de Mleiha recense plus de cent espèces dans un paysage désertique protégé : plantes, mammifères, reptiles, oiseaux et invertébrés. Cela aide à préparer l’observation discrète, sans garantie. Ne prélevez ni plantes, ni pierres, ni fossiles ; restez avec le guide.',
      '姆莱哈生态评估记录了受保护沙漠景观中的一百多种物种，包括植物、哺乳动物、爬行动物、鸟类和无脊椎动物。这有助于安静观察的规划，但不保证能看到任何物种。不要采集植物、石块或化石，并跟随向导。',
      'मलैहा के पारिस्थितिक आकलन में संरक्षित रेगिस्तानी परिदृश्य में सौ से अधिक प्रजातियाँ दर्ज हैं, जिनमें पौधे, स्तनपायी, सरीसृप, पक्षी और अकशेरुकी हैं। यह शांत अवलोकन की योजना में मदद करता है, दर्शन की गारंटी नहीं। पौधे, पत्थर या जीवाश्म न लें; गाइड के साथ रहें।',
    ], ['uae-mleiha-biodiversity']),
    section('hazard', [
      'توجد صخور كلسية وكثبان ومناطق مكشوفة، وتسجل المصادر أفاعي وعقارب في بيئة مليحة. استنتاج عملي: لا تمش منفرداً بعيداً عن الجولة، وافحص الحذاء، واستعمل ضوءاً ليلاً. في الطوارئ داخل الإمارات اتصل بالشرطة 999 أو الإسعاف 998 أو الدفاع المدني 997.',
      'Limestone outcrops, dunes and exposed ground are present, and sources record vipers and scorpions in Mleiha. Practical inference: do not walk alone away from the tour, check footwear and use a light at night. In UAE emergencies call police 999, ambulance 998 or civil defence 997.',
      'Affleurements calcaires, dunes et terrain exposé sont présents, et les sources signalent vipères et scorpions à Mleiha. Déduction pratique : ne partez pas seul hors de la sortie, vérifiez vos chaussures et utilisez une lampe la nuit. En urgence aux Émirats : police 999, ambulance 998, défense civile 997.',
      '当地有石灰岩露头、沙丘和无遮蔽地面，资料记录姆莱哈有蝰蛇和蝎子。实用推断：不要独自离开团队行走，检查鞋履，夜间用灯。阿联酋紧急情况请拨警察999、救护998或民防997。',
      'यहाँ चूना-पत्थर की चट्टानें, टीले और खुला मैदान है, और स्रोत मलैहा में वाइपर व बिच्छू दर्ज करते हैं। व्यावहारिक निष्कर्ष: समूह से दूर अकेले न चलें, जूते जाँचें और रात में रोशनी रखें। अमीरात में आपातकाल पर पुलिस 999, एम्बुलेंस 998 या नागरिक रक्षा 997 पर कॉल करें।',
    ], ['uae-mleiha-national-park', 'uae-mleiha-biodiversity', 'uae-emergency']),
    section('visit', [
      'تذكر Visit Sharjah جولات أثرية موجهة، فوسل روك، مشياً ورحلات صحراوية وقيادة كثبان ودراجات رباعية ومخيماً أو تجربة تخييم مريحة. اختر نشاطاً أقصر إذا كانت خبرتك محدودة، وثبت الحجز والمدة وما يتأثر بالطقس قبل الدفع.',
      'Visit Sharjah lists guided archaeological tours, Fossil Rock, trekking, desert trips, dune bashing, quad bikes and camp or glamping advice. Choose a shorter operated activity if experience is limited, and confirm booking, duration and weather-dependent terms before paying.',
      'Visit Sharjah mentionne visites archéologiques guidées, Fossil Rock, marche, sorties désertiques, dunes, quads et conseils de campement ou hébergement aménagé. Si votre expérience est limitée, choisissez une activité encadrée courte et confirmez réservation, durée et conditions météo.',
      '沙迦旅游列出考古向导游、化石岩、徒步、沙漠行程、冲沙、四轮车，以及露营或舒适露营建议。经验有限时选择较短的运营活动；付款前确认预约、时长和受天气影响的条款。',
      'शारजाह पर्यटन निर्देशित पुरातत्व यात्रा, फॉसिल रॉक, पैदल यात्रा, रेगिस्तानी सफर, रेतीली ढलानों पर वाहन चलाना, चौपहिया बाइक और शिविर या आरामदेह शिविर सलाह बताता है। अनुभव कम हो तो छोटी संचालित गतिविधि चुनें, और भुगतान से पहले बुकिंग, अवधि व मौसम संबंधी शर्तें पक्की करें।',
    ], ['uae-mleiha-national-park']),
    section('rules', [
      'تتعامل المصادر مع مليحة كمنظر تراثي وطبيعي محمي، ومعظم الأنشطة المعلنة عبر المركز أو مشغّلين. استنتاج عملي: لا تدخل مواقع أثرية أو مناطق محمية خارج التعليمات، ولا تطلق طائرة من دون تسجيل وتصريح مناسبين. للتخييم أو التصوير تحقق من المركز في يومها.',
      'Sources present Mleiha as a protected heritage and nature landscape, and advertised activities are generally through the centre or operators. Practical inference: do not enter archaeological or protected areas outside instructions, and do not fly a drone without registration and proper authorisation. Check camping or filming rules with the centre on the day.',
      'Les sources présentent Mleiha comme un paysage patrimonial et naturel protégé, avec activités surtout via le centre ou des opérateurs. Déduction pratique : n’entrez pas dans les zones archéologiques ou protégées hors consignes, et ne faites pas voler de drone sans enregistrement ni autorisation. Vérifiez campement et tournage le jour même.',
      '资料将姆莱哈描述为受保护的遗产与自然景观，公开活动通常经中心或运营方安排。实用推断：不要在指示外进入考古或保护区域；无人机未登记并取得相应许可不得飞行。露营或拍摄规则请当天向中心核实。',
      'स्रोत मलैहा को संरक्षित विरासत और प्राकृतिक परिदृश्य बताते हैं, और घोषित गतिविधियाँ अधिकतर केंद्र या संचालकों से होती हैं। व्यावहारिक निष्कर्ष: निर्देशों से बाहर पुरातत्व या संरक्षित क्षेत्र में न जाएँ, और पंजीकरण व उचित अनुमति बिना ड्रोन न उड़ाएँ। शिविर या फिल्मांकन नियम उसी दिन केंद्र से जाँचें।',
    ], ['uae-mleiha-visit-city', 'uae-mleiha-national-park', 'uae-mleiha-drone-rules', 'uae-emergency']),
  ],
};

export const rules: PackingRule[] = [
  {
    id: 'uae-mleiha-reserve-water', version: 1, equipmentId: 'uae-mleiha-reserve-water', category: 'essentials', terrainIds: ['desert'], activities: ['walking', 'camping'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true, coverage: 'local', destinationIds: ['mleiha'], sourceIds: ['uae-mleiha-national-park', 'uae-mleiha-weather-maps'],
    label: ['ماء احتياطي للصحراء', 'Reserve desert water', 'Eau de réserve pour le désert', '沙漠备用饮水', 'रेगिस्तान के लिए अतिरिक्त पानी'],
    reason: ['مليحة تعرض أنشطة مشي وصحراء وتخييم في أرض مكشوفة؛ الكمية الدقيقة قرار رحلة، لذا احمل احتياطياً لكل شخص وراجع الطقس في اليوم نفسه.', 'Mleiha lists walking, desert and camping activities on exposed ground; exact quantity is trip-specific, so carry a reserve for each person and check weather that day.', 'Mleiha propose marche, désert et campement en terrain exposé ; la quantité dépend de la sortie, donc prévoyez une réserve par personne et vérifiez la météo.', '姆莱哈有徒步、沙漠和露营活动，地面无遮蔽；具体水量取决于行程，请每人带备用水并当天查天气。', 'मलैहा में खुली भूमि पर पैदल, रेगिस्तानी और शिविर गतिविधियाँ हैं; सही मात्रा यात्रा पर निर्भर है, इसलिए हर व्यक्ति के लिए अतिरिक्त पानी रखें और उसी दिन मौसम देखें।'],
  },
  {
    id: 'uae-mleiha-sun-cover', version: 1, equipmentId: 'uae-mleiha-sun-cover', category: 'clothing', terrainIds: ['desert'], activities: ['walking', 'camping'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true, coverage: 'local', destinationIds: ['mleiha'], sourceIds: ['uae-mleiha-national-park', 'uae-mleiha-weather-maps'],
    label: ['غطاء شمس وملابس ساترة', 'Sun cover and covering clothes', 'Protection solaire et vêtements couvrants', '遮阳用品和遮蔽衣物', 'धूप से बचाव और ढकने वाले कपड़े'],
    reason: ['الموقع صحراوي مكشوف حول فوسل روك وجبل الفاية؛ غطاء الرأس والملابس الساترة يقللان الانكشاف، لكنهما لا يغنيان عن تعديل الخطة حسب التوقعات.', 'The area is exposed desert around Fossil Rock and Jebel Faya; head cover and covering clothes reduce exposure but do not replace adjusting the plan to the forecast.', 'Le secteur est un désert exposé autour de Fossil Rock et Jebel Faya ; couvre-chef et vêtements couvrants limitent l’exposition sans remplacer l’adaptation à la météo.', '化石岩和法亚山周边是无遮蔽沙漠；遮阳帽和遮蔽衣物可减少暴露，但仍需按预报调整计划。', 'फॉसिल रॉक और जबल फाया के आसपास खुला रेगिस्तान है; सिर ढकना और ढकने वाले कपड़े जोखिम घटाते हैं, पर पूर्वानुमान के अनुसार योजना बदलना जरूरी है।'],
  },
  {
    id: 'uae-mleiha-light-and-closed-shoes', version: 1, equipmentId: 'uae-mleiha-light-and-closed-shoes', category: 'safety', terrainIds: ['desert'], activities: ['walking', 'camping'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true, coverage: 'local', destinationIds: ['mleiha'], sourceIds: ['uae-mleiha-biodiversity', 'uae-mleiha-national-park'],
    label: ['مصباح وحذاء مغلق', 'Light and closed shoes', 'Lampe et chaussures fermées', '照明和包脚鞋', 'रोशनी और बंद जूते'],
    reason: ['تسجل مصادر مليحة عقارب وأفاعي، وتذكر أنشطة مساء وتخييم؛ افحص الحذاء واستخدم ضوءاً في الظلام، خصوصاً قرب الصخور أو المخيم.', 'Mleiha sources record scorpions and vipers and describe evening or camping activities; check footwear and use a light in darkness, especially near rocks or camp.', 'Les sources de Mleiha recensent scorpions et vipères et décrivent soirées ou campement ; vérifiez les chaussures et utilisez une lampe, surtout près des rochers ou du camp.', '姆莱哈资料记录蝎子和蝰蛇，也有夜间或露营活动；请检查鞋履并在黑暗中用灯，尤其在岩石或营地附近。', 'मलैहा स्रोत बिच्छू और वाइपर दर्ज करते हैं और शाम या शिविर गतिविधियाँ बताते हैं; जूते जाँचें और अंधेरे में रोशनी रखें, खासकर चट्टानों या शिविर के पास।'],
  },
  {
    id: 'uae-mleiha-offline-navigation', version: 1, equipmentId: 'uae-mleiha-offline-navigation', category: 'safety', terrainIds: ['desert'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false, coverage: 'local', destinationIds: ['mleiha'], sourceIds: ['uae-mleiha-visit-city', 'uae-mleiha-national-park'],
    label: ['ملاحة دون اتصال ونقطة لقاء', 'Offline navigation and meeting point', 'Navigation hors ligne et rendez-vous', '离线导航和集合点', 'ऑफ़लाइन मार्गदर्शन और मिलने की जगह'],
    reason: ['الأنشطة في مليحة تمتد بين المركز وفوسل روك والكثبان؛ المؤشر ليس مساراً. احفظ نقطة اللقاء والعودة مع المشغّل قبل الخروج.', 'Mleiha activities extend between the centre, Fossil Rock and dunes; the marker is not a route. Save the meeting and return plan with the operator before leaving.', 'Les activités de Mleiha s’étendent entre centre, Fossil Rock et dunes ; le repère n’est pas un itinéraire. Enregistrez rendez-vous et retour avec l’opérateur avant le départ.', '姆莱哈活动分布在中心、化石岩和沙丘之间；标记不是路线。出发前保存与运营方约定的集合和返程安排。', 'मलैहा गतिविधियाँ केंद्र, फॉसिल रॉक और टीलों के बीच फैली हैं; चिह्न मार्ग नहीं है। निकलने से पहले संचालक के साथ मिलने और लौटने की योजना सहेजें।'],
  },
];

