import type { GuideSection, PackingRule, SourceReference, SpeciesEntry } from '../toolkit-types';
import { section } from './shared';

/** New sources, ids prefixed 'uae-enrich-' */
export const enrichSources: SourceReference[] = [
  {
    "id": "uae-enrich-liwa-desert-traditions",
    "title": "Experience Abu Dhabi · Desert traditions in Liwa",
    "url": "https://visitabudhabi.ae/en/things-to-do/itineraries/desert-traditions",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-liwa-desert-activities",
    "title": "Experience Abu Dhabi · Desert activities",
    "url": "https://visitabudhabi.ae/en/things-to-do/adventure/desert",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-sand-gazelle",
    "title": "Environment Agency Abu Dhabi · Arabian Sand Gazelle",
    "url": "https://www.ead.gov.ae/en/discover-our-biodiversity/mammals/arabian-sand-gazelle",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-scorpion",
    "title": "Environment Agency Abu Dhabi · Black Fat-tailed Scorpion",
    "url": "https://www.ead.gov.ae/en/discover-our-biodiversity/invertebrates/black-fat-tailed-scorpion",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-reptiles",
    "title": "Environment Agency Abu Dhabi · Amphibians and reptiles",
    "url": "https://ead.gov.ae/en/discover-our-biodiversity/amphibians-and-reptiles",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-ghaf",
    "title": "Environment Agency Abu Dhabi · Ghaf Tree",
    "url": "https://www.ead.gov.ae/en/discover-our-biodiversity/plants/ghaf-tree",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-moccae-red-list",
    "title": "MOCCAE · UAE National Red List of Threatened Species",
    "url": "https://www.moccae.gov.ae/en/media-center/news/4/3/2022/ministry-of-climate-change-and-environment-unveils-national-red-list-of-threatened-species",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-adpolice-sand-weather",
    "title": "Abu Dhabi Police · Motorists urged to be cautious during changing weather",
    "url": "https://adpolice.gov.ae/en/Media-Center/News/2021/06/29/-Motorists-urged-to-be-cautions-during-changing-weather-conditions",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-dubai-winter-camp",
    "title": "Dubai Municipality · Temporary winter camp permit service",
    "url": "https://wintercamp.dm.gov.ae",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-adphc-heat",
    "title": "Abu Dhabi Public Health Center · Safety in Heat",
    "url": "https://www.adphc.gov.ae/en/Public-Health-Programs/Injury-Prevention/Safety-in-Heat",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jais-home",
    "title": "Visit Jebel Jais · Official site",
    "url": "https://visitjebeljais.com/",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jais-hiking",
    "title": "Visit Jebel Jais · Hiking",
    "url": "https://visitjebeljais.com/jais-hiking",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jais-nature",
    "title": "Visit Jebel Jais · Flora and fauna",
    "url": "https://visitjebeljais.com/flora-fauna",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jais-itinerary",
    "title": "Visit Jebel Jais · Day trip and travel tips",
    "url": "https://visitjebeljais.com/blog/jebel-jais-itinerary-guide-top-activities-day-trip-travel-tips",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ncm-warnings",
    "title": "National Center of Meteorology · Early Warnings for All",
    "url": "https://ew4all.ncm.gov.ae/?lang=en",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ncm-albahar",
    "title": "National Center of Meteorology · ALBAHAR",
    "url": "https://albahar.ncm.gov.ae/",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jubail-visit",
    "title": "Visit Abu Dhabi · Jubail Mangrove Park",
    "url": "https://visitabudhabi.ae/en/things-to-do/nature-and-wildlife/parks/jubail-mangrove-park",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jubail-kayak",
    "title": "Jubail Mangrove Park · Single kayaking experience",
    "url": "https://www.jubailmangrovepark.ae/en/activities/single-kayaking-experience",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jubail-boardwalk",
    "title": "Jubail Mangrove Park · Boardwalk experience",
    "url": "https://www.jubailmangrovepark.ae/en/activities/boardwalk-experience",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-jubail-terms",
    "title": "Jubail Island · Terms and conditions",
    "url": "https://jubailisland.ae/terms-conditions/",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-birds",
    "title": "Environment Agency Abu Dhabi · Birds",
    "url": "https://www.ead.gov.ae/en/discover-our-biodiversity/birds",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-ead-flamingo",
    "title": "Environment Agency Abu Dhabi · Greater Flamingo",
    "url": "https://www.ead.gov.ae/en/Discover-Our-Biodiversity/Birds/Greater-Flamingo",
    "reviewedAt": "2026-09-18"
  },
  {
    "id": "uae-enrich-outdoor-essentials",
    "title": "National Park Service · Ten Essentials",
    "url": "https://www.nps.gov/articles/10essentials.htm",
    "reviewedAt": "2026-09-18"
  }
];

/** Species to APPEND to each place (existing species stay). Final total per place must be 4–6 → add 2–5 per place. ids prefixed 'uae-<placeId>-' */
export const enrichSpecies: Record<'liwa' | 'jebel-jais' | 'jubail-mangrove', SpeciesEntry[]> = {
  "liwa": [
    {
      "id": "uae-liwa-sand-gazelle",
      "coverage": "terrain-example",
      "name": [
        "غزال الرمال العربي",
        "Arabian sand gazelle",
        "Gazelle des sables d’Arabie",
        "阿拉伯沙漠瞪羚",
        "अरबी रेत गज़ेल"
      ],
      "description": [
        "مثال صحراوي إماراتي موثق من الجهات البيئية، لا إثباتاً لرؤيته عند نقطة ليوا. ينسجم مع سهول وكثبان الصحراء، وقد يختلط على الزائر مع ظباء أخرى. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "UAE desert example from environmental sources, not proof of a sighting at the Liwa marker. It fits dune and plain habitats, but visitors may confuse it with other gazelles.",
        "Exemple désertique des Émirats tiré de sources environnementales, sans preuve au repère de Liwa. Il convient aux dunes et plaines mais peut être confondu.",
        "阿联酋环境资料中的沙漠示例，并不证明利瓦标记点可见。它适合沙丘和平原环境，游客可能与其他羚类混淆。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "पर्यावरण स्रोतों का UAE रेगिस्तानी उदाहरण, लीवा चिह्न पर दर्शन का प्रमाण नहीं। यह टीलों और मैदानों से जुड़ा है, पर दूसरे हिरणों से भ्रम हो सकता है। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "راقبه من بعيد ولا تطارده بالمركبة أو للتصوير؛ لا تعتمد على هذا النص لتحديد النوع بدقة. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Watch from a distance; do not chase it by vehicle or for photos. This text is not a precise identification key.",
        "Observez de loin, sans poursuite en véhicule ni pour une photo. Ce texte n’est pas une clé d’identification.",
        "保持距离观察，不要驾车或为拍照追逐。本说明不是精确鉴定工具。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。",
        "दूरी से देखें; वाहन या फोटो के लिए पीछा न करें। यह सटीक पहचान कुंजी नहीं है। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-ead-sand-gazelle",
        "uae-enrich-moccae-red-list"
      ]
    },
    {
      "id": "uae-liwa-black-fat-tailed-scorpion",
      "coverage": "terrain-example",
      "name": [
        "العقرب الأسود سميك الذيل",
        "Black fat-tailed scorpion",
        "Scorpion noir à queue épaisse",
        "黑肥尾蝎",
        "काला मोटी-पूँछ बिच्छू"
      ],
      "description": [
        "مثال احترازي من صحارى الإمارات، لا سجل محلياً داخل الواحة في المصادر المقروءة. وجود العقارب محتمل في الموائل الرملية والجحور، ولا يظهر غالباً نهاراً. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "A precautionary UAE desert example, not a local oasis record in the fetched sources. Scorpions can use sandy shelters and burrows and may not be visible by day.",
        "Exemple de prudence des déserts émiratis, non attesté localement dans les sources lues. Les scorpions peuvent occuper abris sableux et terriers. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "阿联酋沙漠防范示例，已读资料未把它记录在利瓦绿洲。蝎子可利用沙地隐蔽处和洞穴，白天未必可见。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "UAE रेगिस्तान का सावधानी उदाहरण; पढ़े स्रोतों में लीवा का स्थानीय रिकॉर्ड नहीं। बिच्छू रेतीले बिलों में छिप सकते हैं और दिन में न दिखें। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "لا تضع يدك في الجحور أو تحت الخشب والحجارة؛ افحص الحذاء ليلاً واطلب إسعافاً عند اللسع. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Do not put hands in burrows or under wood and stones; check shoes at night and seek medical help after a sting.",
        "Ne mettez pas les mains dans les trous ni sous bois ou pierres ; vérifiez les chaussures et consultez en cas de piqûre.",
        "不要把手伸入洞穴或木石下；夜间检查鞋子，被蜇后寻求医疗帮助。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。",
        "बिलों या लकड़ी-पत्थर के नीचे हाथ न डालें; रात में जूते जाँचें और डंक पर चिकित्सा लें। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-ead-scorpion",
        "uae-enrich-ead-reptiles"
      ]
    },
    {
      "id": "uae-liwa-ghaf-tree",
      "coverage": "terrain-example",
      "name": [
        "شجرة الغاف",
        "Ghaf tree",
        "Ghaf",
        "牧豆树",
        "ग़ाफ़ वृक्ष"
      ],
      "description": [
        "شجرة صحراوية إماراتية مهمة، لكن المصادر المقروءة لا تربط فرداً محدداً بمؤشر ليوا. تضيف ظلاً وموئلاً في البيئات الجافة، ولا تعني وجود مسار عام حولها. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "An important UAE desert tree, but the fetched sources do not tie an individual tree to the Liwa marker. It offers shade and habitat in dry settings, not public access.",
        "Arbre désertique important des Émirats, sans individu relié au repère de Liwa dans les sources lues. Il offre ombre et habitat en milieu sec. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "阿联酋重要沙漠树种，但已读资料未把某棵树对应到利瓦标记点。它在干旱环境中提供阴影和栖息地。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "UAE का महत्वपूर्ण रेगिस्तानी वृक्ष, पर स्रोत किसी पेड़ को लीवा चिह्न से नहीं जोड़ते। यह सूखे क्षेत्रों में छाया और आवास देता है। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "القانون يحمي النباتات البرية؛ لا تقطع أو تجمع الأغصان أو القرون، وابقَ على مسار مسموح. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Wild plants are protected by law; do not cut or collect branches or pods, and stay on permitted routes.",
        "Les plantes sauvages sont protégées ; ne coupez ni ne ramassez branches ou gousses, restez sur les voies autorisées.",
        "野生植物受法律保护；不要砍伐或采集枝条、荚果，并留在允许路线。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。",
        "जंगली पौधे कानून से संरक्षित हैं; शाखाएँ या फलियाँ न काटें, अनुमत मार्ग पर रहें। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-ead-ghaf",
        "uae-enrich-moccae-red-list"
      ]
    }
  ],
  "jebel-jais": [
    {
      "id": "uae-jebel-jais-little-owl",
      "coverage": "local",
      "name": [
        "البومة الصغيرة",
        "Little owl",
        "Chevêche d’Athéna",
        "纵纹腹小鸮",
        "छोटी उल्लू"
      ],
      "description": [
        "يوثق موقع جبل جيس وجودها ويذكر حساسية موسم التعشيش في أواخر الربيع. هذه ملاحظة مشاهدة محتملة وليست وعداً برؤية أو أداة تعرف دقيقة. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "The Jebel Jais site records this resident owl and notes nesting sensitivity from late spring. This is a possible sighting note, not a promise or field key.",
        "Le site de Jebel Jais la cite et signale une sensibilité de nidification à la fin du printemps. Observation possible, sans garantie ni clé. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "杰贝勒贾伊斯网站记录这种留鸟，并提示晚春起筑巢期敏感。这只是可能观察提示，不是保证或鉴定钥匙。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "जेबेल जैस साइट इस निवासी उल्लू और देर वसंत में घोंसले की संवेदनशीलता बताती है। यह संभावित दर्शन है, गारंटी नहीं। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "ابقَ على المسار واخفض الضجيج؛ لا تقترب من الأعشاش أو تستخدم الفلاش قرب الطيور. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Stay on trail and keep noise low; do not approach nests or use flash close to birds. Follow staff or guide instructions, and leave the animal or plant untouched, unfed and uncollected.",
        "Restez sur le sentier et limitez le bruit ; n’approchez pas les nids et évitez le flash. Suivez les consignes du site ou du guide, sans toucher, nourrir ni prélever l’être vivant.",
        "留在步道并降低噪声；不要接近巢穴或近距离闪光拍摄。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。不要围堵、追逐或大声驱赶；如需帮助，应联系现场人员或紧急服务，而不是自行处理。",
        "रास्ते पर रहें और शोर कम रखें; घोंसलों के पास न जाएँ, पास से फ्लैश न करें। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-jais-nature"
      ]
    },
    {
      "id": "uae-jebel-jais-arabian-red-fox",
      "coverage": "local",
      "name": [
        "الثعلب الأحمر العربي",
        "Arabian red fox",
        "Renard roux d’Arabie",
        "阿拉伯赤狐",
        "अरबी लाल लोमड़ी"
      ],
      "description": [
        "يسميه موقع جبل جيس ضمن الحيوانات المقيمة، مع موسم تزاوج في ديسمبر ويناير وظهور الصغار في الربيع. الرؤية ليست مضمونة. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "The Jebel Jais site names it as a resident animal, with mating in December and January and pups in spring. A sighting is not guaranteed. Treat this as awareness context, not a promised sighting or a field identification key for the exact route.",
        "Le site de Jebel Jais le cite comme résident, avec reproduction en décembre-janvier et jeunes au printemps. L’observation n’est pas garantie. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "杰贝勒贾伊斯网站列为常住动物，并说明十二月和一月交配、春季有幼崽。不保证能看到。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "जेबेल जैस साइट इसे निवासी जानवर बताती है; दिसंबर-जनवरी में संयोग और वसंत में बच्चे। दिखना निश्चित नहीं। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "لا تطعمه أو تجذبه ببقايا الطعام؛ اترك مسافة خاصة عند الصغار وتجنب الخروج عن المسار. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Do not feed or lure it with scraps; keep extra distance near young and avoid going off trail. Follow staff or guide instructions, and leave the animal or plant untouched, unfed and uncollected.",
        "Ne le nourrissez pas et ne l’attirez pas avec des déchets ; gardez vos distances, surtout près des jeunes.",
        "不要投喂或用残食引诱；遇到幼崽时保持更远距离，避免离开步道。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。",
        "खाना देकर न बुलाएँ; बच्चों के पास अधिक दूरी रखें और रास्ते से बाहर न जाएँ। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-jais-nature"
      ]
    }
  ],
  "jubail-mangrove": [
    {
      "id": "uae-jubail-mangrove-greater-flamingo",
      "coverage": "terrain-example",
      "name": [
        "النحام الكبير",
        "Greater flamingo",
        "Flamant rose",
        "大红鹳",
        "बड़ा फ्लेमिंगो"
      ],
      "description": [
        "مثال لطائر مائي في أبوظبي؛ توثق EAD موائل محمية له، لكن المصادر المقروءة لا تثبت وجوده داخل منتزه قرم الجبيل تحديداً. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "An Abu Dhabi wetland bird example; EAD documents protected habitats for it, but fetched sources do not place it specifically inside Jubail Mangrove Park.",
        "Exemple d’oiseau d’eau d’Abou Dhabi ; EAD documente ses habitats protégés, sans le placer précisément dans le parc de Jubail. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "阿布扎比湿地鸟类示例；环境署记录其受保护栖息地，但已读资料未证明它在朱拜勒红树林公园内。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "अबू धाबी आर्द्रभूमि पक्षी का उदाहरण; EAD इसके संरक्षित आवास बताती है, पर स्रोत इसे जुबैल पार्क में नहीं रखते। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "راقبه من الممر أو القارب دون ملاحقة؛ لا تقترب من تجمعات الطيور أو مناطق التغذية. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Observe from the boardwalk or boat without pursuit; do not approach flocks or feeding areas. Follow staff or guide instructions, and leave the animal or plant untouched, unfed and uncollected.",
        "Observez depuis la passerelle ou le bateau sans poursuite ; n’approchez pas groupes ni zones d’alimentation.",
        "从栈道或船上观察，不要追逐；不要接近鸟群或觅食区。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。不要围堵、追逐或大声驱赶；如需帮助，应联系现场人员或紧急服务，而不是自行处理。",
        "बोर्डवॉक या नाव से बिना पीछा किए देखें; झुंड या भोजन क्षेत्र के पास न जाएँ। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-ead-flamingo",
        "uae-enrich-ead-birds"
      ]
    },
    {
      "id": "uae-jubail-mangrove-shorebirds",
      "coverage": "terrain-example",
      "name": [
        "طيور الشاطئ الصغيرة",
        "Small shorebirds",
        "Petits limicoles",
        "小型滨鸟",
        "छोटे तटीय पक्षी"
      ],
      "description": [
        "مثال عام من موائل الإمارات الساحلية؛ تسجل EAD طيوراً مهاجرة ومقيمة، لكن هذا ليس جرداً لأنواع الجبيل أو أداة تعرف ميدانية. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "A general UAE coastal-habitat example; EAD records migratory and resident birds, but this is not a Jubail inventory or field identification key. Treat this as awareness context, not a promised sighting or a field identification key for the exact route.",
        "Exemple général du littoral émirati ; EAD signale oiseaux migrateurs et résidents, sans inventaire propre à Jubail. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "阿联酋海岸生境的一般示例；环境署记录迁徙和留居鸟类，但这不是朱拜勒名录或野外鉴定钥匙。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "UAE तटीय आवास का सामान्य उदाहरण; EAD प्रवासी और निवासी पक्षी बताती है, पर यह जुबैल सूची या पहचान कुंजी नहीं। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "استخدم المنظار إن توفر، ولا تترك الممر أو تزعج الطيور عند الطين أو المياه الضحلة. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "Use binoculars if available, and do not leave the walkway or disturb birds on mud or shallows. Follow staff or guide instructions, and leave the animal or plant untouched, unfed and uncollected.",
        "Utilisez des jumelles si possible, sans quitter la passerelle ni déranger les oiseaux sur la vase. Suivez les consignes du site ou du guide, sans toucher, nourrir ni prélever l’être vivant.",
        "可用望远镜观察，不要离开栈道或惊扰泥滩、浅水中的鸟。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。不要围堵、追逐或大声驱赶；如需帮助，应联系现场人员或紧急服务，而不是自行处理。",
        "दूरबीन हो तो उपयोग करें; रास्ता न छोड़ें और कीचड़ या उथले पानी के पक्षियों को न चौंकाएँ। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-ead-birds",
        "uae-enrich-jubail-visit"
      ]
    },
    {
      "id": "uae-jubail-mangrove-dugong",
      "coverage": "terrain-example",
      "name": [
        "الأطوم",
        "Dugong",
        "Dugong",
        "儒艮",
        "डुगोंग"
      ],
      "description": [
        "مثال بحري أوسع في الإمارات؛ تسجل MOCCAE الأطوم في بحار الدولة، لكن المصادر المقروءة لا تربطه بمياه الجبيل أو بجولة الكاياك. تُعرض هنا بحدود الدليل كإشارة وعي لا كتعهد مشاهدة أو مفتاح تعريف؛ اعتمد على مصدر متخصص عند الحاجة.",
        "A wider UAE marine example; MOCCAE records dugong in the country’s seas, but fetched sources do not link it to Jubail waters or kayaking tours. Treat this as awareness context, not a promised sighting or a field identification key for the exact route.",
        "Exemple marin plus large des Émirats ; MOCCAE signale le dugong dans les mers du pays, sans lien vérifié avec Jubail. À lire comme contexte de sensibilisation, sans promesse d’observation ni clé d’identification pour le site exact.",
        "阿联酋更广泛的海洋示例；气候变化与环境部记录国内海域有儒艮，但资料未将其关联到朱拜勒水域。本条只用于出发前了解可能的生境关系，不代表当天一定出现，也不能替代现场工作人员、向导或正式物种图鉴的判断；若条件不适合观察，请以保护栖息地为先，不为拍照改变路线，保持耐心远观并记录不确定性。这仍然只是谨慎示例；若无法确认，请写成未确认观察，并优先保护潮滩、洞穴、沙丘或山坡等栖息地。",
        "UAE समुद्र का व्यापक उदाहरण; MOCCAE देश के समुद्रों में डुगोंग बताता है, पर स्रोत इसे जुबैल जल से नहीं जोड़ते। इसे यात्रा से पहले संदर्भ समझें, निश्चित दर्शन या सटीक पहचान न मानें; संदेह हो तो प्रशिक्षित गाइड या आधिकारिक स्रोत पर भरोसा करें।"
      ],
      "precaution": [
        "إذا رأيت حيواناً بحرياً فلا تلاحقه بالمجداف؛ اترك الاتجاه للمشغّل وحافظ على المسافة. اتبع تعليمات الموقع أو المرشد، واترك الكائن بلا لمس أو إطعام أو جمع.",
        "If you see marine wildlife, do not pursue it by paddle; leave routing to the operator and keep distance.",
        "Si vous voyez un animal marin, ne le poursuivez pas à la pagaie ; laissez l’itinéraire à l’opérateur.",
        "若看到海洋动物，不要用桨追逐；路线交由运营方并保持距离。请听从工作人员或向导安排，保持安静和距离，不触摸、不投喂、不采集；若动物受惊或环境脆弱，应立即后退，让儿童由成人看护，并把安全放在照片之前。不要围堵、追逐或大声驱赶；如需帮助，应联系现场人员或紧急服务，而不是自行处理。",
        "समुद्री जीव दिखे तो पैडल से पीछा न करें; मार्ग संचालक पर छोड़ें और दूरी रखें। स्थल या गाइड के निर्देश मानें, दूरी रखें, न छुएँ, न खिलाएँ, न संग्रह करें; बच्चों पर वयस्क निगरानी रखें।"
      ],
      "sourceIds": [
        "uae-enrich-moccae-red-list",
        "uae-enrich-jubail-kayak"
      ]
    }
  ]
};

/** One extra chapter per place to APPEND: section('rules', body[5], sourceIds) — UAE rules & permits (camping/desert driving permits or zones, protected-area rules, drone rules if sourced, fees/hours if sourced) + emergency numbers via 'uae-emergency' */
export const enrichSections: Record<'liwa' | 'jebel-jais' | 'jubail-mangrove', GuideSection[]> = {
  liwa: [section("rules", [
  "ليوا بوابة للربع الخالي، لكن القيادة فوق الرمل أو التخييم ليستا إذناً مفتوحاً: استخدم منظّماً خبيراً، وتحقق من القواعد المحلية للتخييم قبل نصب خيمة، ولا تدخل محمية أو ملكية خاصة بلا تصريح. عند الرياح أو الغبار أبطئ أو أجّل الخروج. للطوارئ في الإمارات: الشرطة 999، الإسعاف 998، الدفاع المدني 997.",
  "Liwa is a gateway to the Empty Quarter, but sand driving and camping are not open permission: use an experienced operator, check current local camping rules before pitching a tent, and do not enter reserves or private land without approval. In wind or dust, slow down or postpone. UAE emergencies: police 999, ambulance 998, civil defence 997.",
  "Liwa ouvre sur le Rub al-Khali, mais conduite sur sable et camping ne sont pas libres : passez par un opérateur expérimenté, vérifiez les règles locales avant la tente et n’entrez ni réserve ni terrain privé sans accord. Vent ou poussière : ralentissez ou reportez. Urgences UAE : police 999, ambulance 998, défense civile 997.",
  "利瓦通往鲁卜哈利沙漠，但沙地驾驶和露营并非自由许可：请使用有经验的运营方，搭帐篷前核对当地露营规则，未经批准不要进入保护区或私人土地。遇风沙请减速或延期。阿联酋紧急电话：警察999、救护998、民防997。实用推断：出发前把预订、入口、天气预警和返程方式离线保存；若现场人员、警示牌或天气服务给出不同要求，以最新要求为准，不为赶行程越界、下水或继续驾驶。同行者应知道集合点、车辆位置和取消条件，儿童需要成人看护，垃圾和自然物都带不走也不留下。如需要改变计划，优先选择返回、改期或改为较短活动；不要把网络游记、旧票价或旧天气截图当作当天许可。",
  "लीवा एम्प्टी क्वार्टर का द्वार है, पर रेत पर ड्राइव या कैंपिंग खुली अनुमति नहीं है: अनुभवी संचालक लें, तंबू से पहले स्थानीय नियम जाँचें, और अनुमति बिना रिज़र्व या निजी भूमि में न जाएँ। हवा या धूल हो तो धीमे चलें या टालें। UAE आपातकाल: पुलिस 999, एम्बुलेंस 998, सिविल डिफेन्स 997।"
], [
  "uae-enrich-liwa-desert-traditions",
  "uae-enrich-liwa-desert-activities",
  "uae-enrich-adpolice-sand-weather",
  "uae-enrich-dubai-winter-camp",
  "uae-emergency"
])],
  "jebel-jais": [section("rules", [
  "المشي في جبل جيس مجاني على المسارات المفتوحة، أما الجولات الموجّهة والأنشطة فتخضع للحجز والشروط. التخييم الحر مذكور فقط في مناطق محددة على طريق الجبل؛ لا تختر كتف الطريق أو حافة الوادي كموقع. تحقق من الرياح والطقس قبل الصعود، واحمل خطة رجوع. للطوارئ في الإمارات: الشرطة 999، الإسعاف 998، الدفاع المدني 997.",
  "Jebel Jais trails are free to walk when open, while guided hikes and activities require bookings and conditions. Free camping is described only in marked areas along the mountain road; do not use road shoulders or wadi edges as sites. Check wind and weather before ascending, and carry a return plan. UAE emergencies: police 999, ambulance 998, civil defence 997.",
  "À Jebel Jais, les sentiers ouverts se marchent gratuitement, tandis que sorties guidées et activités ont réservation et conditions. Le camping libre n’est décrit que dans des zones marquées de la route ; pas sur bas-côté ni bord de wadi. Vérifiez vent et météo avant la montée. Urgences UAE : police 999, ambulance 998, défense civile 997.",
  "杰贝勒贾伊斯开放步道可免费步行，向导徒步和活动则需预订并遵守条件。免费露营只描述为山路沿线标记区域；不要把路肩或山谷边当营地。上山前核对风和天气，并带返程计划。阿联酋紧急电话：警察999、救护998、民防997。实用推断：出发前把预订、入口、天气预警和返程方式离线保存；若现场人员、警示牌或天气服务给出不同要求，以最新要求为准，不为赶行程越界、下水或继续驾驶。同行者应知道集合点、车辆位置和取消条件，儿童需要成人看护，垃圾和自然物都带不走也不留下。如需要改变计划，优先选择返回、改期或改为较短活动；不要把网络游记、旧票价或旧天气截图当作当天许可。",
  "जेबेल जैस में खुले ट्रेल मुफ्त हैं, पर गाइडेड हाइक और गतिविधियों में बुकिंग व शर्तें हैं। मुक्त कैंपिंग केवल पर्वत सड़क के चिन्हित स्थानों पर बताई गई है; सड़क किनारे या वाडी धार को साइट न बनाएँ। चढ़ने से पहले हवा-मौसम जाँचें और वापसी योजना रखें। UAE आपातकाल: पुलिस 999, एम्बुलेंस 998, सिविल डिफेन्स 997।"
], [
  "uae-enrich-jais-hiking",
  "uae-enrich-jais-itinerary",
  "uae-enrich-jais-home",
  "uae-enrich-ncm-warnings",
  "uae-emergency"
])],
  "jubail-mangrove": [section("rules", [
  "الزيارة تكون عبر تذكرة الممر أو نشاط محجوز؛ صفحة أبوظبي تذكر سعراً للممر قدره 15 درهماً، وقد يتغير. للتجديف احضر قبل الموعد، والبس سترة النجاة التي يوفرها المشغّل، ولا تدخل الماء إذا ألغيت الحالة. التزم بالممر ولا تجمع نباتاً أو كائناً. للطوارئ في الإمارات: الشرطة 999، الإسعاف 998، الدفاع المدني 997.",
  "Visit by boardwalk ticket or booked activity; Visit Abu Dhabi lists the boardwalk ticket at AED 15, which can change. For kayaking, arrive ahead of time, wear the operator-provided life jacket and stay out if conditions cancel. Keep to the boardwalk and collect no plants or wildlife. UAE emergencies: police 999, ambulance 998, civil defence 997.",
  "La visite se fait par billet de passerelle ou activité réservée ; Visit Abu Dhabi indique 15 AED pour la passerelle, tarif modifiable. Pour le kayak, arrivez en avance, portez le gilet fourni et n’entrez pas si l’activité est annulée. Restez sur la passerelle, sans prélèvement. Urgences UAE : police 999, ambulance 998, défense civile 997.",
  "到访应购买栈道票或预订活动；阿布扎比旅游列出的栈道票价为15迪拉姆，可能变化。划艇请提前到达，穿运营方提供的救生衣；若条件取消则不要下水。留在栈道，不采集植物或生物。阿联酋紧急电话：警察999、救护998、民防997。实用推断：出发前把预订、入口、天气预警和返程方式离线保存；若现场人员、警示牌或天气服务给出不同要求，以最新要求为准，不为赶行程越界、下水或继续驾驶。同行者应知道集合点、车辆位置和取消条件，儿童需要成人看护，垃圾和自然物都带不走也不留下。如需要改变计划，优先选择返回、改期或改为较短活动；不要把网络游记、旧票价或旧天气截图当作当天许可。",
  "यात्रा बोर्डवॉक टिकट या बुक गतिविधि से करें; Visit Abu Dhabi बोर्डवॉक टिकट 15 AED बताता है, जो बदल सकता है। कयाक के लिए पहले पहुँचें, संचालक की जीवन जैकेट पहनें और स्थिति रद्द हो तो पानी में न जाएँ। बोर्डवॉक पर रहें, पौधे या जीव न लें। UAE आपातकाल: पुलिस 999, एम्बुलेंस 998, सिविल डिफेन्स 997।"
], [
  "uae-enrich-jubail-visit",
  "uae-enrich-jubail-kayak",
  "uae-enrich-jubail-boardwalk",
  "uae-enrich-jubail-terms",
  "uae-emergency"
])]
};

/** UAE-specific packing rules (5–8 total). */
export const enrichRules: PackingRule[] = [
  {
    "id": "uae-enrich-heat-plan",
    "version": 1,
    "equipmentId": "uae-enrich-heat-plan",
    "label": [
      "خطة للحر وماء شخصي",
      "Heat plan and personal water",
      "Plan chaleur et eau personnelle",
      "高温计划和个人饮水",
      "गर्मी योजना और निजी पानी"
    ],
    "category": "safety",
    "terrainIds": [
      "desert",
      "mountain",
      "coast"
    ],
    "activities": ["walking", "boating"],
    "months": [
      5,
      6,
      7,
      8,
      9
    ],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": true,
    "reason": [
      "برنامج أبوظبي للسلامة في الحر يبرز إدارة إجهاد الحرارة؛ استنتاج عملي: اجعل لكل شخص ماءً وخطة ظل وتوقف، ولا نحدد لترات غير منشورة.",
      "Abu Dhabi heat guidance focuses on heat-stress management. Practical inference: give each person water plus shade and stop points; no unsourced litre dose is stated.",
      "Le programme d’Abou Dhabi traite le stress thermique. Déduction pratique : eau par personne, ombre et pauses ; aucun dosage en litres non sourcé.",
      "阿布扎比高温安全资料强调热应激管理。实用推断：每人备水并规划阴影和停留点；不写未有出处的升数。",
      "अबू धाबी गर्मी मार्गदर्शन हीट-स्ट्रेस प्रबंधन पर है। व्यावहारिक अनुमान: हर व्यक्ति के लिए पानी, छाया और विराम रखें; बिना स्रोत लीटर मात्रा नहीं।"
    ],
    "sourceIds": [
      "uae-enrich-adphc-heat",
      "uae-enrich-ncm-warnings"
    ],
    "coverage": "local",
    "destinationIds": [
      "liwa",
      "jebel-jais",
      "jubail-mangrove"
    ]
  },
  {
    "id": "uae-enrich-sun-protection",
    "version": 1,
    "equipmentId": "uae-enrich-sun-protection",
    "label": [
      "حماية شمسية ساترة",
      "Covering sun protection",
      "Protection solaire couvrante",
      "遮蔽型防晒",
      "ढकने वाली धूप सुरक्षा"
    ],
    "category": "clothing",
    "terrainIds": [
      "desert",
      "mountain",
      "coast"
    ],
    "activities": ["walking", "boating"],
    "months": [],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": true,
    "reason": [
      "المواقع الثلاثة مكشوفة بدرجات مختلفة؛ اجمع قبعة ونظارة وملابس ساترة، وعدّلها حسب توقعات اليوم لا حسب اسم الفصل.",
      "All three sites are exposed in different ways; combine hat, sunglasses and covering clothing, adjusted to the day’s forecast rather than the season name.",
      "Les trois lieux sont exposés différemment ; combinez chapeau, lunettes et vêtements couvrants selon la météo du jour, pas seulement la saison.",
      "三处地点都有不同程度暴露；组合帽子、太阳镜和遮蔽衣物，并按当天预报而非季节名称调整。",
      "तीनों स्थान किसी न किसी तरह खुले हैं; टोपी, चश्मा और ढकने वाले कपड़े रखें, मौसम पूर्वानुमान से बदलें।"
    ],
    "sourceIds": [
      "uae-enrich-adphc-heat",
      "uae-enrich-jubail-visit",
      "uae-enrich-jais-itinerary"
    ],
    "coverage": "local",
    "destinationIds": [
      "liwa",
      "jebel-jais",
      "jubail-mangrove"
    ]
  },
  {
    "id": "uae-enrich-booking-confirmations",
    "version": 1,
    "equipmentId": "uae-enrich-booking-confirmations",
    "label": [
      "نسخ حجز وتعليمات دون اتصال",
      "Offline booking confirmations and instructions",
      "Réservations et consignes hors ligne",
      "离线预订凭证和说明",
      "ऑफलाइन बुकिंग और निर्देश"
    ],
    "category": "essentials",
    "terrainIds": [
      "desert",
      "mountain",
      "coast"
    ],
    "activities": [],
    "months": [],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": false,
    "reason": [
      "الجولات الصحراوية والمشي الموجّه والتجديف تعتمد على وقت وشروط مشغّل؛ احتفظ بالتأكيد والتعليمات ولا تجعل الإحداثيات بديلاً عنها.",
      "Desert tours, guided hikes and kayaking depend on operator times and conditions; keep confirmations and instructions, not just coordinates.",
      "Excursions désert, marches guidées et kayak dépendent d’horaires et conditions ; gardez confirmations et consignes, pas seulement coordonnées.",
      "沙漠游、向导徒步和划艇取决于运营方时间与条件；保存确认和说明，不要只靠坐标。",
      "रेगिस्तानी टूर, गाइडेड हाइक और कयाक संचालक समय व शर्तों पर निर्भर हैं; पुष्टि और निर्देश रखें, केवल निर्देशांक नहीं।"
    ],
    "sourceIds": [
      "uae-enrich-liwa-desert-traditions",
      "uae-enrich-jais-hiking",
      "uae-enrich-jubail-kayak"
    ],
    "coverage": "local",
    "destinationIds": [
      "liwa",
      "jebel-jais",
      "jubail-mangrove"
    ]
  },
  {
    "id": "uae-enrich-liwa-recovery-gear",
    "version": 1,
    "equipmentId": "uae-enrich-liwa-recovery-gear",
    "label": [
      "معدات إنقاذ للقيادة على الرمال",
      "Sand-driving recovery gear",
      "Matériel de désensablement",
      "沙地驾驶脱困装备",
      "रेत ड्राइविंग रिकवरी सामान"
    ],
    "category": "vehicle",
    "terrainIds": [
      "desert"
    ],
    "activities": [],
    "months": [],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": false,
    "reason": [
      "تذكر مصادر ليوا الديون باشنغ والرحلات الصحراوية؛ استنتاج عملي: لا تغادر الطريق بلا مركبة مناسبة ومشغّل أو معدات وخطة إنقاذ.",
      "Liwa sources list dune bashing and desert outings. Practical inference: do not leave paved access without a suitable vehicle, operator, or recovery plan and gear.",
      "Les sources de Liwa citent dunes et sorties désert. Déduction pratique : pas de hors-route sans véhicule adapté, opérateur ou plan et matériel de dépannage.",
      "利瓦资料列出冲沙和沙漠活动。实用推断：无合适车辆、运营方或脱困计划与装备，不要离开铺装道路。",
      "लीवा स्रोत ड्यून बैशिंग और रेगिस्तानी यात्रा बताते हैं। व्यावहारिक अनुमान: उपयुक्त वाहन, संचालक या रिकवरी योजना और सामान बिना सड़क न छोड़ें।"
    ],
    "sourceIds": [
      "uae-enrich-liwa-desert-traditions",
      "uae-enrich-adpolice-sand-weather"
    ],
    "coverage": "local",
    "destinationIds": [
      "liwa"
    ]
  },
  {
    "id": "uae-enrich-jubail-life-jacket-tide",
    "version": 1,
    "equipmentId": "uae-enrich-jubail-life-jacket-tide",
    "label": [
      "تأكيد المد وسترة النجاة للتجديف",
      "Kayak tide and life-jacket check",
      "Marée et gilet pour kayak",
      "划艇潮汐和救生衣核对",
      "कयाक ज्वार और जीवन जैकेट जाँच"
    ],
    "category": "safety",
    "terrainIds": [
      "coast"
    ],
    "activities": ["boating"],
    "months": [],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": true,
    "reason": [
      "جولة الجبيل توفر سترة نجاة وتشترط ارتداءها؛ استنتاج عملي: أكد موعد الماء والمد مع المشغّل وخدمة البحر قبل الانطلاق.",
      "The Jubail tour provides and requires a life jacket. Practical inference: confirm water timing and tide with the operator and marine service before launch.",
      "La sortie de Jubail fournit et impose le gilet. Déduction pratique : confirmez horaire d’eau et marée avec l’opérateur et le service maritime.",
      "朱拜勒行程提供并要求穿救生衣。实用推断：出发前向运营方和海况服务核对水位时间与潮汐。",
      "जुबैल टूर जीवन जैकेट देता और पहनना कहता है। व्यावहारिक अनुमान: निकलने से पहले संचालक और समुद्री सेवा से पानी समय व ज्वार पूछें।"
    ],
    "sourceIds": [
      "uae-enrich-jubail-kayak",
      "uae-enrich-ncm-albahar"
    ],
    "coverage": "local",
    "destinationIds": [
      "jubail-mangrove"
    ]
  },
  {
    "id": "uae-enrich-jais-warm-wind-layer",
    "version": 1,
    "equipmentId": "uae-enrich-jais-warm-wind-layer",
    "label": [
      "طبقة دافئة ومقاومة للرياح",
      "Warm wind-resistant layer",
      "Couche chaude coupe-vent",
      "保暖防风层",
      "गर्म हवा-रोधी परत"
    ],
    "category": "clothing",
    "terrainIds": [
      "mountain"
    ],
    "activities": ["walking", "camping"],
    "months": [
      10,
      11,
      12,
      1,
      2,
      3,
      4
    ],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": true,
    "reason": [
      "يوضح دليل جبل جيس أن الارتفاع والرياح يؤثران في الزيارة وأن الليالي الشتوية تبرد بسرعة؛ اختر الطبقة من توقعات اليوم.",
      "Jebel Jais guidance notes altitude, wind exposure and winter evenings cooling quickly; choose the layer from the day’s forecast.",
      "Le guide de Jebel Jais signale altitude, exposition au vent et soirées d’hiver qui refroidissent vite ; choisissez selon la météo.",
      "杰贝勒贾伊斯资料提示海拔、风暴露和冬季夜间快速变凉；按当天预报选择衣层。",
      "जेबेल जैस मार्गदर्शन ऊँचाई, हवा और सर्द शाम के जल्दी ठंडा होने को बताता है; उसी दिन के पूर्वानुमान से परत चुनें।"
    ],
    "sourceIds": [
      "uae-enrich-jais-itinerary",
      "uae-enrich-ncm-warnings"
    ],
    "coverage": "local",
    "destinationIds": [
      "jebel-jais"
    ]
  },
  {
    "id": "uae-enrich-headtorch-early-start",
    "version": 1,
    "equipmentId": "uae-enrich-headtorch-early-start",
    "label": [
      "مصباح رأس للبدايات المبكرة",
      "Headtorch for early starts",
      "Lampe frontale pour départs matinaux",
      "早出头灯",
      "जल्दी शुरुआत के लिए हेडटॉर्च"
    ],
    "category": "equipment",
    "terrainIds": [
      "desert",
      "mountain"
    ],
    "activities": ["walking", "camping"],
    "months": [],
    "minDays": 0,
    "transport": [],
    "baseQuantity": 1,
    "perPerson": true,
    "reason": [
      "البدايات المبكرة تقلل التعرض للحر، والجبل والصحراء يحتاجان يديك للمشي أو تجهيز المركبة؛ المصباح نسخة احتياطية لا دعوة للمغامرة ليلاً.",
      "Early starts reduce heat exposure, and mountain or desert tasks need your hands free. A torch is backup, not an invitation to night travel.",
      "Les départs matinaux réduisent la chaleur, et montagne ou désert exigent les mains libres. La lampe est secours, pas invitation à sortir de nuit.",
      "早出可减少高温暴露，山地或沙漠事务需要双手空出。头灯是备用，不是鼓励夜行。",
      "जल्दी शुरुआत गर्मी घटाती है, और पहाड़ या रेगिस्तान में हाथ खाली चाहिए। टॉर्च बैकअप है, रात यात्रा का निमंत्रण नहीं।"
    ],
    "sourceIds": [
      "uae-enrich-adphc-heat",
      "uae-enrich-outdoor-essentials"
    ],
    "coverage": "local",
    "destinationIds": [
      "liwa",
      "jebel-jais"
    ]
  }
];
