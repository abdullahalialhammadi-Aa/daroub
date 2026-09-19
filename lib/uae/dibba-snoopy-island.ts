import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section, sectionOrder } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-dibba-snoopy-island-al-aqah', title: 'Fujairah Tourism · Al Aqah Beach', url: 'https://tourism.fujairah.ae/destinations/al-aqah-beach', reviewedAt },
  { id: 'uae-dibba-snoopy-island-dive-sandy', title: 'Sandy Beach Dive Academy · Snoopy Island', url: 'https://divesandy.com/snoopy-island', reviewedAt },
  { id: 'uae-dibba-snoopy-island-al-boom', title: 'Al Boom Diving · Snorkeling in Fujairah', url: 'https://www.alboomdiving.com/en/snorkeling-fujairah', reviewedAt },
  { id: 'uae-dibba-snoopy-island-divers-down', title: 'Divers Down UAE · Discover the Best Diving in Fujairah', url: 'https://www.diversdownuae.com/', reviewedAt },
  { id: 'uae-dibba-snoopy-island-ncm-marine', title: 'National Center of Meteorology · ALBAHAR', url: 'https://albahar.ncm.gov.ae/?lang=en', reviewedAt },
  { id: 'uae-dibba-snoopy-island-ncm-warnings', title: 'National Center of Meteorology · Early Warnings for All', url: 'https://ew4all.ncm.gov.ae/?lang=en', reviewedAt },
  { id: 'uae-dibba-snoopy-island-moccae-marine', title: 'Ministry of Climate Change and Environment · Marine environment and fisheries sustainability', url: 'https://www.moccae.gov.ae/en/knowledge/marine-environment-and-fisheries-sustainability', reviewedAt },
  { id: 'uae-dibba-snoopy-island-life-below-water', title: 'UAE Government portal · Life below water', url: 'https://u.ae/en/about-the-uae/leaving-no-one-behind/14lifebelowwater', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-dibba-snoopy-island-turtles', coverage: 'local',
    name: ['السلاحف الخضراء وصقرية المنقار', 'Green and hawksbill turtles', 'Tortues vertes et imbriquées', '绿海龟和玳瑁', 'हरी और हॉक्सबिल कछुए'],
    description: ['توثق صفحة مركز الغوص المحلي مشاهدة السلاحف الخضراء وصقرية المنقار حول الجزيرة. هذا لا يضمن رؤية في كل دخول إلى الماء.', 'The local dive-centre page records green and hawksbill turtles around the island. This does not guarantee a sighting on any water entry.', 'La page du centre de plongée local signale tortues vertes et imbriquées autour de l’île. Cela ne garantit aucune observation.', '当地潜水中心页面记录岛周有绿海龟和玳瑁。每次下水都不保证能够看到。', 'स्थानीय डाइव केंद्र पृष्ठ द्वीप के आसपास हरी और हॉक्सबिल कछुओं का उल्लेख करता है। हर बार दिखना निश्चित नहीं।'],
    precaution: ['راقب من مسافة ولا تطاردها أو تلمسها؛ اخرج إذا طلب المرشد ذلك.', 'Watch from a distance and do not chase or touch them; leave the water if the guide asks.', 'Observez à distance, sans poursuite ni contact ; sortez de l’eau si le guide le demande.', '保持距离观察，不追逐、不触碰；向导要求时离水。', 'दूरी से देखें, पीछा या स्पर्श न करें; गाइड कहे तो पानी से बाहर आएँ।'],
    sourceIds: ['uae-dibba-snoopy-island-dive-sandy'],
  },
  {
    id: 'uae-dibba-snoopy-island-reef-fish', coverage: 'local',
    name: ['أسماك الشعاب الملونة', 'Reef fish', 'Poissons de récif', '礁鱼', 'रीफ़ मछलियाँ'],
    description: ['تذكر المصادر أسماكاً مثل الببغائية والملائكية والمهرجة والفراشة والسنابر. هذه أمثلة مشاهدة لا مفتاح تعريف.', 'Sources list fish such as parrotfish, angelfish, clownfish, butterflyfish and snappers. These are sighting examples, not an identification key.', 'Les sources citent poissons-perroquets, anges, clowns, papillons et vivaneaux. Ce sont des exemples, pas une clé.', '资料列出鹦嘴鱼、神仙鱼、小丑鱼、蝶鱼和笛鲷等。这些只是示例，不是鉴定工具。', 'स्रोत पैरटफ़िश, एंजलफ़िश, क्लाउनफ़िश, बटरफ़्लाईफ़िश और स्नैपर बताते हैं। ये उदाहरण हैं, पहचान कुंजी नहीं।'],
    precaution: ['لا تطعم الأسماك أو تحاصرها للتصوير؛ ابق مع المجموعة والمسار المتفق عليه.', 'Do not feed fish or corner them for photographs; stay with the group and agreed route.', 'Ne nourrissez pas les poissons et ne les coincez pas pour une photo ; restez avec le groupe.', '不要投喂鱼类或为拍照围堵；留在队伍和约定路线内。', 'मछलियों को न खिलाएँ और फोटो के लिए न घेरें; समूह और तय मार्ग में रहें।'],
    sourceIds: ['uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-al-boom'],
  },
  {
    id: 'uae-dibba-snoopy-island-blacktip-reef-shark', coverage: 'local',
    name: ['قرش الشعاب ذو الطرف الأسود', 'Blacktip reef shark', 'Requin de récif à pointes noires', '黑鳍礁鲨', 'ब्लैकटिप रीफ़ शार्क'],
    description: ['توثق مصادر الغوص أسماك قرش شعاب حول الموقع. ذكرها لا يعني اقتراباً آمناً أو مشاهدة مضمونة.', 'Dive sources document reef sharks around the site. Their mention is not a safe approach cue or a guaranteed sighting.', 'Les sources de plongée signalent des requins de récif. Leur présence n’autorise pas l’approche et ne garantit rien.', '潜水资料记录该地点有礁鲨。提到它们不表示可以靠近，也不保证可见。', 'डाइव स्रोत स्थल के आसपास रीफ़ शार्क बताते हैं। यह पास जाने का संकेत या दिखने की गारंटी नहीं।'],
    precaution: ['حافظ على هدوئك واتبع المرشد؛ لا تلاحق القرش أو تحاول لمسه.', 'Stay calm and follow the guide; do not pursue the shark or try to touch it.', 'Restez calme et suivez le guide ; ne poursuivez pas le requin et ne le touchez pas.', '保持冷静并听从向导；不要追逐或试图触碰鲨鱼。', 'शांत रहें और गाइड की बात मानें; शार्क का पीछा या स्पर्श न करें।'],
    sourceIds: ['uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-al-boom'],
  },
  {
    id: 'uae-dibba-snoopy-island-rays', coverage: 'local',
    name: ['اللخمة والشفانين', 'Rays', 'Raies', '鳐鱼', 'रे मछलियाँ'],
    description: ['تذكر صفحات الغوص اللخمة ضمن الكائنات البحرية التي قد تُرى قرب سنوبي آيلاند أو ساحل الفجيرة.', 'Dive pages mention rays among marine creatures that may be seen near Snoopy Island or the Fujairah coast.', 'Les pages de plongée citent des raies parmi les espèces pouvant être vues près de Snoopy Island ou de Fujairah.', '潜水页面将鳐鱼列为可能在史努比岛或富查伊拉海岸附近看到的海洋生物。', 'डाइव पृष्ठ रे मछलियों को स्नूपी द्वीप या फ़ुजैरा तट के पास दिख सकने वाले जीवों में बताते हैं।'],
    precaution: ['لا تقف فوق كائن لا تراه جيداً في الرمل؛ اترك مجالاً للحركة ولا تلمس.', 'Do not stand on a poorly seen animal in sand; leave it room to move and do not touch.', 'Ne vous tenez pas sur un animal mal visible dans le sable ; laissez-lui de l’espace sans toucher.', '不要踩踏沙中看不清的生物；给它移动空间，不触碰。', 'रेत में ठीक से न दिख रहे जीव पर खड़े न हों; उसे जगह दें और न छुएँ।'],
    sourceIds: ['uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-divers-down'],
  },
  {
    id: 'uae-dibba-snoopy-island-hard-corals', coverage: 'local',
    name: ['الشعاب المرجانية الصلبة', 'Hard corals', 'Coraux durs', '硬珊瑚', 'कठोर कोरल'],
    description: ['تسجل مصادر الفجيرة وسنوبي آيلاند شعاباً مرجانية وكائنات تعتمد عليها. النص لا يحدد نوعاً علمياً.', 'Fujairah and Snoopy Island sources record coral reefs and dependent marine life. This note does not identify a scientific species.', 'Les sources de Fujairah et Snoopy Island signalent des récifs coralliens et leur faune. Aucune espèce scientifique n’est identifiée ici.', '富查伊拉和史努比岛资料记录有珊瑚礁及依赖它们的海洋生物。本条不鉴定科学物种。', 'फ़ुजैरा और स्नूपी द्वीप स्रोत कोरल रीफ़ और उनसे जुड़े समुद्री जीव बताते हैं। यहाँ वैज्ञानिक प्रजाति तय नहीं की गई।'],
    precaution: ['لا تقف على المرجان أو تكسره أو تأخذ قطعاً منه؛ الطفو الهادئ أهم من الصورة.', 'Do not stand on, break or collect coral; controlled buoyancy matters more than a photograph.', 'Ne marchez pas sur le corail, ne le cassez pas et n’en prélevez rien ; la flottabilité prime sur la photo.', '不要站在珊瑚上、折断或采集；稳定浮力比照片更重要。', 'कोरल पर खड़े न हों, न तोड़ें या लें; फोटो से अधिक नियंत्रित तैरना ज़रूरी है।'],
    sourceIds: ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-moccae-marine'],
  },
  {
    id: 'uae-dibba-snoopy-island-jellyfish', coverage: 'terrain-example',
    name: ['قناديل البحر', 'Jellyfish', 'Méduses', '水母', 'जेलीफ़िश'],
    description: ['مثال احترازي ساحلي: لم توثق المصادر المقروءة نوعاً محلياً محدداً هنا، لكن التحذيرات البحرية قد تتغير يومياً.', 'General coastal precaution example: the fetched sources did not document a local species here, but marine warnings can change daily.', 'Exemple côtier de prudence : les sources lues ne citent pas d’espèce locale, mais les alertes maritimes changent chaque jour.', '一般海岸防范示例：已读来源未记录此地具体水母种类，但海上预警可能每天变化。', 'सामान्य तटीय सावधानी: पढ़े स्रोत यहाँ स्थानीय प्रजाति नहीं बताते, पर समुद्री चेतावनी रोज़ बदल सकती है।'],
    precaution: ['استنتاج عملي: اسأل المشغّل عن اللسعات أو الرايات قبل النزول، واخرج عند أي تنبيه.', 'Practical inference: ask the operator about stings or flags before entering, and leave at any warning.', 'Déduction pratique : demandez à l’opérateur les piqûres ou drapeaux avant l’eau, et sortez à toute alerte.', '实用推断：下水前询问运营方是否有蜇伤或旗帜提示，遇到警示即离水。', 'व्यावहारिक अनुमान: उतरने से पहले डंक या झंडों के बारे में संचालक से पूछें, चेतावनी पर बाहर आएँ।'],
    sourceIds: ['uae-dibba-snoopy-island-ncm-marine', 'uae-dibba-snoopy-island-ncm-warnings'],
  },
];

const sections = [
  section('place', [
    'ساحل دبا الفجيرة عند العقة يواجه خليج عُمان، وتقع سنوبي آيلاند قبالة الشاطئ قرب منتجع ساندي بيتش. تؤكد السياحة المحلية وجود شعاب مرجانية وحياة بحرية للغوص والسباحة السطحية. المؤشر تقريبي لمنطقة الساحل والجزيرة، وليس رأس مسار أو نقطة سباحة آمنة بحد ذاته؛ الصورة توضيحية.',
    'Dibba Al Fujairah shore at Al Aqah faces the Gulf of Oman, with Snoopy Island just off the beach near Sandy Beach Resort. Local tourism records coral reefs and marine life for diving and snorkelling. The marker is an approximate area marker, not a trailhead or a safe swim point by itself; the image is illustrative.',
    'Le rivage de Dibba Al Fujairah à Al Aqah fait face au golfe d’Oman, avec Snoopy Island au large près de Sandy Beach Resort. Le tourisme local signale récifs coralliens, plongée et snorkeling. Le repère est approximatif, ni départ de sentier ni point de baignade sûr en soi ; image illustrative.',
    '富查伊拉迪巴的阿卡海岸面向阿曼湾，史努比岛位于桑迪海滩度假村附近离岸处。当地旅游资料记录这里有珊瑚礁和适合潜水、浮潜的海洋生物。标记仅示海岸和小岛大致区域，本身不是步道起点或安全游泳点；图片为示意。请把这里当作需要当天核对的海岸活动区，而不是固定路线；到达后按预订入口、现场标识、海况和运营方说明重新确认。若浪、风、能见度或人流与计划不同，就缩短活动或改为岸上观察。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。',
    'दिब्बा अल फ़ुजैरा का अल अक़ा तट ओमान की खाड़ी की ओर है, और स्नूपी द्वीप सैंडी बीच रिज़ॉर्ट के पास तट से दूर है। स्थानीय पर्यटन कोरल रीफ़ और डाइविंग-स्नॉर्कलिंग जीवन बताता है। चिह्न अनुमानित क्षेत्र है, पगडंडी या सुरक्षित तैराकी बिंदु नहीं; चित्र उदाहरणात्मक है।',
  ], ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy']),
  section('equipment', [
    'استنتاج عملي: جهّز القناع والسنوركل والزعانف أو أكّد أنها مشمولة مع المشغّل؛ بعض الرحلات تعلن توفير معدات كاملة. احمل ماءً، حماية للشمس، وحافظة مقاومة للماء للهاتف والمفاتيح. لا تجعل وجود معدات مؤجرة دليلاً على ملاءمة البحر؛ قرار النزول يتبع حالة اليوم والمرشد.',
    'Practical inference: prepare mask, snorkel and fins, or confirm they are included; some operator trips state that full gear is provided. Carry water, sun protection and a waterproof pouch for phone and keys. Rental gear is not proof that the sea is suitable; entry depends on same-day conditions and the guide.',
    'Déduction pratique : prévoyez masque, tuba et palmes, ou confirmez leur inclusion ; certaines sorties annoncent tout le matériel. Emportez eau, protection solaire et pochette étanche. Le matériel loué ne prouve pas que la mer convient ; l’entrée dépend du jour et du guide.',
    '实用推断：准备面镜、呼吸管和脚蹼，或确认运营方是否包含；部分行程说明提供全套装备。携带饮水、防晒和手机钥匙防水袋。可租装备不等于海况适合，下水取决于当天条件和向导判断。出发前还应确认尺码、集合时间、保管物品的位置和退出方式。若装备不合身、镜片漏水或脚蹼磨脚，应先更换，不要为了赶时间继续下水；新手宜选择有人带领的短时活动。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。',
    'व्यावहारिक अनुमान: मास्क, स्नॉर्कल और फ़िन रखें या पुष्टि करें कि शामिल हैं; कुछ संचालक पूरी सामग्री देते हैं। पानी, धूप से बचाव और फोन-चाबी के लिए जलरोधी थैली रखें। किराये का सामान समुद्र उपयुक्त होने का प्रमाण नहीं; प्रवेश उसी दिन की दशा और गाइड पर निर्भर है।',
  ], ['uae-dibba-snoopy-island-al-boom', 'uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-ncm-marine']),
  section('clothing', [
    'نصيحة عامة وليست شرطاً محلياً: استخدم لباس سباحة محتشماً مناسباً للمكان، وقميص حماية من الشمس أو بدلة خفيفة عند السباحة السطحية، وصندلاً ثابتاً للرمل والصخور الحارة. لرحلات الغوص اتبع قياس البدلة الذي يقرره المركز، وخذ قطعة جافة للعودة في السيارة ولا تعتمد على منشفة الشاطئ وحدها.',
    'General advice, not a local requirement: use swimwear suitable for the setting, plus a rash vest or light suit for snorkelling and stable sandals for hot sand and rocks. For dive trips, follow the centre’s wetsuit sizing, and keep a dry layer for the return vehicle.',
    'Conseil général, pas une exigence locale : portez une tenue de bain adaptée au lieu, un haut anti-UV ou une combinaison légère pour le snorkeling, et des sandales stables sur sable et rochers chauds. En plongée, suivez la taille indiquée par le centre et gardez du sec pour le retour.',
    '一般建议，并非当地规定：穿适合场所的泳装，浮潜时加防晒泳衣或轻薄潜水服，在热沙和岩石上穿稳固凉鞋。潜水行程按中心确定潜水服尺码，并为返程车辆准备干衣。避免只穿容易脱落的拖鞋在岩石边行走；上岸后风和空调会让湿衣不舒适。若使用租赁潜水服或救生装备，先检查拉链、贴合度和活动范围，再按工作人员安排更衣。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。保守处理比临时加码更安全。',
    'सामान्य सलाह, स्थानीय नियम नहीं: स्थान के अनुकूल तैराकी वस्त्र, स्नॉर्कलिंग में धूप-रोधी ऊपरी कपड़ा या हल्का सूट, और गर्म रेत-पत्थर के लिए स्थिर सैंडल पहनें। डाइव यात्रा में केंद्र का सूट आकार मानें और वापसी वाहन के लिए सूखा कपड़ा रखें, क्योंकि गीले कपड़े हवा या वाहन में असुविधा दे सकते हैं।',
  ], ['uae-dibba-snoopy-island-al-boom', 'uae-dibba-snoopy-island-dive-sandy']),
  section('transport', [
    'تصف صفحة العقة الشاطئ بأنه محاط بمنتجعات وفنادق ذات شواطئ خاصة، وتعرض مراكز الغوص رحلات من الساحل. خطط للوصول بالسيارة أو بسيارة أجرة إلى نقطة الحجز أو المدخل العام المسموح، لا إلى الإحداثيات. أكّد موقف السيارة، الدخول، ووقت العودة قبل أن تترك أغراضك.',
    'The Al Aqah page describes resorts and hotels with private beaches, while dive centres run trips from the coast. Plan to arrive by car or taxi at your booked meeting point or a permitted public access, not at the coordinates. Confirm parking, entry and return time before leaving belongings behind.',
    'La page d’Al Aqah décrit des hôtels et complexes avec plages privées, et les centres de plongée partent du littoral. Arrivez en voiture ou taxi au rendez-vous réservé ou à un accès public autorisé, pas aux coordonnées. Confirmez stationnement, entrée et retour avant de laisser vos affaires.',
    '阿卡页面说明周边有带私人海滩的酒店和度假村，潜水中心从海岸组织行程。请驾车或乘出租车到预订集合点或允许的公共入口，不要只按坐标抵达。离开物品前确认停车、入场和返程时间。度假村通道、日票或公共海滩入口可能有不同规则，不能用看到小岛来判断可以下水。若参加潜水或浮潜，预留登记、试装备和听简报时间，并提前安排返程车辆。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。保守处理比临时加码更安全。',
    'अल अक़ा पृष्ठ निजी समुद्र तट वाले होटल और रिज़ॉर्ट बताता है, और डाइव केंद्र तट से यात्राएँ चलाते हैं। कार या टैक्सी से बुक मिलन-बिंदु या अनुमत सार्वजनिक प्रवेश पर जाएँ, निर्देशांक पर नहीं। सामान छोड़ने से पहले पार्किंग, प्रवेश और वापसी समय पूछें, और वापसी वाहन पहले से तय रखें।',
  ], ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy']),
  section('season', [
    'المركز الوطني للأرصاد يوفّر خدمة بحرية وتنبيهات، ومصادر الغوص تذكر أن الرؤية والملاءمة تتغيران مع الطقس وحالة البحر. لا تعني السماء الصافية أن السباحة السطحية آمنة. تحقق في يوم الزيارة من البحر والرياح، ثم دع المشغّل يؤكد إن كان القارب أو الدخول من الشاطئ سيستمر.',
    'The National Center of Meteorology provides a marine service and warnings, and dive sources note that visibility and suitability vary with weather and sea state. Sunshine does not mean snorkelling is safe. Check sea and wind on the visit day, then let the operator confirm whether boat or shore entry can proceed.',
    'Le Centre national de météorologie publie service maritime et alertes, et les sources de plongée indiquent que visibilité et convenance varient avec météo et mer. Le soleil ne rend pas le snorkeling sûr. Vérifiez mer et vent le jour même, puis laissez l’opérateur confirmer bateau ou entrée depuis la plage.',
    '国家气象中心提供海况服务和预警，潜水资料也说明能见度和适宜性会随天气、海况变化。晴天不等于浮潜安全。请在当天核对海况和风，再由运营方确认船只或岸边下水是否继续。海面看似平静时，流、浪、船只和水下能见度仍可能改变计划。若发布预警，或工作人员认为条件不适合，应接受改期、改活动或取消；不要把长期季节描述当作当天保证。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。保守处理比临时加码更安全。',
    'राष्ट्रीय मौसम केंद्र समुद्री सेवा और चेतावनी देता है, और डाइव स्रोत बताते हैं कि दृश्यता व उपयुक्तता मौसम और समुद्र से बदलती है। धूप का मतलब सुरक्षित स्नॉर्कलिंग नहीं। यात्रा के दिन समुद्र और हवा जाँचें, फिर संचालक से नाव या किनारे से प्रवेश की पुष्टि लें।',
  ], ['uae-dibba-snoopy-island-ncm-marine', 'uae-dibba-snoopy-island-ncm-warnings', 'uae-dibba-snoopy-island-dive-sandy']),
  section('nature', [
    'تسجل المصادر المحلية سلاحفاً وأسماك شعاب وقروش شعاب سوداء الطرف ولخماً وشعاباً صلبة حول سنوبي آيلاند وساحل الفجيرة. القائمة أدناه أمثلة موثقة لا جرد كامل ولا وعد مشاهدة. استخدم الدليل للتعرف العام فقط، ولا تلمس الكائنات أو تجمع المرجان أو الأصداف، واترك الحكم النهائي للمرشد المختص.',
    'Local sources record turtles, reef fish, blacktip reef sharks, rays and hard corals around Snoopy Island and the Fujairah coast. The list below is documented examples, not a full inventory or a sighting promise. Use it for broad recognition only; do not touch animals or collect coral or shells.',
    'Les sources locales signalent tortues, poissons de récif, requins à pointes noires, raies et coraux durs autour de Snoopy Island et de Fujairah. La liste donne des exemples documentés, sans inventaire complet ni promesse. Servez-vous-en seulement pour reconnaître, sans toucher ni collecter.',
    '当地资料记录史努比岛和富查伊拉海岸有海龟、礁鱼、黑鳍礁鲨、鳐鱼和硬珊瑚。下列清单是有出处的示例，不是完整名录或目击承诺。仅作概括认识，不触碰动物，不采集珊瑚或贝壳。水下识别容易受光线、能见度和距离影响，照片也可能误导。若想确认物种，请让潜水向导或合格资料判断；普通游客应把重点放在保持距离、控制浮力和不干扰栖息地。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。保守处理比临时加码更安全。',
    'स्थानीय स्रोत स्नूपी द्वीप और फ़ुजैरा तट के आसपास कछुए, रीफ़ मछली, ब्लैकटिप रीफ़ शार्क, रे और कठोर कोरल बताते हैं। नीचे की सूची दर्ज उदाहरण है, पूरी सूची या देखने का वादा नहीं। इसे सामान्य पहचान तक रखें; जीवों को न छुएँ और कोरल या सीप न लें, और पहचान के लिए गाइड की बात मानें।',
  ], ['uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-al-boom', 'uae-dibba-snoopy-island-moccae-marine']),
  section('hazard', [
    'المخاطر هنا مرتبطة بالماء والصخور والحياة البحرية وحركة القوارب. استنتاج عملي: ادخل مع رفيق أو مرشد، ابق خارج منطقة القوارب، ولا تسبح حول الجزيرة إذا تغيرت الرؤية أو الموج أو ظهرت لسعات. للطوارئ في الإمارات: الشرطة 999، الإسعاف 998، الدفاع المدني 997.',
    'Hazards are water, rocks, marine life and boat movement. Practical inference: enter with a buddy or guide, stay out of boat areas, and do not swim around the island if visibility, waves or stings change. UAE emergencies: police 999, ambulance 998, civil defence 997.',
    'Les risques concernent l’eau, les rochers, la vie marine et les bateaux. Déduction pratique : entrez avec un binôme ou guide, restez hors des zones de bateau et ne contournez pas l’île si visibilité, vagues ou piqûres changent. Urgences UAE : police 999, ambulance 998, défense civile 997.',
    '风险来自海水、岩石、海洋生物和船只活动。实用推断：与同伴或向导下水，避开船只区域；若能见度、浪况或蜇伤情况变化，不要绕岛游。阿联酋紧急电话：警察999、救护998、民防997。下水前约定返回信号和最晚返回时间，避免单独追逐海龟或鱼群。若脚下看不清，不要站到珊瑚或沙中生物上；若出现疲劳、抽筋、刺痛或方向感变差，应立即返回岸边或船边。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。',
    'जोखिम पानी, पत्थर, समुद्री जीव और नावों से हैं। व्यावहारिक अनुमान: साथी या गाइड के साथ उतरें, नाव क्षेत्र से दूर रहें, और दृश्यता, लहर या डंक बदलें तो द्वीप के चारों ओर न तैरें। UAE आपातकाल: पुलिस 999, एम्बुलेंस 998, सिविल डिफेन्स 997। थकान या दर्द हो तो तुरंत बाहर आएँ।',
  ], ['uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-ncm-marine', 'uae-dibba-snoopy-island-ncm-warnings', 'uae-emergency']),
  section('visit', [
    'لأول زيارة، اختر نشاطاً واحداً واضحاً: سباحة سطحية مرافقة من الشاطئ أو رحلة غوص مع مركز معتمد. تؤكد المصادر وجود غوص وسباحة سطحية في العقة وسنوبي آيلاند، لكنها لا تضمن التنفيذ يومياً. احجز، ثم أعد التأكيد على الوقت، المعدات، مستوى السباحة المطلوب، وحالة البحر.',
    'For a first visit, choose one clear activity: guided shore snorkelling or a dive trip with a recognised centre. Sources confirm diving and snorkelling at Al Aqah and Snoopy Island, but not daily operation. Book, then reconfirm timing, equipment, required swim ability and sea state.',
    'Pour une première visite, choisissez une activité claire : snorkeling encadré depuis la plage ou plongée avec un centre reconnu. Les sources confirment plongée et snorkeling à Al Aqah et Snoopy Island, sans fonctionnement garanti chaque jour. Réservez puis reconfirmez heure, matériel, niveau de nage et mer.',
    '首次到访请选择一个明确活动：有陪同的岸边浮潜，或与认可中心进行潜水行程。资料确认阿卡和史努比岛有潜水、浮潜，但不保证每天执行。预订后再确认时间、装备、所需游泳能力和海况。若同行者经验不同，按最弱游泳者安排，不要同时追求绕岛、拍照和长时间停留。也可把计划改为海滩观察或短时入水，让运营方说明何时必须结束活动。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。保守处理比临时加码更安全。',
    'पहली यात्रा में एक स्पष्ट गतिविधि चुनें: गाइड के साथ किनारे से स्नॉर्कलिंग या मान्य केंद्र के साथ डाइव यात्रा। स्रोत अल अक़ा और स्नूपी द्वीप पर डाइविंग-स्नॉर्कलिंग बताते हैं, रोज़ संचालन की गारंटी नहीं। बुक करें, फिर समय, सामान, तैराकी क्षमता और समुद्र की पुष्टि करें।',
  ], ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-al-boom']),
  section('rules', [
    'لا تعامل الشاطئ أو الجزيرة كمنطقة مفتوحة بلا شروط: اتبع قواعد المنتجع أو المدخل العام، والرايات أو تعليمات المنقذ حيث تُعرض. تحمي الدولة البيئة البحرية بالتنظيم والمناطق المحمية؛ لذلك لا تلمس المرجان أو السلاحف ولا تجمع كائنات. احتفظ بأرقام الطوارئ الإماراتية، وتحقق من التنبيهات البحرية يوم الزيارة.',
    'Do not treat the beach or island as an unrestricted area: follow resort or public-access rules, and any flags or lifeguard instructions where displayed. The UAE regulates and protects the marine environment through laws and protected areas, so do not touch corals or turtles or collect organisms. Keep emergency numbers and check marine warnings on the day.',
    'Ne considérez pas la plage ou l’île comme libre de conditions : suivez les règles du complexe ou de l’accès public, ainsi que drapeaux et consignes de sauveteur lorsqu’ils existent. Les UAE protègent le milieu marin par lois et aires protégées ; ne touchez ni coraux ni tortues et ne collectez rien. Gardez les urgences et vérifiez les alertes.',
    '不要把海滩或小岛视为无限制区域：遵守度假村或公共入口规则，并遵循现场旗帜或救生员指示。阿联酋通过法规和保护区管理海洋环境，因此不要触碰珊瑚或海龟，也不要采集生物。保存紧急电话，并在当天查看海上预警。若入口、日票、停车、船只或水上运动区域有额外条件，应以现场公布为准。没有看到救生员或旗帜时，不应自行降低标准；应向运营方确认可进入的范围。计划时请把最近预报、现场牌示和工作人员说明一起核对；若信息不一致，选择更保守方案，减少下水时间，并把岸上等候点、集合点和返程方式告知同行者。不要把社交媒体照片当作通行或安全证明。',
    'समुद्र तट या द्वीप को बिना शर्त खुला क्षेत्र न मानें: रिज़ॉर्ट या सार्वजनिक प्रवेश नियम, और जहाँ हों वहाँ झंडे या लाइफ़गार्ड निर्देश मानें। UAE कानूनों और संरक्षित क्षेत्रों से समुद्री पर्यावरण बचाता है; इसलिए कोरल या कछुए न छुएँ और जीव न लें। आपात नंबर रखें और उसी दिन समुद्री चेतावनी देखें।',
  ], ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-moccae-marine', 'uae-dibba-snoopy-island-life-below-water', 'uae-dibba-snoopy-island-ncm-warnings', 'uae-emergency']),
];

if (sections.map(({ id }) => id).join('|') !== sectionOrder.join('|')) throw new Error('Unexpected section order');

export const destination = {
  id: 'dibba-snoopy-island', country: UAE, terrainId: 'coast', terrainIndex: 3, lat: 25.4927, lon: 56.3639, timezone: UAE_TZ,
  names: ['شاطئ دبا الفجيرة وسنوبي آيلاند', 'Dibba Al Fujairah shore and Snoopy Island', 'Rivage de Dibba Al Fujairah et Snoopy Island', '迪巴富查伊拉海岸与史努比岛', 'दिब्बा अल फ़ुजैरा तट और स्नूपी द्वीप'],
  summary: ['ساحل العقة قبالة خليج عُمان مع سباحة سطحية وغوص حول سنوبي آيلاند؛ تحقق من البحر والمشغّل في اليوم نفسه.', 'Al Aqah coast on the Gulf of Oman, with snorkelling and diving around Snoopy Island; check sea state and operator on the day.', 'Côte d’Al Aqah sur le golfe d’Oman, snorkeling et plongée autour de Snoopy Island ; vérifiez mer et opérateur le jour même.', '阿曼湾阿卡海岸，可在史努比岛周边浮潜和潜水；当天核对海况与运营方。', 'ओमान की खाड़ी पर अल अक़ा तट, स्नूपी द्वीप के आसपास स्नॉर्कलिंग और डाइविंग; उसी दिन समुद्र और संचालक जाँचें।'],
  image: '/images/coast.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy', 'uae-dibba-snoopy-island-ncm-marine', 'uae-dibba-snoopy-island-moccae-marine'],
  species,
  sections,
} satisfies Destination & { country: typeof UAE };

export const rules: PackingRule[] = [
  {
    id: 'uae-dibba-snoopy-island-mask-snorkel-fins', version: 1, equipmentId: 'uae-dibba-snoopy-island-mask-snorkel-fins',
    label: ['تأكيد القناع والسنوركل والزعانف', 'Mask, snorkel and fins confirmation', 'Confirmation masque, tuba et palmes', '面镜呼吸管脚蹼确认', 'मास्क, स्नॉर्कल और फ़िन पुष्टि'],
    category: 'essentials', terrainIds: ['coast'], activities: ['swimming'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['تعلن بعض رحلات الفجيرة توفير معدات السباحة السطحية؛ أكّد المقاس قبل النزول.', 'Some Fujairah snorkelling trips state that gear is provided; confirm fit before entering.', 'Certaines sorties de snorkeling à Fujairah indiquent fournir le matériel ; confirmez la taille avant l’eau.', '部分富查伊拉浮潜行程说明提供装备；下水前确认尺码。', 'कुछ फ़ुजैरा स्नॉर्कलिंग यात्राएँ सामान देती हैं; उतरने से पहले फिट पूछें।'],
    sourceIds: ['uae-dibba-snoopy-island-al-boom'], coverage: 'local', destinationIds: ['dibba-snoopy-island'],
  },
  {
    id: 'uae-dibba-snoopy-island-waterproof-pouch', version: 1, equipmentId: 'uae-dibba-snoopy-island-waterproof-pouch',
    label: ['حافظة مقاومة للماء', 'Waterproof pouch', 'Pochette étanche', '防水袋', 'जलरोधी थैली'],
    category: 'essentials', terrainIds: ['coast'], activities: ['swimming', 'boating'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['الزيارة تجمع شاطئاً وماءً ومراكز حجز؛ احمِ الهاتف والمفاتيح وتفاصيل الحجز.', 'The visit combines beach, water and booked operators; protect phone, keys and booking details.', 'La visite combine plage, eau et opérateurs réservés ; protégez téléphone, clés et réservation.', '行程包含海滩、水域和预约运营方；保护手机、钥匙和预订信息。', 'यात्रा में तट, पानी और बुक संचालक हैं; फोन, चाबी और बुकिंग विवरण बचाएँ।'],
    sourceIds: ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-dive-sandy'], coverage: 'local', destinationIds: ['dibba-snoopy-island'],
  },
  {
    id: 'uae-dibba-snoopy-island-rash-vest', version: 1, equipmentId: 'uae-dibba-snoopy-island-rash-vest',
    label: ['قميص سباحة للحماية من الشمس', 'Sun-protective swim top', 'Haut de nage anti-UV', '防晒泳衣上装', 'धूप-रोधी तैराकी ऊपरी कपड़ा'],
    category: 'clothing', terrainIds: ['coast'], activities: ['swimming'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['نشاط السباحة السطحية مكشوف على ساحل الفجيرة؛ هذه نصيحة عامة تعدّل حسب الطقس.', 'Snorkelling is exposed on the Fujairah coast; this is general advice adjusted to weather.', 'Le snorkeling expose au soleil sur la côte de Fujairah ; conseil général à adapter à la météo.', '富查伊拉海岸浮潜暴露在阳光下；这是按天气调整的一般建议。', 'फ़ुजैरा तट पर स्नॉर्कलिंग खुली धूप में है; यह मौसम से बदली जाने वाली सामान्य सलाह है।'],
    sourceIds: ['uae-dibba-snoopy-island-al-aqah', 'uae-dibba-snoopy-island-ncm-warnings'], coverage: 'local', destinationIds: ['dibba-snoopy-island'],
  },
  {
    id: 'uae-dibba-snoopy-island-marine-condition-check', version: 1, equipmentId: 'uae-dibba-snoopy-island-marine-condition-check',
    label: ['فحص حالة البحر يوم الزيارة', 'Same-day marine condition check', 'Vérification maritime du jour', '当天海况核对', 'उसी दिन समुद्री स्थिति जाँच'],
    category: 'safety', terrainIds: ['coast'], activities: ['swimming', 'boating'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['قد تتغير الرؤية والرياح والموج؛ راجع خدمة البحر والتنبيهات واترك القرار للمشغّل.', 'Visibility, wind and waves can change; review marine services and warnings, then defer to the operator.', 'Visibilité, vent et vagues changent ; consultez service maritime et alertes, puis suivez l’opérateur.', '能见度、风和海浪会变化；查看海况服务和预警，并听从运营方。', 'दृश्यता, हवा और लहर बदल सकती हैं; समुद्री सेवा और चेतावनी देखें, फिर संचालक का निर्णय मानें।'],
    sourceIds: ['uae-dibba-snoopy-island-ncm-marine', 'uae-dibba-snoopy-island-ncm-warnings'], coverage: 'local', destinationIds: ['dibba-snoopy-island'],
  },
];
