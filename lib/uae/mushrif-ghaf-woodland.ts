import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-mushrif-ghaf-woodland-dm-hub', title: 'Dubai Municipality · Mushrif Hub launched in Mushrif National Park', url: 'https://www.dm.gov.ae/mushrif-hub-launched-in-mushrif-national-park/', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-visit-dubai', title: 'Visit Dubai · Mushrif Park', url: 'https://www.visitdubai.com/en/places-to-visit/mushrif-national-park', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-ticket-kiosk', title: 'Dubai Public Parks · Mushrif general entry ticket', url: 'https://pksk.dubaipublicparks.ae/DubaiParks/Index?node=MushrifGE&wrkstn=8D97D08C-366C-687B-4039-018BDE0B1A6C', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-ghaf-tree', title: 'Environment Agency Abu Dhabi · Ghaf Tree', url: 'https://www.ead.gov.ae/en/discover-our-biodiversity/plants/ghaf-tree', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-ncm', title: 'National Center of Meteorology · National Center of Meteorology', url: 'https://www.ncm.gov.ae/?lang=en', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-uae-birding', title: 'UAE Birding · Mushrif NP', url: 'https://www.uaebirding.com/mushrif-np', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-desert-hedgehog', title: 'Wildlife Photography Journey · Desert Hedgehog', url: 'https://www.360photographynature.com/desert-hedgehog', reviewedAt },
  { id: 'uae-mushrif-ghaf-woodland-uae-snakes', title: 'Wildlife Photography Journey · Snakes in the UAE', url: 'https://www.360photographynature.com/snakes-of-united-arab-emirates', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-mushrif-ghaf-woodland-ghaf', coverage: 'local',
    name: ['شجرة الغاف', 'Ghaf tree', 'Ghaf', '牧豆树', 'ग़ाफ़ वृक्ष'],
    description: ['توثق المصادر غابة غاف أصلية في مشرف. هذه شجرة صحراوية لا غابة معتدلة؛ ظلها لا يلغي حرارة الموقع.', 'Sources document indigenous ghaf woodland at Mushrif. This is a dryland tree, not temperate forest; its shade does not remove heat exposure.', 'Les sources décrivent un boisement de ghaf indigène à Mushrif. C’est un arbre aride, pas une forêt tempérée ; son ombre ne supprime pas la chaleur.', '资料记录穆什里夫有本地牧豆树疏林。这是干旱地树木，不是温带森林；树荫不能消除热暴露。', 'स्रोत मुशरिफ में स्थानीय ग़ाफ़ वनक्षेत्र बताते हैं। यह शुष्क भूमि का वृक्ष है, समशीतोष्ण जंगल नहीं; इसकी छाया गर्मी समाप्त नहीं करती।'],
    precaution: ['لا تكسر الأغصان أو تجمع الخشب؛ تقرر المصادر الرسمية حظر قطع النباتات البرية.', 'Do not break branches or collect wood; official sources state that cutting wild plants is prohibited.', 'Ne cassez pas les branches et ne prenez pas de bois ; les sources officielles interdisent de couper les plantes sauvages.', '不要折枝或收集木材；官方资料说明禁止砍伐野生植物。', 'टहनियाँ न तोड़ें और लकड़ी न लें; आधिकारिक स्रोत जंगली पौधे काटने पर रोक बताते हैं।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-uae-birding', 'uae-mushrif-ghaf-woodland-ghaf-tree'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-arabian-babbler', coverage: 'local',
    name: ['الثرثار العربي', 'Arabian babbler', 'Cratérope arabe', '阿拉伯噪鹛', 'अरबी बैबलर'],
    description: ['يسجل دليل الطيور هذا النوع مقيماً قد يُرى بقليل من الحظ. التعرف هنا عام ولا يضمن رؤية في زيارة مزدحمة.', 'The birding guide records this resident species as possible with some luck. This is general identification help, not a sighting guarantee on a busy visit.', 'Le guide ornithologique signale ce résident, visible avec un peu de chance. Aide générale seulement, sans garantie lors d’une visite fréquentée.', '观鸟资料记录此留鸟，运气好可能见到。本条仅作一般识别帮助，不保证繁忙时段可见。', 'पक्षी मार्गदर्शिका इसे निवासी प्रजाति बताती है, जो कभी-कभी दिख सकती है। यह सामान्य पहचान है, भीड़ वाले दौरे में गारंटी नहीं।'],
    precaution: ['راقبه بهدوء من المسار ولا تلاحقه بين الأشجار.', 'Watch quietly from the path and do not chase it through the trees.', 'Observez calmement depuis le chemin, sans le poursuivre entre les arbres.', '在路径上安静观察，不要在树间追逐。', 'रास्ते से शांतिपूर्वक देखें और पेड़ों के बीच पीछा न करें।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-uae-birding'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-pallid-scops-owl', coverage: 'local',
    name: ['بومة باليد سكوبس', 'Pallid scops owl', 'Petit-duc pâle', '苍角鸮', 'पैलिड स्कॉप्स उल्लू'],
    description: ['يذكر دليل الطيور البومة المقيمة بعد الغسق. المشاهدة الليلية تتأثر بالإضاءة والإغلاق، وليست سبباً لدخول مناطق مسيجة.', 'The birding guide notes the resident owl after dusk. Night viewing depends on lighting and closures, and is not a reason to enter fenced areas.', 'Le guide cite ce petit-duc résident après le crépuscule. L’observation dépend lumière et fermetures, sans justifier l’entrée en zone close.', '观鸟资料提到黄昏后的留居角鸮。夜间观察受照明和关闭影响，不能因此进入围栏区域。', 'पक्षी मार्गदर्शिका सांझ के बाद निवासी उल्लू बताती है। रात में देखना रोशनी और बंद क्षेत्रों पर निर्भर है; बाड़े में न जाएँ।'],
    precaution: ['استخدم مصباحاً باعتدال واتبع الإغلاق واللافتات؛ لا تزعج الطائر أو الزوار.', 'Use any torch sparingly and follow closures and signs; do not disturb the bird or visitors.', 'Utilisez la lampe avec retenue et respectez fermetures et panneaux ; ne dérangez ni oiseau ni visiteurs.', '少量使用手电，并遵守关闭和标识；不要打扰鸟类或游客。', 'टॉर्च सीमित रखें और बंदी व संकेत मानें; पक्षी या आगंतुकों को परेशान न करें।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-uae-birding'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-desert-hedgehog', coverage: 'terrain-example',
    name: ['القنفذ الصحراوي', 'Desert hedgehog', 'Hérisson du désert', '沙漠刺猬', 'रेगिस्तानी हेजहॉग'],
    description: ['مثال إقليمي لا سجل محلي مؤكد في المصادر المقروءة: القنفذ الصحراوي ليلي في موائل الإمارات الجافة وقد يفترس العقارب.', 'Regional example, not a confirmed local record in the fetched sources: the desert hedgehog is nocturnal in dry UAE habitats and may eat scorpions.', 'Exemple régional, sans donnée locale confirmée dans les sources lues : le hérisson du désert est nocturne et peut manger des scorpions.', '区域示例，已读资料未确认本地记录：沙漠刺猬夜行，生活于阿联酋干旱生境，可能捕食蝎子。', 'क्षेत्रीय उदाहरण, पढ़े स्रोतों में स्थानीय पुष्टि नहीं: रेगिस्तानी हेजहॉग रात में सक्रिय होता है और बिच्छू खा सकता है।'],
    precaution: ['لا تلمسه أو ترفعه؛ خفف السرعة في المواقف والطرق الداخلية عند المساء.', 'Do not touch or lift it; slow down in car parks and internal roads toward evening.', 'Ne le touchez pas et ne le soulevez pas ; ralentissez dans parkings et voies internes le soir.', '不要触摸或拿起；傍晚在停车场和园内道路减速。', 'इसे छुएँ या उठाएँ नहीं; शाम को पार्किंग और अंदरूनी सड़कों पर गति कम रखें।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-desert-hedgehog'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-snakes', coverage: 'terrain-example',
    name: ['ثعابين صحراوية', 'Desert snakes', 'Serpents du désert', '沙漠蛇类', 'रेगिस्तानी साँप'],
    description: ['مثال احتياطي للبيئة الجافة: توضح مصادر الحياة البرية أن للثعابين دوراً في موائل الإمارات، ولم نثبت نوعاً بعينه في مشرف.', 'Dryland precaution example: wildlife sources describe snakes in UAE habitats, but no specific species was confirmed for Mushrif in the fetched sources.', 'Exemple de prudence en milieu aride : des sources décrivent des serpents aux Émirats, sans espèce confirmée à Mushrif dans les sources lues.', '干旱地防范示例：野生动物资料说明阿联酋生境有蛇类，但已读资料未确认穆什里夫具体种。', 'शुष्क भूभाग की सावधानी: स्रोत यूएई आवासों में साँप बताते हैं, पर पढ़े स्रोतों में मुशरिफ की विशिष्ट प्रजाति पुष्ट नहीं।'],
    precaution: ['ابق على المسارات، لا تضع يدك تحت الصخور أو الحطب، واطلب الإسعاف إذا حدثت عضة.', 'Stay on paths, do not put hands under rocks or wood, and call for medical help after any bite.', 'Restez sur les chemins, ne mettez pas les mains sous pierres ou bois, et appelez les secours en cas de morsure.', '留在路径上，不把手伸到石头或木材下；被咬后立即求医。', 'रास्तों पर रहें, पत्थर या लकड़ी के नीचे हाथ न डालें, और काटने पर चिकित्सा सहायता बुलाएँ।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-uae-snakes', 'uae-emergency'],
  },
];

const sections = [
  section('place', [
    'حديقة مشرف الوطنية متنزه عام كبير في دبي يحمي غابة غاف محلية جافة؛ لذلك تُستخدم هنا مثالاً صادقاً لتضاريس الغابة في الإمارات، لا غابة معتدلة. مؤشر الخريطة تقريبي لمنطقة الحديقة وليس بداية مسار؛ والصورة توضيحية. تحقق في يوم الزيارة.',
    'Mushrif National Park is a large Dubai public park protecting native dry ghaf woodland, so it is used here as an honest UAE forest-terrain example, not a temperate forest. The marker is an approximate area marker, not a trailhead; the image is illustrative. Check on the day.',
    'Le parc national de Mushrif est un grand parc public de Dubaï protégeant un boisement sec de ghaf indigène : c’est donc l’exemple honnête de terrain forestier aux Émirats, pas une forêt tempérée. Repère approximatif, pas un départ ; image illustrative. Vérifiez le jour même.',
    '穆什里夫国家公园是迪拜大型公共公园，保护本地干旱牧豆树疏林，因此在此诚实作为阿联酋“森林”地形示例，而非温带森林。地图标记仅示大致区域，不是步道起点；图片为示意。当天核对。',
    'मुशरिफ नेशनल पार्क दुबई का बड़ा सार्वजनिक पार्क है, जहाँ स्थानीय शुष्क ग़ाफ़ वनक्षेत्र सुरक्षित है; इसलिए यह यूएई के वन भूभाग का ईमानदार उदाहरण है, समशीतोष्ण जंगल नहीं। चिह्न अनुमानित क्षेत्र है, पगडंडी नहीं; चित्र उदाहरणात्मक है। उसी दिन जाँचें।',
  ], ['uae-mushrif-ghaf-woodland-visit-dubai', 'uae-mushrif-ghaf-woodland-uae-birding']),
  section('equipment', [
    'استنتاج عملي: احمل ماءً كافياً، هاتفاً مشحوناً، ونسخة غير متصلة من خريطة الحديقة أو مسارك. صفحة التذاكر تذكر رسماً للدخول العام ودخول السيارة، ومشرف هب يذكر مسارات مشي ودراجات؛ لا تفترض توفر معدات لكل نشاط. تحقق من المصدر والمشغّل في اليوم نفسه.',
    'Practical inference: carry enough water, a charged phone and an offline park or route map. The ticket page lists public and car entry fees, and Mushrif Hub lists walking and cycling tracks; do not assume equipment is supplied for every activity. Check the source or operator on the day.',
    'Déduction pratique : emportez assez d’eau, un téléphone chargé et une carte hors ligne du parc ou du parcours. La billetterie indique les frais d’entrée et de voiture, et Mushrif Hub cite marche et vélo ; ne supposez pas que le matériel est fourni. Vérifiez le jour même.',
    '实用推断：带足饮水、充好电的手机，以及离线园区或路线图。票务页列出个人和车辆入园费，穆什里夫枢纽页列出步行和骑行道；不要默认每项活动都有装备。当天向来源或运营方核对。',
    'व्यावहारिक अनुमान: पर्याप्त पानी, चार्ज फ़ोन और पार्क या मार्ग का ऑफलाइन नक्शा रखें। टिकट पृष्ठ प्रवेश और कार शुल्क बताता है, और मुशरिफ हब पैदल व साइकिल मार्ग बताता है; हर गतिविधि में सामान मिलेगा, यह न मानें। उसी दिन जाँचें।',
  ], ['uae-mushrif-ghaf-woodland-ticket-kiosk', 'uae-mushrif-ghaf-woodland-dm-hub']),
  section('clothing', [
    'تنصح صفحة الزيارة بالأحذية المريحة للمشي وحمل قبعة وواقي شمس، ولا تذكر زيّاً إلزامياً. نصيحة عامة وليست قاعدة محلية: اختر ملابس خفيفة ساترة وحذاءً ثابتاً للدروب الرملية ومناطق الشواء؛ أضف طبقة خفيفة فقط إذا أشارت التوقعات إلى حاجة لذلك.',
    'The visitor page advises comfortable shoes for hiking and carrying a hat and sunscreen, and states no dress code. General advice, not a local requirement: choose light covering clothes and stable footwear for sandy paths and barbecue areas; add a light layer only if the forecast suggests it.',
    'La page de visite conseille des chaussures confortables, chapeau et crème solaire, sans code vestimentaire. Conseil général, pas une obligation locale : vêtements légers couvrants et chaussures stables pour sable et barbecue ; ajoutez une couche seulement si la météo l’indique.',
    '游客页建议徒步穿舒适鞋、携带帽子和防晒霜，并说明没有着装规定。一般建议，并非当地要求：为沙质路径和烧烤区选择轻薄遮蔽衣物与稳固鞋；仅在预报需要时加薄外层。',
    'यात्री पृष्ठ पैदल यात्रा के लिए आरामदायक जूते, टोपी और सनस्क्रीन बताता है और ड्रेस कोड नहीं बताता। सामान्य सलाह, स्थानीय नियम नहीं: रेतीले रास्तों और बारबेक्यू क्षेत्रों के लिए हल्के ढकने वाले कपड़े और मजबूत जूते चुनें; पूर्वानुमान कहे तभी हल्की परत जोड़ें।',
  ], ['uae-mushrif-ghaf-woodland-visit-dubai']),
  section('transport', [
    'تذكر صفحة الزيارة أن الحافلة 11A لها موقف قريب من الحديقة، وأن أقرب محطة مترو هي سنتربوينت مع خيار سيارة أجرة أو حافلة من محطة راشدية. استخدم هذه المعلومات للتخطيط فقط؛ لا تجعل الإحداثيات تعليمات قيادة نهائية، وتحقق من تطبيقات النقل والبوابات قبل الانطلاق.',
    'The visitor page says bus 11A stops near the park and that Centrepoint is the closest Metro station, followed by taxi or bus from Rashidiya Bus Station. Use this for planning only; do not treat coordinates as final driving instructions, and check transport apps and gates before leaving.',
    'La page indique que le bus 11A s’arrête près du parc et que Centrepoint est la station de métro la plus proche, puis taxi ou bus depuis Rashidiya. Utilisez cela pour planifier seulement ; les coordonnées ne sont pas un itinéraire final. Vérifiez applis et portes avant départ.',
    '游客页说明11A公交在公园附近停靠，最近地铁站为Centrepoint，可再从Rashidiya公交站乘出租车或公交。仅用于规划；不要把坐标当成最终驾驶指引，出发前核对交通应用和入口。',
    'यात्री पृष्ठ बताता है कि बस 11A पार्क के पास रुकती है और निकटतम मेट्रो Centrepoint है, फिर Rashidiya बस स्टेशन से टैक्सी या बस ली जा सकती है। इसे केवल योजना मानें; निर्देशांक अंतिम ड्राइविंग निर्देश नहीं। निकलने से पहले ऐप और गेट जाँचें।',
  ], ['uae-mushrif-ghaf-woodland-visit-dubai']),
  section('season', [
    'مشرف موقع حضري مكشوف جزئياً رغم ظل الغاف. يعرّف المركز الوطني للأرصاد نفسه كمصدر رسمي للطقس في الإمارات، وتذكر صفحة الزيارة أن وقت الصباح الباكر أو آخر النهار أنسب لمن يريد المشي لتجنب الشمس. قرر نشاطك بعد قراءة توقعات اليوم والتنبيهات.',
    'Mushrif remains partly exposed despite ghaf shade. The National Center of Meteorology identifies itself as the UAE weather source, and the visitor page says early morning or late afternoon may suit trail users avoiding sun. Choose the activity after reading same-day forecasts and warnings.',
    'Mushrif reste en partie exposé malgré l’ombre du ghaf. Le Centre national de météorologie est la source météo des Émirats, et la page conseille matin tôt ou fin d’après-midi pour marcher hors du soleil. Décidez après les prévisions et alertes du jour.',
    '即使有牧豆树树荫，穆什里夫仍部分暴露。国家气象中心是阿联酋天气来源，游客页建议想走步道者选择清晨或傍晚以避开日晒。阅读当天预报和警报后再决定活动。',
    'ग़ाफ़ की छाया के बावजूद मुशरिफ आंशिक रूप से खुला रहता है। राष्ट्रीय मौसम केंद्र यूएई मौसम स्रोत है, और यात्री पृष्ठ धूप से बचने के लिए सुबह जल्दी या देर दोपहर का सुझाव देता है। उसी दिन के पूर्वानुमान और चेतावनी देखकर गतिविधि चुनें।',
  ], ['uae-mushrif-ghaf-woodland-ncm', 'uae-mushrif-ghaf-woodland-visit-dubai']),
  section('nature', [
    'الغاف شجرة وطنية ذات قيمة بيئية وثقافية في الإمارات، ودليل الطيور يصف مشرف بأنه من أفضل أمثلة غابة الغاف المحلية في المنطقة مع أكثر من 115 نوعاً مسجلاً من الطيور. لا تجمع نباتات أو حطباً، ولا تعدّ القائمة وعداً برؤية أي نوع.',
    'The ghaf is a UAE tree with ecological and cultural value, and the birding guide describes Mushrif as one of the best local ghaf woodland examples, with more than 115 recorded bird species. Do not collect plants or wood, and treat the species list as possible recognition, not a promise.',
    'Le ghaf a une valeur écologique et culturelle aux Émirats, et le guide ornithologique décrit Mushrif comme un des meilleurs boisements locaux de ghaf, avec plus de 115 espèces d’oiseaux. Ne prélevez ni plantes ni bois ; la liste n’est pas une promesse d’observation.',
    '牧豆树在阿联酋具有生态和文化价值，观鸟指南称穆什里夫是当地牧豆树疏林的优秀例子之一，并记录115种以上鸟类。不要采集植物或木材；物种列表只是可能识别，不是观赏承诺。',
    'ग़ाफ़ यूएई में पारिस्थितिक और सांस्कृतिक महत्व का वृक्ष है, और पक्षी मार्गदर्शिका मुशरिफ को स्थानीय ग़ाफ़ वनक्षेत्र के अच्छे उदाहरणों में बताती है, जहाँ 115 से अधिक पक्षी दर्ज हैं। पौधे या लकड़ी न लें; सूची दर्शन का वादा नहीं।',
  ], ['uae-mushrif-ghaf-woodland-ghaf-tree', 'uae-mushrif-ghaf-woodland-uae-birding']),
  section('hazard', [
    'الخطر الأبرز هو الحرارة والتعرض، ثم حركة الدراجات والمشي على مسارات طبيعية. استنتاج عملي: ابتعد عن المسار إذا تعبت، ولا تدخل مناطق مسيجة بحثاً عن طيور ليلية. للأفاعي والعقارب المحتملة في الموائل الجافة، لا تلمس الحيوان واطلب المساعدة؛ في الطوارئ اتصل 999 أو 998 أو 997.',
    'The main hazard is heat and exposure, followed by cycling traffic and natural-surface trails. Practical inference: leave the route if tired, and do not enter fenced areas for night birds. For possible snakes or scorpions in dry habitat, do not handle the animal and seek help; in emergencies call 999, 998 or 997.',
    'Le danger principal est la chaleur et l’exposition, puis les vélos et les sols naturels. Déduction pratique : quittez le parcours si vous fatiguez et n’entrez pas en zone close pour des oiseaux nocturnes. Pour serpents ou scorpions possibles, ne touchez pas et demandez aide ; urgence 999, 998 ou 997.',
    '主要风险是高温和暴露，其次是自行车通行和天然路面。实用推断：疲劳时离开路线，不要为夜鸟进入围栏区。干旱生境可能有蛇或蝎，不要触碰并求助；紧急情况拨打999、998或997。',
    'मुख्य जोखिम गर्मी और खुलापन है, फिर साइकिल आवागमन और प्राकृतिक सतह वाले रास्ते। व्यावहारिक अनुमान: थकें तो मार्ग छोड़ें और रात के पक्षी के लिए बाड़े में न जाएँ। सूखे आवास में संभावित साँप या बिच्छू को न छुएँ और मदद लें; आपातकाल में 999, 998 या 997।',
  ], ['uae-mushrif-ghaf-woodland-ncm', 'uae-mushrif-ghaf-woodland-dm-hub', 'uae-mushrif-ghaf-woodland-uae-snakes', 'uae-emergency']),
  section('visit', [
    'تذكر دبي للسياحة مناطق شواء كثيرة، دخولاً برسوم، وساعات تمتد من 8 صباحاً إلى 10 مساءً في أيام الأسبوع وحتى 11 مساءً في عطلة نهاية الأسبوع. وتذكر بلدية دبي مسار مشي بطول 9.7 كم ومسار دراجات جبلية بطول 50 كم. اختر نشاطاً واحداً أساسياً وتحقق من الساعات في اليوم نفسه.',
    'Visit Dubai lists many assigned barbecue areas, paid entry, and hours from 8am to 10pm on weekdays and until 11pm at weekends. Dubai Municipality lists a 9.7 km walking track and 50 km mountain-bike track. Choose one main activity and check hours on the day.',
    'Visit Dubai cite de nombreuses zones de barbecue, une entrée payante et des horaires de 8 h à 22 h en semaine, jusqu’à 23 h le week-end. La Municipalité cite 9,7 km de marche et 50 km de VTT. Choisissez une activité principale et vérifiez le jour même.',
    '迪拜旅游局列出多个指定烧烤区、付费入园，以及平日8点至22点、周末至23点的开放时间。迪拜市政列出9.7公里步行道和50公里山地车道。选择一项主要活动，并当天核对时间。',
    'Visit Dubai कई निर्धारित बारबेक्यू क्षेत्र, शुल्क सहित प्रवेश, और सप्ताह में 8 बजे से 22 बजे तथा सप्ताहांत में 23 बजे तक समय बताता है। दुबई नगर पालिका 9.7 किमी पैदल मार्ग और 50 किमी माउंटेन बाइक मार्ग बताती है। एक मुख्य गतिविधि चुनें और उसी दिन समय जाँचें।',
  ], ['uae-mushrif-ghaf-woodland-visit-dubai', 'uae-mushrif-ghaf-woodland-dm-hub', 'uae-mushrif-ghaf-woodland-ticket-kiosk']),
  section('rules', [
    'القواعد العملية: ادفع رسوم الدخول المذكورة، واستخدم مناطق الشواء المخصصة فقط، والتزم بمسارات الدراجات والمشي ومستواك. مصدر الغاف الرسمي يذكّر بحظر قطع النباتات البرية؛ لذلك لا تكسر الغاف أو تجمع الحطب. تحقق من اللوحات في اليوم نفسه، وللطوارئ اتصل 999 للشرطة، 998 للإسعاف، 997 للدفاع المدني.',
    'Practical rules: pay the listed entry fees, use only assigned barbecue areas, and stay on cycling and walking routes within your level. The ghaf source notes that cutting wild plants is prohibited, so do not break ghaf or collect wood. Check signs on the day; for emergencies call 999 police, 998 ambulance, 997 civil defence.',
    'Règles pratiques : payez les frais indiqués, utilisez seulement les zones de barbecue désignées et restez sur les parcours adaptés à votre niveau. La source sur le ghaf rappelle l’interdiction de couper les plantes sauvages ; ne cassez pas le ghaf et ne prenez pas de bois. Vérifiez les panneaux ; urgence 999, 998, 997.',
    '实用规则：支付列明入园费，只使用指定烧烤区，并按能力留在骑行和步行路线。牧豆树资料提醒禁止砍伐野生植物，因此不要折损牧豆树或收集木材。当天查看标牌；紧急情况拨打警察999、救护998、民防997。',
    'व्यावहारिक नियम: बताए प्रवेश शुल्क दें, केवल निर्धारित बारबेक्यू क्षेत्र उपयोग करें, और अपनी क्षमता के अनुरूप साइकिल व पैदल मार्ग पर रहें। ग़ाफ़ स्रोत जंगली पौधे काटने की मनाही बताता है, इसलिए ग़ाफ़ न तोड़ें और लकड़ी न लें। उसी दिन संकेत देखें; आपातकाल में पुलिस 999, एम्बुलेंस 998, नागरिक सुरक्षा 997।',
  ], ['uae-mushrif-ghaf-woodland-ticket-kiosk', 'uae-mushrif-ghaf-woodland-visit-dubai', 'uae-mushrif-ghaf-woodland-dm-hub', 'uae-mushrif-ghaf-woodland-ghaf-tree', 'uae-emergency']),
];

export const destination = {
  id: 'mushrif-ghaf-woodland', country: UAE, terrainId: 'forest', terrainIndex: 2, lat: 25.2142098, lon: 55.4481647, timezone: UAE_TZ,
  names: ['غابة الغاف في حديقة مشرف الوطنية', 'Mushrif National Park ghaf woodland', 'Boisement de ghaf du parc Mushrif', '穆什里夫国家公园牧豆树林', 'मुशरिफ नेशनल पार्क ग़ाफ़ वनक्षेत्र'],
  summary: ['متنزه عام في دبي يحمي غابة غاف صحراوية؛ مثال صادق لتضاريس الغابة في الإمارات، مع مسارات وشواء مشروط.', 'Dubai public park protecting dry ghaf woodland: an honest UAE forest-terrain example with trails and designated barbecue.', 'Parc public de Dubaï protégeant un boisement sec de ghaf : exemple forestier émirien avec sentiers et barbecue désigné.', '迪拜公共公园，保护干旱牧豆树疏林；是阿联酋森林地形示例，有步道和指定烧烤区。', 'दुबई का सार्वजनिक पार्क, जो शुष्क ग़ाफ़ वनक्षेत्र बचाता है; यूएई वन भूभाग का उदाहरण, रास्ते और निर्धारित बारबेक्यू।'],
  image: '/images/forest.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-mushrif-ghaf-woodland-visit-dubai', 'uae-mushrif-ghaf-woodland-dm-hub', 'uae-mushrif-ghaf-woodland-ghaf-tree', 'uae-mushrif-ghaf-woodland-uae-birding'],
  species,
  sections,
} satisfies Destination & { country: typeof UAE };

export const rules: PackingRule[] = [
  {
    id: 'uae-mushrif-ghaf-woodland-water-heat-check', version: 1, equipmentId: 'uae-mushrif-ghaf-woodland-water-heat-check',
    label: ['ماء وفحص حرارة اليوم', 'Water and same-day heat check', 'Eau et vérification chaleur', '饮水与当天高温核对', 'पानी और उसी दिन गर्मी जाँच'],
    category: 'essentials', terrainIds: ['forest'], activities: ['cycling', 'walking'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['الموقع ظل غاف جاف مع تعرض للشمس؛ راجع توقعات المركز الوطني للأرصاد قبل المشي أو ركوب الدراجة.', 'The site is dry ghaf shade with sun exposure; check NCM forecasts before walking or cycling.', 'Le site offre une ombre sèche de ghaf avec soleil ; consultez la météo du NCM avant marche ou vélo.', '这里是干旱牧豆树树荫并有日晒；步行或骑行前查看国家气象中心预报。', 'यह सूखी ग़ाफ़ छाया और धूप वाला स्थान है; पैदल या साइकिल से पहले मौसम केंद्र पूर्वानुमान देखें।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-ncm', 'uae-mushrif-ghaf-woodland-visit-dubai'], coverage: 'local', destinationIds: ['mushrif-ghaf-woodland'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-closed-shoes', version: 1, equipmentId: 'uae-mushrif-ghaf-woodland-closed-shoes',
    label: ['حذاء مغلق ثابت', 'Stable closed footwear', 'Chaussures fermées stables', '稳固包脚鞋', 'मजबूत बंद जूते'],
    category: 'clothing', terrainIds: ['forest'], activities: ['cycling', 'walking', 'camping'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['تنصح صفحة الزيارة بأحذية مريحة للمشي، والمسارات طبيعية؛ الحذاء المغلق يقلل التعثر والاحتكاك بالنبات أو الحصى.', 'The visitor page advises comfortable walking shoes and the trails are natural; closed footwear reduces trips and contact with plants or gravel.', 'La page conseille des chaussures confortables et les sols sont naturels ; des chaussures fermées limitent chutes et contact végétal ou gravier.', '游客页建议舒适步行鞋，路线为自然路面；包脚鞋可减少绊倒以及接触植物或碎石。', 'यात्री पृष्ठ आरामदायक चलने वाले जूते बताता है और रास्ते प्राकृतिक हैं; बंद जूते ठोकर और पौधों या कंकड़ से संपर्क घटाते हैं।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-visit-dubai', 'uae-mushrif-ghaf-woodland-dm-hub'], coverage: 'local', destinationIds: ['mushrif-ghaf-woodland'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-bike-helmet', version: 1, equipmentId: 'uae-mushrif-ghaf-woodland-bike-helmet',
    label: ['خوذة للدراجات', 'Cycling helmet', 'Casque de vélo', '骑行头盔', 'साइकिल हेलमेट'],
    category: 'safety', terrainIds: ['forest'], activities: ['cycling'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['تذكر بلدية دبي مسار دراجات جبلية متعدد المستويات بطول 50 كم؛ الخوذة احتياط عملي للمسارات الطبيعية، لا ضماناً للسلامة.', 'Dubai Municipality lists a 50 km multi-level mountain-bike track; a helmet is a practical precaution for natural tracks, not a safety guarantee.', 'La Municipalité cite 50 km de VTT à plusieurs niveaux ; le casque est une précaution pratique sur sol naturel, sans garantie.', '迪拜市政列出50公里多级山地车道；头盔是自然路面的实用防护，不是安全保证。', 'दुबई नगर पालिका 50 किमी बहु-स्तरीय माउंटेन बाइक मार्ग बताती है; हेलमेट प्राकृतिक मार्ग पर व्यावहारिक सावधानी है, सुरक्षा गारंटी नहीं।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-dm-hub'], coverage: 'local', destinationIds: ['mushrif-ghaf-woodland'],
  },
  {
    id: 'uae-mushrif-ghaf-woodland-barbecue-bag', version: 1, equipmentId: 'uae-mushrif-ghaf-woodland-barbecue-bag',
    label: ['كيس تنظيف للشواء', 'Barbecue clean-up bag', 'Sac de nettoyage barbecue', '烧烤清理袋', 'बारबेक्यू सफाई थैला'],
    category: 'essentials', terrainIds: ['forest'], activities: ['camping'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['تذكر صفحة الزيارة مناطق شواء مخصصة؛ احمل كيساً لإعادة المخلفات إلى الحاويات واتبع اللوحات بدلاً من ترك الفحم أو القمامة.', 'The visitor page lists assigned barbecue areas; carry a bag to return waste to bins and follow signs rather than leaving charcoal or litter.', 'La page cite des zones de barbecue désignées ; prenez un sac pour les déchets et suivez les panneaux, sans laisser charbon ni détritus.', '游客页列出指定烧烤区；带清理袋把垃圾放回垃圾箱，并遵守标牌，不留下炭灰或废弃物。', 'यात्री पृष्ठ निर्धारित बारबेक्यू क्षेत्र बताता है; कचरा डिब्बों तक ले जाने के लिए थैला रखें और संकेत मानें, कोयला या कूड़ा न छोड़ें।'],
    sourceIds: ['uae-mushrif-ghaf-woodland-visit-dubai'], coverage: 'local', destinationIds: ['mushrif-ghaf-woodland'],
  },
];
