import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-ras-al-khor-dm-wildlife', title: 'Dubai Municipality · Dubai Protected Areas wildlife', url: 'https://www.dm.gov.ae/dubai-protected-areas/wildlife/', reviewedAt },
  { id: 'uae-ras-al-khor-dm-plan', title: 'Dubai Municipality · Plan Your Visit', url: 'https://www.dm.gov.ae/dubai-protected-areas/plan-your-visit/', reviewedAt },
  { id: 'uae-ras-al-khor-dm-book', title: 'Dubai Municipality · Book a visit', url: 'https://www.dm.gov.ae/dubai-protected-areas/book-a-visit/', reviewedAt },
  { id: 'uae-ras-al-khor-visit-dubai', title: 'Visit Dubai · Ras Al Khor Wildlife Sanctuary', url: 'https://www.visitdubai.com/en/places-to-visit/ras-al-khor-wildlife-sanctuary', reviewedAt },
  { id: 'uae-ras-al-khor-ramsar', title: 'Ramsar Sites Information Service · Ras Al Khor Wildlife Sanctuary', url: 'https://rsis.ramsar.org/ris/1715', reviewedAt },
  { id: 'uae-ras-al-khor-ncm-climate', title: 'National Center of Meteorology · Climate Reports', url: 'https://www.ncm.gov.ae/pages/climate-reports?lang=en', reviewedAt },
  { id: 'uae-ras-al-khor-uae-aviation', title: 'UAE Government portal · Aviation safety', url: 'https://u.ae/en/information-and-services/justice-safety-and-the-law/Safety/aviation-safety', reviewedAt },
  { id: 'uae-ras-al-khor-uae-ecosystems', title: 'UAE Government portal · Nature and ecosystems', url: 'https://u.ae/en/information-and-services/environment-and-energy/Nature-and-wildlife/topography-and-ecosystems', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-ras-al-khor-greater-flamingo', coverage: 'local',
    name: ['النحام الكبير', 'Greater flamingo', 'Flamant rose', '大红鹳', 'ग्रेटर फ्लेमिंगो'],
    description: ['توثق بلدية دبي وجهة السياحة في دبي النحام في الملجأ، ويذكر رامسار أعداداً كبيرة تاريخياً. الظهور يتغير حسب الموسم والماء؛ هذه ملاحظة تعرّف عامة وليست وعداً بالمشاهدة.', 'Dubai Municipality and Visit Dubai document flamingos at the sanctuary, and Ramsar records historically large counts. Sightings vary with season and water, so this is broad recognition guidance, not a promise.', 'La municipalité de Dubaï et l’office du tourisme signalent les flamants, et Ramsar note de grands effectifs historiques. L’observation varie selon saison et eau : repère général, sans garantie.', '迪拜市政和迪拜旅游资料记录这里有火烈鸟，拉姆萨尔资料也记录过较大数量。能否看到取决于季节和水位，本条仅作概括识别，不作保证。', 'दुबई नगरपालिका और दुबई पर्यटन यहाँ फ्लेमिंगो बताते हैं, और रामसर पुराने बड़े समूह दर्ज करता है। दिखना मौसम और पानी पर निर्भर है; यह सामान्य पहचान है, वादा नहीं।'],
    precaution: ['راقبه من المخبأ وبهدوء؛ لا تطعمه أو تحاول الاقتراب من الماء.', 'Watch quietly from the hide; do not feed it or try to approach the water.', 'Observez depuis l’affût, en silence ; ne le nourrissez pas et n’approchez pas l’eau.', '请在观鸟屋内安静观察，不要投喂，也不要靠近水面。', 'हाइड से शांत रहकर देखें; भोजन न दें और पानी के पास जाने की कोशिश न करें।'],
    sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-visit-dubai', 'uae-ras-al-khor-ramsar'],
  },
  {
    id: 'uae-ras-al-khor-waders', coverage: 'local',
    name: ['طيور الخواضات', 'Waders', 'Limicoles', '涉禽', 'दलदली तट-पक्षी'],
    description: ['تذكر بلدية دبي وRamsar الخواضات وطيور الشاطئ في المسطحات الطينية. قد تتشابه الأنواع الصغيرة، لذلك لا تعتمد على هذه الخانة لتحديد نوع دقيق.', 'Dubai Municipality and Ramsar list waders and shorebirds on the mudflats. Small species can look similar, so this entry is not a precise field-identification key.', 'La municipalité de Dubaï et Ramsar citent limicoles et oiseaux de rivage sur les vasières. Les petites espèces se ressemblent ; ce n’est pas une clé de terrain précise.', '迪拜市政和拉姆萨尔资料列出泥滩上的涉禽和滨鸟。小型种类外观相近，本条不是精确野外鉴定工具。', 'दुबई नगरपालिका और रामसर कीचड़ मैदानों पर वाडर और शोरबर्ड बताते हैं। छोटी प्रजातियाँ मिलती-जुलती लग सकती हैं; यह सटीक पहचान कुंजी नहीं है।'],
    precaution: ['اترك مسافة طويلة ولا تخرج من منطقة الزوار لملاحقة طائر صغير.', 'Keep a long distance and do not leave the visitor area to follow a small bird.', 'Gardez une grande distance et ne quittez pas la zone visiteurs pour suivre un oiseau.', '保持较远距离，不要为追看小鸟离开游客区域。', 'अच्छी दूरी रखें और छोटे पक्षी के पीछे आगंतुक क्षेत्र से बाहर न जाएँ।'],
    sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar'],
  },
  {
    id: 'uae-ras-al-khor-herons-egrets', coverage: 'local',
    name: ['البلشونات والواقات', 'Herons and egrets', 'Hérons et aigrettes', '鹭类与白鹭', 'बगुले और एग्रेट'],
    description: ['تذكر جهة السياحة في دبي البلشونات والواقات ضمن حياة الملجأ. تمييز الحجم واللون يتطلب دليلاً ميدانياً أو مرشداً؛ لا تفترض قربها من المخبأ في كل زيارة.', 'Visit Dubai notes herons and egrets among sanctuary wildlife. Size and colour separation needs a field guide or ranger; do not assume they will be near a hide on every visit.', 'L’office du tourisme de Dubaï cite hérons et aigrettes parmi la faune. La distinction demande guide de terrain ou agent ; leur proximité d’un affût n’est pas assurée.', '迪拜旅游资料提到保护区内有鹭类和白鹭。区分体型和颜色需要图鉴或工作人员协助；不要默认每次都在观鸟屋附近。', 'दुबई पर्यटन यहाँ बगुले और एग्रेट बताता है। आकार और रंग से पहचान के लिए फील्ड गाइड या रेंजर चाहिए; हर बार पास दिखना निश्चित नहीं।'],
    precaution: ['لا تستخدم الفلاش أو الأصوات لجذبها؛ الهدوء جزء من تجربة المخبأ.', 'Do not use flash or calls to attract them; quiet is part of hide use.', 'N’utilisez ni flash ni sons pour les attirer ; le calme fait partie de l’affût.', '不要用闪光灯或声音吸引它们；安静是使用观鸟屋的一部分。', 'उन्हें आकर्षित करने के लिए फ्लैश या आवाज़ न करें; हाइड में शांति जरूरी है।'],
    sourceIds: ['uae-ras-al-khor-visit-dubai', 'uae-ras-al-khor-dm-plan'],
  },
  {
    id: 'uae-ras-al-khor-raptors', coverage: 'local',
    name: ['الجوارح', 'Raptors', 'Rapaces', '猛禽', 'शिकारी पक्षी'],
    description: ['تذكر بلدية دبي الجوارح، ويذكر رامسار النسر المرقط الكبير ضمن الأنواع المسجلة. قد تمر الطيور عالياً أو بعيداً؛ المنظار أنسب من محاولة الاقتراب.', 'Dubai Municipality mentions raptors, and Ramsar records greater spotted eagle among documented species. Birds may pass high or far away; binoculars are better than approaching.', 'La municipalité de Dubaï mentionne des rapaces, et Ramsar signale l’aigle criard. Ils peuvent passer haut ou loin ; des jumelles valent mieux que l’approche.', '迪拜市政资料提到猛禽，拉姆萨尔资料记录过大斑雕。鸟可能飞得很高或很远；使用望远镜比靠近更合适。', 'दुबई नगरपालिका शिकारी पक्षियों का उल्लेख करती है, और रामसर ग्रेटर स्पॉटेड ईगल दर्ज करता है। वे ऊँचे या दूर हो सकते हैं; पास जाने से बेहतर दूरबीन है।'],
    precaution: ['لا تطارد الطائر بين المواقف أو قرب الطريق؛ أبقِ انتباهك على المرور والحدود.', 'Do not chase a bird between car parks or near the road; keep attention on traffic and boundaries.', 'Ne poursuivez pas un oiseau entre parkings ou près de la route ; restez attentif à la circulation et aux limites.', '不要在停车区之间或道路旁追鸟；注意车辆和边界。', 'पार्किंग या सड़क के पास पक्षी का पीछा न करें; यातायात और सीमा पर ध्यान रखें।'],
    sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar'],
  },
  {
    id: 'uae-ras-al-khor-mangroves', coverage: 'local',
    name: ['أشجار القرم', 'Mangroves', 'Mangroves', '红树林', 'मैंग्रोव'],
    description: ['توثق بلدية دبي وRamsar القرم كموئل رئيسي في الملجأ. هذه خانة موئل نباتي عامة وليست تحديداً للنوع العلمي؛ الجذور جزء حساس من النظام.', 'Dubai Municipality and Ramsar document mangroves as a key sanctuary habitat. This is broad plant-habitat guidance, not scientific species identification; roots are sensitive habitat.', 'La municipalité de Dubaï et Ramsar décrivent les mangroves comme habitat clé. Repère végétal général, sans identification scientifique ; les racines sont sensibles.', '迪拜市政和拉姆萨尔资料将红树林列为重要生境。本条是植物生境概述，不作科学种名鉴定；根系属于敏感生境。', 'दुबई नगरपालिका और रामसर मैंग्रोव को मुख्य आवास बताते हैं। यह सामान्य पौध आवास सूचना है, वैज्ञानिक पहचान नहीं; जड़ें संवेदनशील आवास हैं।'],
    precaution: ['ابقَ في منطقة الزوار ولا تجمع أوراقاً أو جذوراً أو رواسب من الطين.', 'Stay in the visitor area and do not collect leaves, roots or mud material.', 'Restez dans la zone visiteurs et ne prélevez ni feuilles, ni racines, ni vase.', '留在游客区域，不采集叶片、根部或泥滩物质。', 'आगंतुक क्षेत्र में रहें और पत्ते, जड़ें या कीचड़ सामग्री न लें।'],
    sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar'],
  },
  {
    id: 'uae-ras-al-khor-mudflat-crabs', coverage: 'terrain-example',
    name: ['سرطانات الطين والأسماك الصغيرة', 'Mudflat crabs and small fish', 'Crabes de vase et petits poissons', '泥滩蟹与小鱼', 'कीचड़ के केकड़े और छोटी मछलियाँ'],
    description: ['مثال ساحلي عام: المصادر توثق الأسماك واللافقاريات والموائل الطينية، لكنها لا تثبت هنا نوع سرطان محدداً. لا تستخدم الخانة لتحديد غذاء أو جمع كائن.', 'General coastal example: sources document fish, invertebrates and mudflat habitat, but not a particular crab species here. Do not use this entry to identify food or collect animals.', 'Exemple côtier général : les sources citent poissons, invertébrés et vasières, sans espèce de crabe précise ici. Ne l’utilisez pas pour manger ou prélever.', '一般海岸示例：资料记录鱼类、无脊椎动物和泥滩生境，但未在此确认具体蟹种。不要用本条判断可食用或采集。', 'सामान्य तटीय उदाहरण: स्रोत मछलियाँ, अकशेरुकी और कीचड़ आवास बताते हैं, पर यहाँ कोई खास केकड़ा प्रजाति नहीं। इसे भोजन या संग्रह पहचान न मानें।'],
    precaution: ['لا تدخل الطين ولا تلمس الكائنات؛ راقب من المسافة المتاحة فقط.', 'Do not enter mud or handle animals; observe only from the available distance.', 'N’entrez pas dans la vase et ne touchez pas les animaux ; observez seulement à distance.', '不要进入泥滩或触摸生物；只能在允许距离外观察。', 'कीचड़ में न जाएँ और जीवों को न छुएँ; उपलब्ध दूरी से ही देखें।'],
    sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar', 'uae-ras-al-khor-uae-ecosystems'],
  },
];

export const destination = {
  id: 'ras-al-khor', country: UAE, terrainId: 'coast', terrainIndex: 3, lat: 25.1936, lon: 55.3219, timezone: UAE_TZ,
  names: ['محمية رأس الخور للحياة الفطرية', 'Ras Al Khor Wildlife Sanctuary', 'Réserve naturelle de Ras Al Khor', '拉斯海尔野生动物保护区', 'रास अल खोर वन्यजीव अभयारण्य'],
  summary: ['أرض رطبة حضرية محمية عند رأس خور دبي؛ زيارة هادئة من مخابئ الطيور، مع قواعد صارمة وفحص يوم الزيارة.', 'Protected urban wetland at the head of Dubai Creek; quiet bird-hide viewing with strict rules and same-day checks.', 'Zone humide urbaine protégée à la tête de la Crique de Dubaï ; observation discrète depuis les affûts, règles strictes.', '迪拜河口受保护的城市湿地；从观鸟屋安静观鸟，规则严格，需当天核对。', 'दुबई क्रीक के सिरे पर संरक्षित शहरी आर्द्रभूमि; हाइड से शांत पक्षी-दर्शन, कड़े नियम और उसी दिन जाँच।'],
  image: '/images/coast.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-dm-plan', 'uae-ras-al-khor-dm-book', 'uae-ras-al-khor-ramsar'],
  species,
  sections: [
    section('place', [
      'تقع محمية رأس الخور عند نهاية خور دبي داخل نسيج حضري، وتسجلها بلدية دبي ورامسار كأرض رطبة محمية ذات سبخات ومسطحات طينية ومناطق قرم. المؤشر تقريبي قرب مخبأ الفلامنغو، وليس بداية مسار أو تصريح دخول إلى الرطبة؛ الصورة توضيحية لتضاريس الساحل. تحقق من الوضع يوم الزيارة.',
      'Ras Al Khor sits at the head of Dubai Creek within the city. Dubai Municipality and Ramsar describe a protected wetland of sabkha, mudflats and mangroves. The marker is approximate near the Flamingo Hide, not a trailhead or permission to enter the wetland; the image is illustrative coast terrain. Check on the day.',
      'Ras Al Khor se trouve à la tête de la Crique de Dubaï, en milieu urbain. La municipalité de Dubaï et Ramsar décrivent une zone humide protégée de sebkhas, vasières et mangroves. Le repère est approximatif près de l’affût des flamants, pas un départ ni une autorisation d’entrer ; image illustrative. Vérifiez le jour même.',
      '拉斯海尔位于迪拜河上游的城市环境内，周围接近道路和建筑，并不是可自由穿越的荒野。迪拜市政和拉姆萨尔资料说明，这里是含盐沼、泥滩、潮间带和红树林的受保护湿地。地图标记约在火烈鸟观鸟屋附近，只是大致区域，不是步道起点、停车保证或进入湿地的许可；图片仅为海岸地形示意。请把行程当作短时间、低干扰的观鸟访问，并在当天核对开放和限制。若导航显示多条入口，优先按官方页面、现场标志和安保指示选择，不要自行寻找水边捷径，也不要把城市距离近理解为规则宽松或可临时改变路线。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'रास अल खोर दुबई क्रीक के सिरे पर शहर के भीतर है। दुबई नगरपालिका और रामसर इसे सबखा, कीचड़ मैदान और मैंग्रोव वाली संरक्षित आर्द्रभूमि बताते हैं। चिह्न फ्लेमिंगो हाइड के पास अनुमानित है, पगडंडी या वेटलैंड में प्रवेश अनुमति नहीं; चित्र तटीय भूभाग का उदाहरण है। उसी दिन जाँचें।',
    ], ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar']),
    section('equipment', [
      'تذكر بلدية دبي أن الأشياء المفيدة تشمل المنظار والكاميرا ودليل الطيور والطبيعة، وأن العائلات والأفراد يسجلون عند الوصول وقد تُطلب الهوية. استنتاج عملي: احفظ صفحة المخبأ ورقم مكاني دون اتصال، وخذ ماءك الشخصي، ولا تحمل طعاماً أو شراباً إلى داخل المخبأ لأنه منطقة هادئة.',
      'Dubai Municipality suggests binoculars, camera, and a bird and nature guide, and says individuals register on arrival with ID if requested. Practical inference: keep the hide location and Makani details offline, bring personal water, and do not take food or drinks into the quiet hide.',
      'La municipalité de Dubaï conseille jumelles, appareil photo et guide nature, et indique une inscription sur place avec pièce d’identité si demandée. Déduction pratique : gardez emplacement et code d’adresse hors ligne, prenez votre eau, sans nourriture ni boisson dans l’affût silencieux.',
      '迪拜市政建议携带望远镜、相机以及鸟类和自然指南，并说明个人到场登记，安保可能要求身份证件。实用推断：离线保存所选观鸟屋位置、地址编码和返程安排，因为三个观鸟屋的位置并不等同于一条连续步道。带个人饮水，但只在允许区域使用；观鸟屋是安静区域，不要把食物或饮料带入其中，也不要把摄影器材当作靠近野生动物的理由。若设备笨重，请先考虑通道宽度、他人使用窗口和返回交通；缺少器材时也不要用手机声音、闪光或越界来弥补。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'दुबई नगरपालिका दूरबीन, कैमरा और पक्षी-प्रकृति गाइड उपयोगी बताती है, और कहती है कि व्यक्ति पहुँचने पर पंजीकरण करें तथा पहचान माँगी जा सकती है। व्यावहारिक अनुमान: हाइड स्थान और स्थान कोड जानकारी ऑफलाइन रखें, अपना पानी लें, और शांत हाइड में भोजन या पेय न ले जाएँ।',
    ], ['uae-ras-al-khor-dm-plan', 'uae-ras-al-khor-dm-book']),
    section('clothing', [
      'نصيحة عامة وليست شرطاً محلياً: اختر ملابس خفيفة ساترة وحذاءً مريحاً للمواقف والممرات القصيرة، وقبعة أو نظارة للشمس حسب توقعات اليوم. الزيارة من مخابئ وليست مشياً طويلاً في الطين، لذلك لا تُجهز نفسك للنزول إلى الرطبة؛ راعِ الهدوء داخل المكان، وراجع الطقس قبل الخروج.',
      'General advice, not a local requirement: use light covering clothes, comfortable shoes for parking areas and short approaches, plus hat or sunglasses for the day’s forecast. This is hide viewing, not a mudflat walk, so do not prepare to enter the wetland; keep behaviour quiet inside.',
      'Conseil général, sans obligation locale : vêtements légers couvrants, chaussures confortables pour parkings et courts accès, chapeau ou lunettes selon la météo. La visite se fait depuis les affûts, pas dans la vase ; ne vous équipez pas pour entrer dans la zone humide et restez discret.',
      '一般建议，并非当地规定：穿轻薄而能遮蔽皮肤的衣物，选择适合停车区、短距离通道和站立等待的舒适鞋，并按当天预报准备帽子或太阳镜。这里的正常访问方式是从观鸟屋安静观看，不是泥滩徒步或涉水活动，所以不要准备进入湿地、红树林根部或围栏后方。若天气炎热，选择容易调整的衣层，避免在室内制造噪声。浅色衣物可降低日晒负担，但不代表可以延长停留；请按身体状况和现场规则决定，并为儿童或长者预留更快返回车辆的选择。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'सामान्य सलाह, स्थानीय अनिवार्यता नहीं: हल्के ढकने वाले कपड़े, पार्किंग और छोटे पहुँच मार्ग के लिए आरामदेह जूते, तथा दिन के पूर्वानुमान अनुसार टोपी या चश्मा रखें। यह हाइड से दर्शन है, कीचड़ में पैदल चलना नहीं; वेटलैंड में उतरने की तैयारी न करें और शांत रहें।',
    ], ['uae-ras-al-khor-dm-plan', 'uae-ras-al-khor-ncm-climate']),
    section('transport', [
      'تسمي صفحة الحجز ثلاثة مخابئ: القرم، والفلامنغو، والبحيرة، ولكل منها تفاصيل موقع منفصلة؛ وقد يكون مخبأ القرم مغلقاً مؤقتاً. استنتاج عملي: رتّب الوصول والعودة بالسيارة أو الأجرة إلى المخبأ المختار، ولا تفترض ممراً مشتركاً بين المخابع أو نقطة بداية مشي واحدة.',
      'The booking page names Mangrove, Flamingo and Lagoon hides, each with separate location details, and notes Mangrove Hide may be temporarily closed. Practical inference: arrange car or taxi access and return for the chosen hide; do not assume a shared walking route or single trailhead.',
      'La page de réservation cite les affûts de mangrove, des flamants et de la lagune, chacun avec ses propres détails, et signale que celui de mangrove peut être fermé. Déduction pratique : organisez voiture ou taxi pour l’affût choisi et le retour ; ne supposez pas un chemin commun ni un seul départ.',
      '预订页面列出红树林、火烈鸟和泻湖三个观鸟屋，各有独立位置，并提示红树林观鸟屋可能临时关闭。实用推断：为选定观鸟屋安排汽车或出租车往返，提前确认司机知道具体入口和返回时间；不要把地图标记当作全部地点的总入口，也不要假设三处之间有共同步行路线、遮阴通道或单一集合点。到达后按现场人员和标志行动。如果计划连续看多个观鸟屋，应把车程、等待和关门时间留出余量；若时间不足，选择一个观鸟屋比匆忙移动更稳妥。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'बुकिंग पृष्ठ मैंग्रोव, फ्लेमिंगो और लैगून हाइड बताता है, हर एक का स्थान अलग है, और मैंग्रोव हाइड अस्थायी रूप से बंद हो सकता है। व्यावहारिक अनुमान: चुने हाइड तक कार या टैक्सी और वापसी तय करें, चालक को सही प्रवेश बताएं, और साझा पैदल मार्ग या एक ही प्रवेश न मानें। स्थल पर संकेत और सुरक्षा निर्देश मानें।',
    ], ['uae-ras-al-khor-dm-book']),
    section('season', [
      'تعرض بلدية دبي مواعيد مختلفة للشتاء والصيف، وتطلب فحص الطقس وجودة الهواء قبل التخطيط. رامسار يوضح أهمية الشتاء للطيور المائية المهاجرة، لكن ذلك ليس ضمان مشاهدة. خطط للحر والرطوبة، وخفّف الزيارة أو أجّلها إذا بدت الظروف غير مناسبة يومها أو أُعلن إغلاق مؤقت.',
      'Dubai Municipality lists different winter and summer timings and asks visitors to check weather and air quality before planning. Ramsar notes winter importance for migratory waterbirds, but that is not a sighting guarantee. Plan for heat and humidity, and shorten or postpone if conditions are unsuitable on the day.',
      'La municipalité de Dubaï publie des horaires d’hiver et d’été et demande de vérifier météo et qualité de l’air. Ramsar souligne l’importance hivernale pour les oiseaux d’eau migrateurs, sans garantie d’observation. Prévoyez chaleur et humidité, et raccourcissez ou reportez si besoin.',
      '迪拜市政公布冬季和夏季开放时间，并要求规划前查看天气与空气质量；国家气象资料可用于确认当天预报。拉姆萨尔资料说明冬季对迁徙水鸟重要，但这不是看到某种鸟或一定开放的保证。请为高温、湿度和强日照做准备，把停留时间安排得保守一些；若当天条件、空气质量或临时关闭信息不合适，应缩短行程、改到较凉时段或改期。不要仅凭月份判断安全，出发前仍应查看最新通知；鸟况、能见度和舒适度都可能在同一天变化。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'दुबई नगरपालिका सर्दी और गर्मी के अलग समय बताती है और योजना से पहले मौसम व हवा की गुणवत्ता जाँचने को कहती है। रामसर सर्दियों में प्रवासी जलपक्षियों का महत्व बताता है, पर दर्शन की गारंटी नहीं। गर्मी और नमी की तैयारी करें; हालात खराब हों तो यात्रा छोटी या स्थगित करें।',
    ], ['uae-ras-al-khor-dm-plan', 'uae-ras-al-khor-ramsar', 'uae-ras-al-khor-ncm-climate']),
    section('nature', [
      'تسجل المصادر تنوعاً واسعاً في الطيور والموائل، بما في ذلك الخواضات والجوارح والقرم والأسماك واللافقاريات. القائمة أدناه أمثلة موثقة أو موسومة كأمثلة تضاريس فقط؛ ليست جرداً كاملاً ولا مفتاح تعريف. راقب من المخبأ، ولا تجمع نباتاً أو حيواناً أو أجزاءً منه.',
      'Sources record diverse birds and habitats, including waders, raptors, mangroves, fish and invertebrates. The entries below are documented examples or marked as terrain examples only; they are not a full inventory or field key. Watch from the hide, and collect no plant, animal or part.',
      'Les sources signalent une forte diversité d’oiseaux et d’habitats : limicoles, rapaces, mangroves, poissons et invertébrés. Les entrées ci-dessous sont documentées ou marquées comme exemples de terrain ; elles ne forment ni inventaire complet ni clé. Observez depuis l’affût, sans prélèvement.',
      '资料记录这里有多样鸟类和生境，包括涉禽、猛禽、红树林、鱼类和无脊椎动物。下列条目要么有地点资料支持，要么明确标为海岸地形示例；它们不是完整名录，也不是野外鉴定钥匙。请从观鸟屋或指定游客区域观察，用望远镜而不是距离来增加细节，不采集任何植物、动物、贝壳、泥土或其部分；若无法确认物种，就只记录为未确定观察。不要播放叫声、投喂或追逐鸟群来取得照片，也不要把网络照片当作当天一定能看到的证据。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'स्रोत विविध पक्षी और आवास बताते हैं, जिनमें वाडर, शिकारी पक्षी, मैंग्रोव, मछलियाँ और अकशेरुकी शामिल हैं। नीचे की प्रविष्टियाँ दस्तावेजित उदाहरण हैं या केवल भूभाग उदाहरण; यह पूरी सूची या पहचान कुंजी नहीं। हाइड या निर्दिष्ट आगंतुक क्षेत्र से दूरबीन से देखें, कोई पौधा, जीव, मिट्टी या भाग न लें। पहचान स्पष्ट न हो तो उसे अनिश्चित अवलोकन मानें।',
    ], ['uae-ras-al-khor-dm-wildlife', 'uae-ras-al-khor-ramsar', 'uae-ras-al-khor-uae-ecosystems']),
    section('hazard', [
      'الاحتياطات هنا مرتبطة بالحر، والطرق القريبة، وحدود المحمية أكثر من صعوبة المشي. تذكّر بلدية دبي بالترطيب وبسلامة الزوار، وتمنع تجاوز اللافتات والأسوار. استنتاج عملي: اختر وقتاً أقصر في الحر، وابقَ مع مجموعتك، واتصل برقم 999 للشرطة أو 998 للإسعاف أو 997 للدفاع المدني عند الطوارئ.',
      'Main precautions are heat, nearby roads and sanctuary boundaries rather than walking difficulty. Dubai Municipality reminds visitors to keep hydrated and not pass signs or fences. Practical inference: choose a shorter visit in heat, stay with your group, and call 999 police, 998 ambulance or 997 civil defence in emergencies.',
      'Les précautions concernent surtout chaleur, routes proches et limites de la réserve, plus que la difficulté de marche. La municipalité de Dubaï rappelle l’hydratation et les clôtures. Déduction pratique : visite plus courte par forte chaleur, restez groupés, et appelez 999, 998 ou 997 en urgence.',
      '主要风险来自高温、附近道路、停车区移动和保护区边界，而不是长距离步行难度。迪拜市政提醒游客保持补水，不得越过标志或围栏，并要求访客对自身和他人安全负责。实用推断：炎热时选择较短停留，避免在道路边追逐鸟影，与同行者保持一起，并把返程交通先安排好；若发生紧急情况，拨打警方999、救护998或民防997。若儿童同行，提前约定集合点并避开车流边缘；身体不适时不要等待拍完照片再离开。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'मुख्य सावधानियाँ पैदल कठिनाई से अधिक गर्मी, पास की सड़कें और अभयारण्य की सीमाएँ हैं। दुबई नगरपालिका पानी पीते रहने और संकेत या बाड़ न पार करने को कहती है। व्यावहारिक अनुमान: गर्मी में यात्रा छोटी रखें, समूह के साथ रहें, और आपात में पुलिस 999, एम्बुलेंस 998 या सिविल डिफेन्स 997 पर कॉल करें।',
    ], ['uae-ras-al-khor-dm-plan', 'uae-emergency']),
    section('visit', [
      'للزائر الفرد أو العائلة، تفيد صفحة الحجز بأن الدخول أثناء ساعات العمل يكون بتسجيل عند الوصول، بينما تحتاج المدارس والشركات الإعلامية والبحثية إلى ترتيبات مسبقة أو شهادة عدم ممانعة. اختر مخبأً واحداً أو أكثر حسب الوقت، وأعد التحقق من الإغلاق المؤقت والمواعيد في يوم الزيارة.',
      'For individuals or families, the booking page says visits during opening hours are by walk-in registration; schools, media and research need advance arrangements or a No Objection Certificate. Choose one or more hides according to time, and recheck temporary closures and timings on the day.',
      'Pour individus et familles, la page de réservation indique une inscription sur place pendant les horaires ; écoles, médias et recherche exigent démarches préalables ou autorisation. Choisissez un ou plusieurs affûts selon le temps disponible, et revérifiez fermetures et horaires le jour même.',
      '对个人或家庭，预订页面说明可在开放时间到场登记；学校、旅游公司、媒体和研究教育活动需要提前通过相应渠道安排，部分用途还需许可或不反对函。请按可用时间选择一个或多个观鸟屋，不要把一次登记理解为可进入湿地内部。出发前和到场时再次确认临时关闭、开放时间、身份要求和现场指示，必要时改为较短访问。若目标是摄影，仍应按普通访客边界行动，并接受窗口、人流和光线条件的限制。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'व्यक्तियों या परिवारों के लिए बुकिंग पृष्ठ खुलने के समय वॉक-इन पंजीकरण बताता है; स्कूल, टूर कंपनी, मीडिया और शोध-शिक्षा को पहले व्यवस्था या अनुमति चाहिए। समय के अनुसार एक या अधिक हाइड चुनें, पर पंजीकरण को वेटलैंड के भीतर प्रवेश न समझें। उसी दिन अस्थायी बंदी, समय, पहचान और स्थल निर्देश फिर जाँचें।',
    ], ['uae-ras-al-khor-dm-book', 'uae-ras-al-khor-dm-plan']),
    section('rules', [
      'القواعد محلية وصارمة: استخدم مخابئ الطيور فقط، ولا تتجاوز لافتات عدم الدخول أو الأسوار، ولا تقترب من الحياة الفطرية أو تطعمها أو تجمع نباتات أو حيوانات. المخبأ منطقة هادئة بلا هاتف أو طعام أو شراب أو تدخين أو حيوانات أليفة. الطائرات المسيّرة ليست مناسبة لزيارة عادية؛ قواعد الإمارات تحصرها في مناطق معتمدة.',
      'Rules are local and strict: use the bird hides only, do not pass No Entry signs or fences, and do not approach, feed, harm or collect wildlife or plants. Hides are quiet zones with no phone use, food, drinks, smoking or pets. Drones are not suitable for a casual visit; UAE rules limit them to approved flying zones.',
      'Les règles locales sont strictes : utilisez seulement les affûts, ne franchissez ni panneaux ni clôtures, n’approchez, ne nourrissez et ne prélevez pas faune ou flore. Les affûts sont silencieux : pas de téléphone, nourriture, boissons, tabac ni animaux. Les drones ne conviennent pas à une visite ordinaire ; règles des ÉAU en zones autorisées.',
      '当地规则严格：普通访客只能使用观鸟屋和指定区域，不得越过禁止进入标志或围栏，不得靠近、投喂、伤害、追逐或采集任何野生动植物。观鸟屋是安静区，禁止使用电话、饮食、吸烟和携带宠物，也不要制造噪声或阻挡他人。无人机不适合普通参观；阿联酋规则把娱乐飞行限制在批准区域，并要求遵守拍摄和安全规定。遇到工作人员指示时，以现场说明为准；不确定时选择更保守的做法。本指南仅用于出行准备，不替代现场许可、天气预报或工作人员判断；若信息冲突，以官方页面和当天指示为准。请把安静观察和不干扰湿地作为默认选择。若仍不确定，请选择更短、更安静、边界更清楚的访问方式。',
      'स्थानीय नियम कड़े हैं: केवल पक्षी हाइड का उपयोग करें, नो एंट्री संकेत या बाड़ पार न करें, वन्यजीव या पौधों के पास न जाएँ, न खिलाएँ, न नुकसान पहुँचाएँ, न संग्रह करें। हाइड शांत क्षेत्र है: फोन, भोजन, पेय, धूम्रपान और पालतू नहीं। सामान्य यात्रा में ड्रोन उपयुक्त नहीं; यूएई नियम केवल स्वीकृत उड़ान क्षेत्र कहते हैं।',
    ], ['uae-ras-al-khor-dm-plan', 'uae-ras-al-khor-uae-aviation', 'uae-emergency']),
  ],
} satisfies Destination & { country: typeof UAE };

export const rules: PackingRule[] = [
  {
    id: 'uae-ras-al-khor-binoculars', version: 1, equipmentId: 'uae-ras-al-khor-binoculars',
    label: ['منظار خفيف للطيور', 'Light birding binoculars', 'Jumelles légères pour oiseaux', '轻便观鸟望远镜', 'हल्की पक्षी-दूरबीन'],
    category: 'essentials', terrainIds: ['coast'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['تذكر بلدية دبي المنظار ضمن ما يفيد في الزيارة؛ الكمية بداية قابلة للتعديل وليست معيار سلامة.', 'Dubai Municipality lists binoculars as useful for a visit; quantity is an editable starting point, not a safety standard.', 'La municipalité de Dubaï cite les jumelles comme utiles ; quantité modifiable, non norme de sécurité.', '迪拜市政列出望远镜为有用物品；数量只是可调整起点，并非安全标准。', 'दुबई नगरपालिका दूरबीन को उपयोगी बताती है; मात्रा बदलने योग्य शुरुआत है, सुरक्षा मानक नहीं।'],
    sourceIds: ['uae-ras-al-khor-dm-plan'], coverage: 'local', destinationIds: ['ras-al-khor'],
  },
  {
    id: 'uae-ras-al-khor-water', version: 1, equipmentId: 'uae-ras-al-khor-water',
    label: ['ماء شخصي خارج المخبأ', 'Personal water outside the hide', 'Eau personnelle hors de l’affût', '观鸟屋外个人饮水', 'हाइड के बाहर निजी पानी'],
    category: 'safety', terrainIds: ['coast'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['تذكّر بلدية دبي بالترطيب وتمنع المشروبات داخل المخبأ؛ اشرب في المكان المسموح فقط.', 'Dubai Municipality reminds visitors to keep hydrated and bans drinks inside hides; drink only where permitted.', 'La municipalité de Dubaï rappelle l’hydratation et interdit les boissons dans l’affût ; buvez seulement où c’est permis.', '迪拜市政提醒补水，并禁止在观鸟屋内饮用；只在允许地点喝水。', 'दुबई नगरपालिका पानी पीते रहने को कहती है और हाइड में पेय रोकती है; केवल अनुमति वाली जगह पानी पिएँ।'],
    sourceIds: ['uae-ras-al-khor-dm-plan'], coverage: 'local', destinationIds: ['ras-al-khor'],
  },
  {
    id: 'uae-ras-al-khor-id', version: 1, equipmentId: 'uae-ras-al-khor-id',
    label: ['هوية مناسبة للتسجيل', 'Suitable ID for registration', 'Pièce d’identité pour inscription', '用于登记的身份证件', 'पंजीकरण के लिए पहचान'],
    category: 'essentials', terrainIds: ['coast'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['توضح صفحة الحجز أن التسجيل عند الوصول مطلوب وقد يطلب الأمن الهوية؛ تحقق من المتطلبات يوم الزيارة.', 'The booking page says walk-in registration is required and security may ask for ID; check requirements on the day.', 'La page de réservation exige une inscription sur place et la sécurité peut demander une pièce ; vérifiez le jour même.', '预订页面说明到场登记是必需的，安保可能要求证件；请当天核对要求。', 'बुकिंग पृष्ठ वॉक-इन पंजीकरण आवश्यक बताता है और सुरक्षा पहचान माँग सकती है; उसी दिन आवश्यकताएँ जाँचें।'],
    sourceIds: ['uae-ras-al-khor-dm-book'], coverage: 'local', destinationIds: ['ras-al-khor'],
  },
];
