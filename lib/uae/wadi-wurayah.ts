import type { Destination, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { UAE, UAE_TZ, reviewedAt, section, sectionOrder } from './shared';

export const sources: SourceReference[] = [
  { id: 'uae-wadi-wurayah-emiratesnature-establish', title: 'Emirates Nature-WWF · Helping establish the Wadi Wurayah National Park', url: 'https://www.emiratesnaturewwf.ae/en/page/helping-establish-the-wadi-wurayah-national-park', reviewedAt },
  { id: 'uae-wadi-wurayah-ramsar-ris', title: 'Ramsar Sites Information Service · Wadi Wurayah National Park', url: 'https://rsis.ramsar.org/ris/1932', reviewedAt },
  { id: 'uae-wadi-wurayah-moccae-ecotourism', title: 'Ministry of Climate Change and Environment · محمية وادي الوريعة الوطنية', url: 'https://www.moccae.gov.ae/ar/knowledge/ecotourism/wadi-wurayah-national-park', reviewedAt },
  { id: 'uae-wadi-wurayah-fea-visitor', title: 'Fujairah Environment Authority · تسجيل زائر وادي الوريعة', url: 'https://fea.gov.ae/portal/WadiWurayah', reviewedAt },
  { id: 'uae-wadi-wurayah-fea-service-terms', title: 'Fujairah Environment Authority · Terms of Service', url: 'https://services.fea.gov.ae/customer/Site/ServiceDetail/59', reviewedAt },
  { id: 'uae-wadi-wurayah-emiratesnature-winter-camp', title: 'Emirates Nature-WWF · Emirates Nature-WWF launches first Winter Camp to support conservation of nature and wildlife', url: 'https://www.emiratesnaturewwf.ae/en/press-release/50-emirates-nature-wwf-launches-first-winter-camp-to-support-conservation-of-nature-and-wildlife', reviewedAt },
  { id: 'uae-wadi-wurayah-emiratesnature-blanfords-fox', title: 'Emirates Nature-WWF · Caught on Camera: Elusive Blanford’s Fox spotted in UAE’s Wadi Wurayah National Park', url: 'https://www.emiratesnaturewwf.ae/en/press-release/19-caught-on-camera-elusive-blanfords-fox-spotted-in-uaes-wadi-wurayah-national-park', reviewedAt },
  { id: 'uae-wadi-wurayah-emiratesnature-caracal', title: 'Emirates Nature-WWF · World Habitat Day: Arabian Caracal rediscovered in UAE’s Wadi Wurayah National Park', url: 'https://www.emiratesnaturewwf.ae/en/press-release/42-world-habitat-day-arabian-caracal-rediscovered-in-uaes-wadi-wurayah-national-park', reviewedAt },
  { id: 'uae-wadi-wurayah-emiratesnature-scorpion', title: 'Emirates Nature-WWF · Leaders of Change make an exciting discovery in Wadi Wurayah National Park', url: 'https://www.emiratesnaturewwf.ae/en/blogs/31-leaders-of-change-make-an-exciting-discovery-in-wadi-wurayah-national-park', reviewedAt },
  { id: 'uae-wadi-wurayah-ncm-warnings', title: 'National Center of Meteorology · Early Warnings for All - UAE', url: 'https://ew4all.ncm.gov.ae/?lang=en', reviewedAt },
];

const species: SpeciesEntry[] = [
  {
    id: 'uae-wadi-wurayah-arabian-tahr', coverage: 'local',
    name: ['الطهر العربي', 'Arabian tahr', 'Tahr d’Arabie', '阿拉伯塔尔羊', 'अरबी तहर'],
    description: ['تذكر رامسار ووثائق الرصد وجود الطهر العربي في وادي الوريعة. هذه إشارة تعريف عامة لا وعد برؤية أو موقع محدد داخل المحمية.', 'Ramsar and monitoring sources document Arabian tahr in Wadi Wurayah. This is broad recognition guidance, not a promise of a sighting or location inside the reserve.', 'Ramsar et les suivis citent le tahr d’Arabie à Wadi Wurayah. C’est une aide générale, sans promesse d’observation ni de lieu précis.', '拉姆萨尔和监测资料记录瓦迪武拉亚有阿拉伯塔尔羊。本说明仅供概括认识，不承诺能看到或给出具体地点。', 'रामसर और निगरानी स्रोत वाडी वुरायाह में अरबी तहर बताते हैं। यह सामान्य पहचान है, दिखने या स्थान का वादा नहीं।'],
    precaution: ['راقبه من مسافة وبوجود المختصين فقط؛ لا تطارده أو تحاول جذبه للطعام.', 'Observe only at distance and with specialists; do not chase it or try to attract it with food.', 'Observez à distance et avec les spécialistes ; ne le poursuivez pas et ne l’attirez pas avec de la nourriture.', '只在专家带领下远距离观察；不要追赶，也不要用食物引诱。', 'केवल दूरी से और विशेषज्ञों के साथ देखें; पीछा न करें और भोजन से आकर्षित न करें।'],
    sourceIds: ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-emiratesnature-blanfords-fox'],
  },
  {
    id: 'uae-wadi-wurayah-arabian-caracal', coverage: 'local',
    name: ['العناق العربي', 'Arabian caracal', 'Caracal d’Arabie', '阿拉伯狞猫', 'अरबी कराकल'],
    description: ['وثقت كاميرات الرصد العناق العربي في المحمية. وجود مفترس ليلي نادر لا يعني اقتراباً آمناً ولا يدل على تعافٍ مضمون.', 'Motion cameras documented Arabian caracal in the park. A rare nocturnal predator’s presence is not an invitation to approach and does not guarantee recovery.', 'Des caméras ont documenté le caracal d’Arabie dans le parc. La présence d’un prédateur nocturne rare n’autorise pas l’approche et ne garantit pas son rétablissement.', '红外相机在园区记录到阿拉伯狞猫。罕见夜行捕食者的存在不表示可以靠近，也不保证种群恢复。', 'कैमरों ने पार्क में अरबी कराकल दर्ज किया। दुर्लभ रात्रि शिकारी की मौजूदगी पास जाने का निमंत्रण या पुनर्प्राप्ति की गारंटी नहीं है।'],
    precaution: ['اتبع تعليمات الجهة المنظمة ولا تتحرك ليلاً خارج برنامج مصرح.', 'Follow organiser instructions and do not move at night outside an authorised programme.', 'Suivez les consignes de l’organisateur et ne circulez pas de nuit hors programme autorisé.', '遵守组织方指示，不要在获准活动之外夜间行动。', 'आयोजक के निर्देश मानें और अनुमति प्राप्त कार्यक्रम के बाहर रात में न चलें।'],
    sourceIds: ['uae-wadi-wurayah-emiratesnature-caracal'],
  },
  {
    id: 'uae-wadi-wurayah-blanfords-fox', coverage: 'local',
    name: ['ثعلب بلانفورد', 'Blanford’s fox', 'Renard de Blanford', '布兰福德狐', 'ब्लैनफर्ड लोमड़ी'],
    description: ['تذكر مبادرة الرصد صوراً لثعلب بلانفورد في وادي الوريعة. قد يكون ليلياً وخجولاً، لذلك لا تعتمد على رؤيته أثناء زيارة قصيرة.', 'The monitoring initiative reports images of Blanford’s fox in Wadi Wurayah. It can be nocturnal and shy, so do not expect a short visit to reveal it.', 'L’initiative de suivi signale des images du renard de Blanford à Wadi Wurayah. Nocturne et discret, il ne faut pas compter le voir lors d’une courte visite.', '监测项目报告在瓦迪武拉亚拍到布兰福德狐。它可能夜行且隐蔽，短暂访问不应期待看到。', 'निगरानी पहल वाडी वुरायाह में ब्लैनफर्ड लोमड़ी की तस्वीरें बताती है। यह रात में सक्रिय और छिपी रहती है, इसलिए छोटी यात्रा में दिखना न मानें।'],
    precaution: ['لا تستخدم إضاءة أو تشغيل صوت لجذبه؛ اترك الرصد للكاميرات والباحثين.', 'Do not use lights or playback to attract it; leave detection to cameras and researchers.', 'N’utilisez ni lampe ni diffusion sonore pour l’attirer ; laissez le suivi aux caméras et chercheurs.', '不要用灯光或录音吸引；把监测交给相机和研究人员。', 'आकर्षित करने के लिए रोशनी या आवाज़ न चलाएँ; पहचान कैमरों और शोधकर्ताओं पर छोड़ें।'],
    sourceIds: ['uae-wadi-wurayah-emiratesnature-blanfords-fox'],
  },
  {
    id: 'uae-wadi-wurayah-garra-fish', coverage: 'local',
    name: ['أسماك الغرّا في الوادي', 'Wadi Garra fish', 'Poisson Garra du wadi', '溪谷加拉鱼', 'वादी गारा मछली'],
    description: ['تسجل رامسار موائل مياه عذبة مهمة للتكاثر، ومنها أسماك غرّا مرتبطة بالجزيرة العربية. لا يعني ذلك أن البرك متاحة للسباحة أو اللمس.', 'Ramsar records freshwater habitats important for spawning, including Arabian Peninsula Garra fish. This does not mean pools are open for swimming or handling.', 'Ramsar décrit des habitats d’eau douce importants pour la reproduction, dont des poissons Garra de la péninsule Arabique. Cela n’ouvre pas les vasques à la baignade ni au toucher.', '拉姆萨尔记录这里有重要淡水繁殖生境，包括阿拉伯半岛加拉鱼。这不表示水池可游泳或触碰。', 'रामसर यहाँ प्रजनन के लिए महत्वपूर्ण मीठे पानी के आवास और अरब प्रायद्वीप की गारा मछली बताता है। इसका अर्थ तैराकी या छूने की अनुमति नहीं है।'],
    precaution: ['لا تدخل البرك أو تنقل كائناً مائياً إلا بتصريح بحثي واضح.', 'Do not enter pools or move aquatic life unless a clear research permission covers it.', 'N’entrez pas dans les vasques et ne déplacez aucun organisme aquatique sans permis de recherche clair.', '没有明确科研许可，不要进入水池或移动水生生物。', 'स्पष्ट शोध अनुमति न हो तो जलकुंड में न उतरें और जलीय जीव न हटाएँ।'],
    sourceIds: ['uae-wadi-wurayah-ramsar-ris'],
  },
  {
    id: 'uae-wadi-wurayah-orthochirus-scorpion', coverage: 'local',
    name: ['عقرب أورثوكيروس', 'Orthochirus scorpion', 'Scorpion Orthochirus', 'Orthochirus蝎', 'ऑर्थोकाइरस बिच्छू'],
    description: ['تصف رحلة علم مواطن ليلي عقارب كثيرة وعقرباً من جنس أورثوكيروس قد يحتاج تحديده للفحص المتخصص. هذا تنبيه سلامة لا مفتاح تعريف.', 'A citizen-science night survey describes many scorpions and an Orthochirus scorpion needing specialist confirmation. Treat this as a safety note, not an identification key.', 'Une sortie nocturne participative décrit de nombreux scorpions et un Orthochirus nécessitant confirmation spécialisée. C’est une note de sécurité, pas une clé d’identification.', '一次夜间公民科学调查描述了许多蝎子及需专家确认的Orthochirus蝎。本条是安全提示，不是鉴定钥匙。', 'रात्रि नागरिक-विज्ञान सर्वेक्षण कई बिच्छू और विशेषज्ञ पुष्टि वाला ऑर्थोकाइरस बताता है। इसे सुरक्षा सूचना मानें, पहचान कुंजी नहीं।'],
    precaution: ['ارتد حذاءً مغلقاً ولا تضع يدك تحت الصخور؛ اترك الالتقاط للمختصين.', 'Wear closed footwear and do not put hands under rocks; leave handling to specialists.', 'Portez des chaussures fermées et ne mettez pas les mains sous les pierres ; laissez la manipulation aux spécialistes.', '穿包脚鞋，不要把手伸到石下；捕捉交给专家。', 'बंद जूते पहनें और पत्थरों के नीचे हाथ न डालें; संभालना विशेषज्ञों पर छोड़ें।'],
    sourceIds: ['uae-wadi-wurayah-emiratesnature-scorpion'],
  },
];

const sections = [
  section('place', [
    'وادي الوريعة في جبال الحجر بالفجيرة محمية جبلية وموقع رامسار يضم مجاري وبرك مياه عذبة نادرة في بيئة جافة. المؤشر تقريبي لمنطقة المتنزه، وليس بداية مسار أو دعوة للدخول؛ الصورة توضيحية. خطط على أن الوصول منظم ومتغير، وتحقق في يوم التخطيط. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Wadi Wurayah in Fujairah’s Hajar Mountains is a mountain protected area and Ramsar site with freshwater streams and pools that are unusual in an arid setting. This is an approximate area marker, not a trailhead or entry invitation; the image is illustrative. Treat access as regulated and check on the day.',
    'Wadi Wurayah, dans les monts Hajar de Fujairah, est une aire montagneuse protégée et un site Ramsar avec cours d’eau et vasques rares en milieu aride. Le repère est approximatif, pas un départ ni une invitation d’entrée ; image illustrative. L’accès est réglementé : vérifiez le jour même.',
    '瓦迪武拉亚位于富查伊拉哈杰尔山，是山地保护区和拉姆萨尔地，拥有在干旱环境中少见的淡水溪流与水池。标记仅示大致区域，不是步道起点或入园邀请；图片为示意。请按受管制进入规划，并当天核对。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'फुजैरा के हजर पर्वतों में वाडी वुरायाह पर्वतीय संरक्षित क्षेत्र और रामसर स्थल है, जहाँ शुष्क इलाके में दुर्लभ मीठे पानी की धाराएँ और कुंड हैं। चिह्न अनुमानित क्षेत्र है, पगडंडी या प्रवेश आमंत्रण नहीं; चित्र उदाहरणात्मक है। पहुँच नियंत्रित मानें और उसी दिन जाँचें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-emiratesnature-establish', 'uae-wadi-wurayah-moccae-ecotourism']),
  section('equipment', [
    'استنتاج عملي: قبل تجهيز حقيبة طويلة، ثبّت سبب الزيارة والتصريح أو البرنامج المعتمد؛ فصفحة الهيئة تقول إن الطلب قد يوافق أو يرفض ولا يسمح حالياً بالدخول للترفيه. احمل هوية، ماءً شخصياً، نسخة غير متصلة من الموافقة، ومصباحاً فقط إذا كان النشاط الليلي منظماً. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Practical inference: before packing for a long outing, confirm the visit purpose and approved permit or programme; the authority page says requests may be approved or rejected and current leisure entry is not allowed. Carry ID, personal water, offline approval details and a lamp only if a night activity is organised.',
    'Déduction pratique : avant de préparer une longue sortie, confirmez le motif et le permis ou programme approuvé ; l’autorité indique que la demande peut être acceptée ou refusée et que l’entrée de loisir n’est pas permise actuellement. Gardez identité, eau, accord hors ligne et lampe seulement pour activité nocturne encadrée.',
    '实用推断：准备长时间外出装备前，先确认访问目的和获批许可或项目；主管页面说明申请可批准也可拒绝，目前不允许娱乐进入。携带身份证件、个人饮水、离线批准信息；只有参加组织的夜间活动才带灯。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'व्यावहारिक अनुमान: लंबी यात्रा का सामान रखने से पहले उद्देश्य और स्वीकृत अनुमति या कार्यक्रम पक्का करें; प्राधिकरण पृष्ठ बताता है कि आवेदन स्वीकार या अस्वीकार हो सकता है और अभी मनोरंजन प्रवेश नहीं है। पहचान, अपना पानी, ऑफलाइन स्वीकृति और रात कार्यक्रम हो तो ही दीपक रखें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-fea-visitor', 'uae-wadi-wurayah-emiratesnature-winter-camp']),
  section('clothing', [
    'نصيحة عامة وليست شرطاً محلياً: اختر ملابس ساترة خفيفة وحذاءً جبلياً مغلقاً للركام والصخور، مع قبعة وحماية شمس. للزيارة المصرح بها ليلاً أو قرب الماء أضف طبقة خفيفة ولا تعتمد على البلل أو الظل للتبريد؛ غيّر الخطة إذا صدرت تنبيهات طقس. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'General advice, not a local requirement: use light covering clothing and closed mountain footwear for rubble and rock, with a hat and sun protection. For authorised night or water-adjacent work, add a light layer and do not rely on shade or wet clothing for cooling; change plans if warnings are issued.',
    'Conseil général, non exigence locale : vêtements légers couvrants, chaussures fermées de montagne pour pierres et éboulis, chapeau et protection solaire. Pour activité autorisée de nuit ou près de l’eau, ajoutez une couche légère ; ne comptez pas sur l’ombre ou les vêtements mouillés pour refroidir.',
    '一般建议，并非当地规定：穿轻薄遮蔽衣物和适合碎石岩面的包脚山地鞋，并带帽子与防晒。若获准夜间或近水活动，加一件轻薄外层；不要依赖阴影或湿衣降温，发布天气预警时应改变计划。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'सामान्य सलाह, स्थानीय शर्त नहीं: हल्के ढकने वाले कपड़े, पत्थर और ढलान के लिए बंद पर्वतीय जूते, टोपी और धूप सुरक्षा रखें। अनुमति वाले रात या पानी के पास काम में हल्की परत जोड़ें; छाया या भीगे कपड़ों पर ठंडक के लिए निर्भर न रहें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-emiratesnature-scorpion', 'uae-wadi-wurayah-ncm-warnings']),
  section('transport', [
    'لا تستخدم الإحداثيات كمسار قيادة. تذكر وزارة المناخ الطريق الساحلي إلى المنطقة، لكن صفحة الهيئة تجعل الدخول نفسه مشروطاً بالموافقة. رتّب نقطة لقاء مكتوبة مع الجهة المنظمة، ولا تقد سيارة داخل المحمية أو على طرق ترابية إلا إذا ورد ذلك صراحة في تصريحك الحالي. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Do not use the coordinates as driving instructions. The ministry describes coastal access toward the area, but the authority page makes entry conditional on approval. Arrange a written meeting point with the organiser, and do not drive inside the reserve or on dirt tracks unless the current permit explicitly says so.',
    'N’utilisez pas les coordonnées comme itinéraire. Le ministère évoque un accès côtier vers la zone, mais l’autorité conditionne l’entrée à l’approbation. Fixez un point de rendez-vous écrit avec l’organisateur, sans conduire dans la réserve ni sur pistes sauf mention explicite du permis actuel.',
    '不要把坐标当作驾驶指引。部委资料提到沿海道路通向区域，但主管页面说明进入须经批准。请与组织方书面确认集合点；除非当前许可明确写明，不要在保护区内或土路上驾驶。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'निर्देशांकों को ड्राइविंग निर्देश न मानें। मंत्रालय क्षेत्र तक तटीय पहुँच बताता है, पर प्राधिकरण प्रवेश को स्वीकृति पर निर्भर करता है। आयोजक से लिखित मिलने का स्थान तय करें; मौजूदा अनुमति साफ न कहे तो रिज़र्व या कच्चे मार्ग पर वाहन न चलाएँ। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-moccae-ecotourism', 'uae-wadi-wurayah-fea-visitor']),
  section('season', [
    'استنتاج عملي: الوادي الجبلي قد يجمع حرارة مكشوفة وخطر جريان مفاجئ بعد المطر. لا تستخدم المتوسطات أو صور البرك كضمان لحالة اليوم؛ راجع تنبيهات المركز الوطني للأرصاد وقنوات الجهة المنظمة، وأجّل أي طلب زيارة إذا كان المطر أو السيول أو الحرارة يجعل الإخلاء صعباً. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Practical inference: a mountain wadi can combine exposed heat with sudden runoff after rain. Do not treat averages or pool photographs as today’s conditions; check National Center of Meteorology warnings and organiser channels, and postpone any visit request if rain, flooding or heat would make evacuation difficult.',
    'Déduction pratique : un wadi de montagne peut associer chaleur exposée et ruissellement soudain après pluie. Les moyennes et photos de vasques ne décrivent pas le jour prévu ; consultez les alertes du Centre national de météorologie et l’organisateur, puis reportez si pluie, crue ou chaleur complique l’évacuation.',
    '实用推断：山地溪谷可能同时有暴露高温和雨后突发径流。不要把平均值或水池照片当作当天情况；查看国家气象中心预警和组织方通知。若降雨、洪水或高温会使撤离困难，应推迟访问申请。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'व्यावहारिक अनुमान: पर्वतीय वाडी में खुली गर्मी और बारिश के बाद अचानक बहाव साथ हो सकते हैं। औसत या कुंड की तस्वीरों को आज की स्थिति न मानें; राष्ट्रीय मौसम केंद्र की चेतावनी और आयोजक सूचना देखें, तथा बारिश, बाढ़ या गर्मी में निकासी कठिन हो तो यात्रा टालें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-ncm-warnings']),
  section('nature', [
    'توثق المصادر مياه عذبة وبركاً وشلالات وأنواعاً عديدة، منها الطهر العربي وثعلب بلانفورد والعناق العربي وأسماك غرّا وعقارب. هذه قائمة انتباه وليست دليلاً ميدانياً؛ لا تلمس الماء أو الصخور أو النباتات، ولا تجمع عينة إلا ضمن بحث مصرح به ومشرف عليه. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Sources document freshwater pools, waterfalls and many species, including Arabian tahr, Blanford’s fox, Arabian caracal, Garra fish and scorpions. This is an awareness list, not a field guide; do not touch water, rocks or plants, and collect no sample unless supervised research permission covers it.',
    'Les sources documentent eaux douces, vasques, cascades et espèces comme tahr d’Arabie, renard de Blanford, caracal d’Arabie, poissons Garra et scorpions. Liste de vigilance, non guide de terrain : ne touchez pas eau, roches ni plantes ; aucun prélèvement sans recherche autorisée et encadrée.',
    '资料记录这里有淡水池、瀑布和多种物种，包括阿拉伯塔尔羊、布兰福德狐、阿拉伯狞猫、加拉鱼和蝎子。这是认知清单，不是野外手册；不要触碰水体、岩石或植物，除非获准科研并受监督，否则不采样。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'स्रोत मीठे जलकुंड, झरने और कई प्रजातियाँ बताते हैं, जिनमें अरबी तहर, ब्लैनफर्ड लोमड़ी, अरबी कराकल, गारा मछली और बिच्छू हैं। यह जागरूकता सूची है, फील्ड गाइड नहीं; पानी, पत्थर या पौधे न छुएँ और स्वीकृत निगरानी वाले शोध के बिना नमूना न लें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-emiratesnature-blanfords-fox', 'uae-wadi-wurayah-emiratesnature-caracal', 'uae-wadi-wurayah-emiratesnature-scorpion']),
  section('hazard', [
    'المخاطر هنا مرتبطة بالوادي الجبلي أكثر من مسار منشور: سيول مفاجئة، صخور زلقة أو مفككة، حرارة، وعقارب أو زواحف أثناء العمل الليلي. استنتاج عملي: لا تدخل مجرى وادٍ عند تنبيه مطر، ولا تبتعد عن الفريق المصرح. للطوارئ في الإمارات احتفظ بـ 999 و998 و997. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Hazards are tied to the mountain wadi rather than a published trail: flash runoff, slippery or loose rock, heat, and scorpions or reptiles during night work. Practical inference: do not enter a wadi channel under rain warnings, and do not leave the authorised group. For UAE emergencies keep 999, 998 and 997.',
    'Les dangers relèvent du wadi de montagne plutôt que d’un sentier publié : crues soudaines, roche glissante ou instable, chaleur, scorpions ou reptiles lors du travail nocturne. Déduction pratique : n’entrez pas dans le lit sous alerte pluie et ne quittez pas le groupe autorisé. Urgences : 999, 998, 997.',
    '风险来自山地溪谷本身，而不是公开步道：突发径流、湿滑或松动岩石、高温，以及夜间活动中的蝎子或爬行动物。实用推断：有降雨预警时不要进入沟道，不要离开获准团队。阿联酋紧急电话请保存999、998、997。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'जोखिम प्रकाशित पगडंडी से नहीं, पर्वतीय वाडी से जुड़े हैं: अचानक बहाव, फिसलन या ढीली चट्टान, गर्मी, और रात कार्य में बिच्छू या सरीसृप। व्यावहारिक अनुमान: बारिश चेतावनी में वाडी तल में न जाएँ और अनुमति वाले समूह से अलग न हों। आपात नंबर 999, 998, 997 रखें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-emiratesnature-scorpion', 'uae-wadi-wurayah-ncm-warnings', 'uae-emergency']),
  section('visit', [
    'الزيارة العامة ليست أمراً مفترضاً. تقول هيئة الفجيرة إن الدخول للترفيه أو الأنشطة الترفيهية غير مسموح حالياً، وتعرض صفحة أخرى أن بعض الوصول النادر يكون عبر برامج علم مواطن أو رحلات ترميم منظمة. اختر نشاطاً فقط بعد موافقة مكتوبة، وأكد قبل الانطلاق أن الموعد ما زال قائماً. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Public visiting should not be assumed. Fujairah Environment Authority says entry for entertainment or recreational activities is currently not allowed, while another source describes rare access through citizen-science or restoration programmes. Choose an activity only after written approval, and check on the day that it still runs.',
    'La visite publique ne doit pas être présumée. L’Autorité de Fujairah indique que l’entrée de loisir ou récréative n’est pas permise actuellement ; une autre source décrit un accès rare via science participative ou restauration. Choisissez une activité seulement après accord écrit et vérifiez le jour même.',
    '不要默认可以公众参观。富查伊拉环境署说明目前不允许娱乐或休闲活动进入，另一资料提到少数进入机会来自公民科学或修复项目。只有取得书面批准后才选择活动，并在当天确认活动仍然进行。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'सार्वजनिक यात्रा मानकर न चलें। फुजैरा पर्यावरण प्राधिकरण कहता है कि मनोरंजन या अवकाश गतिविधि के लिए प्रवेश अभी अनुमति नहीं है, जबकि दूसरा स्रोत नागरिक-विज्ञान या पुनर्स्थापन कार्यक्रमों से दुर्लभ पहुँच बताता है। लिखित स्वीकृति के बाद ही गतिविधि चुनें और उसी दिन पुष्टि करें। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-fea-visitor', 'uae-wadi-wurayah-emiratesnature-winter-camp']),
  section('rules', [
    'القواعد الأساسية: اطلب الإذن عبر القناة الرسمية، واقبل أن الطلب قد يرفض. لا تخطط للترفيه أو السباحة أو المشي المستقل. لا تترك نفايات، ولا تشعل ناراً، ولا تقد خارج الطريق؛ فشروط الهيئة تمنع إيذاء الكائنات أو البيئة وتطلب موافقة مسبقة للتصوير. للطوارئ استخدم 999 أو 998 أو 997. راجع التعليمات الرسمية نفسها ولا تبنِ قرارك على صور قديمة.',
    'Core rules: request permission through the official channel and accept that it may be refused. Do not plan leisure entry, swimming or independent hiking. Do not litter, light fires or drive off-road; authority terms prohibit harming living organisms or the environment and require prior approval for photography. For emergencies use 999, 998 or 997.',
    'Règles centrales : demandez l’autorisation par le canal officiel et acceptez un refus possible. Ne prévoyez ni loisir, ni baignade, ni randonnée autonome. Aucun déchet, feu ou hors-piste ; les conditions interdisent de nuire aux organismes ou au milieu et exigent accord préalable pour filmer. Urgence : 999, 998 ou 997.',
    '核心规则：通过官方渠道申请许可，并接受可能被拒绝。不要计划休闲进入、游泳或独立徒步。不要丢弃垃圾、点火或越野驾驶；主管条款禁止伤害生物或环境，并要求拍摄事先批准。紧急情况拨999、998或997。 进入信息可能因保护管理、天气和研究安排而改变；不要根据旧游记、地图评论或照片推断道路、停车点、水池开放或许可状态。若没有明确书面批准，应把该地点视为不可进入，并把行程改为外围了解或室内准备；团队成员也应提前共享联系人、返回时间和取消条件，避免临时决定造成越界或救援困难。 任何疑问都应在出发前向管理方确认，并保留回复记录；若条件变化，应取消或改期。',
    'मुख्य नियम: आधिकारिक माध्यम से अनुमति माँगें और अस्वीकृति संभव मानें। मनोरंजन प्रवेश, तैराकी या स्वतंत्र पैदल यात्रा की योजना न बनाएँ। कचरा न छोड़ें, आग न जलाएँ, ऑफ-रोड न चलाएँ; प्राधिकरण शर्तें जीवों या पर्यावरण को हानि रोकती हैं और फोटो के लिए पूर्व स्वीकृति माँगती हैं। आपात में 999, 998 या 997। नवीनतम लिखित निर्देश देखें और पुराने चित्रों या टिप्पणियों को अनुमति न मानें।',
  ], ['uae-wadi-wurayah-fea-visitor', 'uae-wadi-wurayah-fea-service-terms', 'uae-emergency']),
];

if (sections.map(({ id }) => id).join('|') !== sectionOrder.join('|')) throw new Error('Unexpected section order');

export const destination = {
  id: 'wadi-wurayah', country: UAE, terrainId: 'mountain', terrainIndex: 1, lat: 25.4, lon: 56.25, timezone: UAE_TZ,
  names: ['وادي الوريعة الوطني', 'Wadi Wurayah National Park', 'Parc national de Wadi Wurayah', '瓦迪武拉亚国家公园', 'वाडी वुरायाह राष्ट्रीय उद्यान'],
  summary: ['محمية جبلية في الفجيرة وموقع رامسار لوديان وبرك عذبة؛ الدخول منظم وغير ترفيهي حالياً، والمؤشر تقريبي.', 'Fujairah mountain protected area and Ramsar site with freshwater wadis and pools; access is regulated and not for leisure now, marker approximate.', 'Aire montagneuse protégée de Fujairah et site Ramsar avec wadis et vasques d’eau douce ; accès réglementé, pas de loisir actuel, repère approximatif.', '富查伊拉山地保护区和拉姆萨尔地，有淡水溪谷与水池；进入受管制，目前不作休闲开放，标记近似。', 'फुजैरा का पर्वतीय संरक्षित रामसर स्थल, मीठे पानी की वाडियों और कुंडों सहित; प्रवेश नियंत्रित है, अभी मनोरंजन हेतु नहीं, चिह्न अनुमानित।'],
  image: '/images/mountain.jpg', imageIsIllustrative: true,
  sourceIds: ['uae-wadi-wurayah-emiratesnature-establish', 'uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-fea-visitor', 'uae-wadi-wurayah-ncm-warnings'],
  species,
  sections,
} satisfies Destination & { country: typeof UAE };

export const rules: PackingRule[] = [
  {
    id: 'uae-wadi-wurayah-permit-proof', version: 1, equipmentId: 'uae-wadi-wurayah-permit-proof',
    label: ['إثبات التصريح والهوية', 'Permit proof and ID', 'Preuve de permis et identité', '许可证明和身份证件', 'अनुमति प्रमाण और पहचान'],
    category: 'essentials', terrainIds: ['mountain'], activities: [], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['الوصول إلى وادي الوريعة يتطلب طلباً قد يوافق عليه أو يرفض؛ احتفظ بالموافقة وتعليمات الجهة المنظمة دون اتصال.', 'Access to Wadi Wurayah requires a request that may be approved or refused; keep approval and organiser instructions offline.', 'L’accès à Wadi Wurayah demande une requête qui peut être acceptée ou refusée ; gardez accord et consignes hors ligne.', '进入瓦迪武拉亚需申请，可能批准也可能拒绝；请离线保存批准和组织方说明。', 'वाडी वुरायाह प्रवेश के लिए आवेदन चाहिए जो स्वीकार या अस्वीकार हो सकता है; स्वीकृति और आयोजक निर्देश ऑफलाइन रखें।'],
    sourceIds: ['uae-wadi-wurayah-fea-visitor'], coverage: 'local', destinationIds: ['wadi-wurayah'],
  },
  {
    id: 'uae-wadi-wurayah-warning-check', version: 1, equipmentId: 'uae-wadi-wurayah-warning-check',
    label: ['فحص تنبيهات الطقس يومياً', 'Same-day weather warning check', 'Vérification météo du jour', '当天气象预警核对', 'उसी दिन मौसम चेतावनी जाँच'],
    category: 'safety', terrainIds: ['mountain'], activities: ['walking'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: false,
    reason: ['طبيعة الوادي الجبلي تجعل المطر والجريان المفاجئ سبباً لتغيير الخطة؛ راجع تنبيهات المركز الوطني للأرصاد قبل التحرك.', 'Mountain wadi conditions make rain and sudden runoff reasons to change plans; review National Center of Meteorology warnings before moving.', 'Dans un wadi de montagne, pluie et ruissellement soudain justifient de changer de plan ; consultez les alertes météo avant départ.', '山地溪谷中降雨和突发径流足以改变计划；行动前查看国家气象中心预警。', 'पर्वतीय वाडी में बारिश और अचानक बहाव योजना बदलने का कारण हैं; चलने से पहले राष्ट्रीय मौसम केंद्र चेतावनी देखें।'],
    sourceIds: ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-ncm-warnings'], coverage: 'local', destinationIds: ['wadi-wurayah'],
  },
  {
    id: 'uae-wadi-wurayah-closed-footwear', version: 1, equipmentId: 'uae-wadi-wurayah-closed-footwear',
    label: ['حذاء جبلي مغلق', 'Closed mountain footwear', 'Chaussures de montagne fermées', '包脚山地鞋', 'बंद पर्वतीय जूते'],
    category: 'clothing', terrainIds: ['mountain'], activities: ['walking'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['الرصد الليلي وثّق عقارب كثيرة، والتضاريس صخرية؛ الحذاء المغلق احتياط عملي للزيارات المصرح بها.', 'Night monitoring documented many scorpions and the terrain is rocky; closed footwear is a practical precaution for authorised visits.', 'Le suivi nocturne a documenté de nombreux scorpions et le terrain est rocheux ; chaussures fermées utiles pour visites autorisées.', '夜间监测记录许多蝎子且地形多岩；包脚鞋是获准访问的实用防护。', 'रात्रि निगरानी ने कई बिच्छू दर्ज किए और भूभाग पथरीला है; स्वीकृत यात्रा में बंद जूते व्यावहारिक सावधानी हैं।'],
    sourceIds: ['uae-wadi-wurayah-emiratesnature-scorpion', 'uae-wadi-wurayah-ramsar-ris'], coverage: 'local', destinationIds: ['wadi-wurayah'],
  },
  {
    id: 'uae-wadi-wurayah-personal-water', version: 1, equipmentId: 'uae-wadi-wurayah-personal-water',
    label: ['ماء شخصي كاف', 'Personal water reserve', 'Réserve d’eau personnelle', '个人饮水储备', 'व्यक्तिगत पानी भंडार'],
    category: 'essentials', terrainIds: ['mountain'], activities: ['walking'], months: [], minDays: 0, transport: [], baseQuantity: 1, perPerson: true,
    reason: ['المكان مورد مياه عذبة محمي وليس مصدراً للشرب أو السباحة للزائر؛ احمل ماءك ولا تلمس البرك إلا ضمن تصريح بحثي.', 'The site is a protected freshwater resource, not a visitor drinking or swimming source; carry your own water and do not touch pools except under research permission.', 'Le site est une ressource d’eau douce protégée, non une eau à boire ou baignade pour visiteurs ; apportez votre eau et ne touchez pas les vasques sans permis de recherche.', '这里是受保护淡水资源，不是游客饮水或游泳水源；请自带饮水，除非有科研许可，不要触碰水池。', 'यह संरक्षित मीठे पानी का स्रोत है, आगंतुकों का पीने या तैरने का स्थान नहीं; अपना पानी लाएँ और शोध अनुमति के बिना कुंड न छुएँ।'],
    sourceIds: ['uae-wadi-wurayah-ramsar-ris', 'uae-wadi-wurayah-fea-service-terms'], coverage: 'local', destinationIds: ['wadi-wurayah'],
  },
];
