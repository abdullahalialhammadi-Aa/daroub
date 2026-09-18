import type {Destination,GuideSection,SourceReference,Localized} from './toolkit-types';
export const originalAdviceSources:SourceReference[]=[
  {
    "id": "liwa-desert-visit",
    "title": "Experience Abu Dhabi · Desert traditions in Liwa",
    "url": "https://visitabudhabi.ae/en/things-to-do/itineraries/desert-traditions",
    "reviewedAt": "2026-09-17"
  },
  {
    "id": "liwa-desert-season",
    "title": "Experience Abu Dhabi · Desert activities and visiting season",
    "url": "https://visitabudhabi.ae/en/things-to-do/adventure/desert",
    "reviewedAt": "2026-09-17"
  },
  {
    "id": "forest-visitor-tips",
    "title": "Black Forest National Park · Visitor tips",
    "url": "https://www.nationalpark-schwarzwald.de/nationalpark/regeln-tipps/nuetzliche-tipps",
    "reviewedAt": "2026-09-17"
  },
  {
    "id": "forest-access",
    "title": "Black Forest National Park · Getting here",
    "url": "https://www.nationalpark-schwarzwald.de/anreise-kontakt",
    "reviewedAt": "2026-09-17"
  },
  {
    "id": "forest-closures",
    "title": "Black Forest National Park · Trail closures",
    "url": "https://www.nationalpark-schwarzwald.de/erleben/unterwegs-im-park/wegesperrungen",
    "reviewedAt": "2026-09-17"
  },
  {
    "id": "egypt-snorkel",
    "title": "Egyptian Tourism Authority · Diving and snorkelling",
    "url": "https://www.experienceegypt.eg/en/attraction-details/328/diving-snorkeling",
    "reviewedAt": "2026-09-17"
  }
];
const sections:Record<string,GuideSection[]>={
  "liwa": [
    {
      "id": "visit",
      "title": [
        "ما الذي يناسب زيارتك؟",
        "Choose your visit",
        "Choisir votre visite",
        "选择游览方式",
        "अपनी यात्रा चुनें"
      ],
      "body": [
        "ابدأ بزيارة الواحة ومشاهدة الكثبان ضمن جولة صحراوية منظّمة. للزيارة الأولى، اختر جولة بسيارة مع مرشد وتوقفات قصيرة بدلاً من عبور الربع الخالي بنفسك. اتفق مع المنظّم على نقطة اللقاء وخطة العودة.",
        "Start with oasis stops and dune viewpoints reached by an organised desert outing. For a first visit, choose a guided drive with short stops rather than an independent crossing of the Empty Quarter. Confirm the meeting point and return plan with the operator.",
        "Commencez par des haltes dans les oasis et des points de vue sur les dunes accessibles lors d’une excursion organisée dans le désert. Pour une première visite, choisissez un trajet guidé avec de courtes haltes plutôt qu’une traversée autonome du Rub al-Khali. Confirmez le point de rendez-vous et le plan de retour avec l’organisateur.",
        "从绿洲站点和沙丘观景点开始,选择有组织的沙漠行程前往。首次到访时,建议选择带向导的乘车短途停留,而非独自穿越鲁卜哈利沙漠(Empty Quarter)。请与运营方确认集合地点和返程安排。",
        "शुरुआत नखलिस्तान के पड़ावों और रेत के टीलों के नज़ारों वाली जगहों से करें, जहाँ किसी संगठित रेगिस्तानी भ्रमण के ज़रिए पहुँचा जा सके। पहली यात्रा में एम्प्टी क्वार्टर को खुद पार करने के बजाय, छोटे-छोटे पड़ावों वाली गाइड के साथ ड्राइव चुनें। संचालक से मिलने की जगह और वापसी की योजना की पुष्टि करें।"
      ],
      "sourceIds": [
        "liwa-desert-visit",
        "liwa-desert-season"
      ]
    },
    {
      "id": "clothing",
      "title": [
        "ملابس مناسبة للمكان",
        "Clothing for the setting",
        "Vêtements adaptés au lieu",
        "适合当地的衣着",
        "स्थान के अनुसार कपड़े"
      ],
      "body": [
        "جهّز قبعة ونظارة شمسية وملابس خفيفة طويلة الأكمام للكثبان المكشوفة، وحذاءً مغلقاً للمشي. أضف طبقة دافئة إذا بقيت بعد الغروب. اختر ملابسك حسب التوقعات؛ ليالي الصحراء ليست دافئة دائماً.",
        "Practical packing: a sun hat, sunglasses and light long sleeves for exposed dunes; closed shoes for walking. Add a warmer layer if you will stay after sunset. Choose layers for the forecast rather than assuming desert nights are always warm.",
        "À emporter en pratique : un chapeau, des lunettes de soleil et des vêtements légers à manches longues pour les dunes exposées au soleil, ainsi que des chaussures fermées pour marcher. Ajoutez une couche plus chaude si vous restez après le coucher du soleil. Adaptez les couches aux prévisions plutôt que de supposer que les nuits dans le désert sont toujours chaudes.",
        "实用装备:防晒帽、太阳镜和轻便长袖衣物,适合在无遮挡沙丘上活动;步行请穿包脚鞋。若日落后继续停留,请加带保暖衣物。请根据天气预报分层穿衣,不要默认沙漠夜晚一定温暖。",
        "साथ रखने लायक व्यावहारिक चीज़ें: खुले टीलों के लिए धूप की टोपी, धूप का चश्मा और हल्के, पूरी बाँह के कपड़े; पैदल चलने के लिए बंद जूते। अगर आप सूर्यास्त के बाद रुकेंगे, तो एक गर्म परत भी रखें। यह मानने के बजाय कि रेगिस्तान की रातें हमेशा गर्म होती हैं, मौसम के पूर्वानुमान के अनुसार कपड़ों की परतें चुनें।"
      ],
      "sourceIds": [
        "liwa-desert-visit",
        "liwa-desert-season",
        "essentials"
      ]
    },
    {
      "id": "transport",
      "title": [
        "الوصول والتنقل",
        "Access and transport",
        "Accès et déplacements",
        "抵达与交通",
        "पहुँच और परिवहन"
      ],
      "body": [
        "الوصول إلى ليوا عبر الطريق يختلف عن القيادة فوق الرمال. للذهاب بين الكثبان، احجز مع منظّم رحلات صحراوية متمرس؛ السيارة العادية ليست تجهيزاً للقيادة خارج الطريق. تحقق من الوقود والاتصال وخطة إخراج المركبة عند تعثرها قبل مغادرة الطريق المعبّد.",
        "Separate reaching Liwa by road from driving on sand. Book an experienced desert operator for dune travel; an ordinary road car is not an off-road plan. Confirm fuel, communications and recovery arrangements before leaving paved access.",
        "Distinguez le trajet routier jusqu’à Liwa de la conduite sur le sable. Réservez un organisateur expérimenté pour les déplacements dans les dunes ; une voiture de route ordinaire ne convient pas à un parcours hors piste. Confirmez les dispositions concernant le carburant, les communications et le dépannage avant de quitter les voies goudronnées.",
        "将抵达利瓦的道路行驶与沙地驾驶分开考虑。沙丘行驶请预订有经验的沙漠运营方;普通公路车辆不等于越野方案。离开铺装道路前,请确认燃料、通讯和救援安排。",
        "सड़क से लीवा पहुँचने और रेत पर गाड़ी चलाने को अलग-अलग योजनाएँ मानें। टीलों पर यात्रा के लिए अनुभवी रेगिस्तानी संचालक बुक करें; सामान्य सड़क वाली कार ऑफ-रोड यात्रा की योजना नहीं है। पक्की सड़क से आगे जाने से पहले ईंधन, संचार और वाहन निकालने की व्यवस्था की पुष्टि करें।"
      ],
      "sourceIds": [
        "liwa-desert-visit",
        "liwa-desert-season"
      ]
    },
    {
      "id": "season",
      "title": [
        "الموسم وظروف يوم الرحلة",
        "Season and day-of-trip conditions",
        "Saison et conditions du jour",
        "季节与出行当天的条件",
        "मौसम और यात्रा के दिन की स्थिति"
      ],
      "body": [
        "يوصي دليل أبوظبي السياحي بالفترة من نوفمبر إلى مارس لزيارة الصحراء بأجواء ألطف. في الفترات الحارة، قلّل مدة البقاء في الأماكن المكشوفة وتحقق من التوقعات الحالية. الموسم المناسب لا يغني عن معرفة طقس يوم الرحلة.",
        "Abu Dhabi's tourism guide recommends November to March for more comfortable desert visits. In hotter periods, shorten exposed outings and check the current forecast. Seasonal guidance does not replace the conditions on your chosen day.",
        "Le guide touristique d’Abou Dhabi recommande la période de novembre à mars pour des visites du désert plus confortables. Pendant les périodes plus chaudes, réduisez la durée des sorties en plein soleil et consultez les prévisions actuelles. Les conseils saisonniers ne remplacent pas les conditions du jour choisi.",
        "阿布扎比旅游指南建议在11月至3月期间前往沙漠更舒适。炎热时段请缩短暴露在外的活动,并查询当天预报。季节性建议不能替代你选定日期的实际天气状况。",
        "अबू धाबी की पर्यटन गाइड अधिक आरामदायक रेगिस्तानी यात्राओं के लिए नवंबर से मार्च की सलाह देती है। अधिक गर्म अवधि में खुले में भ्रमण का समय कम रखें और मौजूदा मौसम पूर्वानुमान देखें। मौसम के आधार पर दी गई सलाह आपके चुने हुए दिन की वास्तविक परिस्थितियों का विकल्प नहीं है।"
      ],
      "sourceIds": [
        "liwa-desert-visit",
        "liwa-desert-season"
      ]
    },
    {
      "id": "equipment",
      "title": [
        "أولويات تجهيزك",
        "Packing priorities",
        "Priorités de préparation",
        "装备准备重点",
        "तैयारी की प्राथमिकताएँ"
      ],
      "body": [
        "ابدأ بالحماية من الشمس، وماء الشرب لكل شخص، وخريطة تعمل دون إنترنت مع شاحن احتياطي. أضف مصباحاً للتوقفات المسائية. عند المبيت، تأكد مما يوفّره المخيم من مأوى وفرش؛ اقتراح خيمة واحدة لا يعني أنها تتسع للمجموعة.",
        "Prioritise sun protection, personal drinking-water supplies and an offline route plus backup power. Add a headlamp for evening stops. For overnight camping, confirm shelter and bedding with your camp; a single tent suggestion does not assess space for your group.",
        "Privilégiez la protection solaire, une réserve personnelle d’eau potable, un itinéraire hors ligne et une batterie de secours. Ajoutez une lampe frontale pour les haltes en soirée. Pour camper la nuit, confirmez l’abri et la literie avec votre camp ; la simple recommandation d’une tente ne permet pas d’évaluer l’espace nécessaire à votre groupe.",
        "优先准备防晒用品、个人饮用水、离线路线和备用电源。夜间停留请加带头灯。若需露营过夜,请与营地确认帐篷和寝具;单一的帐篷建议并不能评估你们团队的所需空间。",
        "धूप से बचाव, अपने लिए पीने का पानी, ऑफलाइन मार्ग और बैकअप बिजली को प्राथमिकता दें। शाम के पड़ावों के लिए हेडलैम्प भी रखें। रातभर कैंपिंग के लिए अपने कैंप से आश्रय और बिस्तर की पुष्टि करें; केवल एक तंबू का सुझाव यह तय नहीं करता कि उसमें आपके समूह के लिए पर्याप्त जगह है या नहीं।"
      ],
      "sourceIds": [
        "liwa-desert-visit",
        "liwa-desert-season",
        "essentials"
      ]
    }
  ],
  "jebel-shams": [
    {
      "id": "visit",
      "title": [
        "ما الذي يناسب زيارتك؟",
        "Choose your visit",
        "Choisir votre visite",
        "选择游览方式",
        "अपनी यात्रा चुनें"
      ],
      "body": [
        "اختر زيارة إطلالة أو مسار مشي معلّماً يناسب قدرتك. يميّز دليل عُمان الرسمي بين المشي الجبلي والتسلق الذي يحتاج إلى خبرة. للمسار غير المألوف أو المكشوف، رتّب مع مرشد محلي مؤهل واتفق على خطة الرجوع.",
        "Choose a viewpoint visit or a signed walk suited to your ability. Oman’s official guide distinguishes mountain trekking from experienced climbing. For an unfamiliar or exposed route, arrange a qualified local guide and agree a turn-back plan.",
        "Choisissez un point de vue ou un sentier balisé adapté à vos capacités. Le guide officiel d’Oman distingue la randonnée en montagne de l’escalade réservée aux personnes expérimentées. Pour un itinéraire inconnu ou exposé, faites appel à un guide local qualifié et convenez d’un plan de demi-tour.",
        "选择适合自己能力的观景点游览或设有标识的步道。阿曼官方指南区分了山地徒步与专业攀登。对不熟悉或暴露的路线,请安排有资质的当地向导,并约定折返计划。",
        "अपनी क्षमता के अनुकूल किसी दर्शनीय स्थल की यात्रा या चिह्नित पैदल मार्ग चुनें। ओमान की आधिकारिक गाइड पर्वतीय ट्रेकिंग और अनुभवी लोगों के लिए चढ़ाई में अंतर करती है। किसी अनजान या खुले जोखिम वाले मार्ग के लिए योग्य स्थानीय गाइड की व्यवस्था करें और लौटने की सीमा पहले तय करें।"
      ],
      "sourceIds": [
        "oman-mountains"
      ]
    },
    {
      "id": "clothing",
      "title": [
        "ملابس مناسبة للمكان",
        "Clothing for the setting",
        "Vêtements adaptés au lieu",
        "适合当地的衣着",
        "स्थान के अनुसार कपड़े"
      ],
      "body": [
        "جهّز حذاء مشي بنعل متماسك وملابس مريحة على طبقات وطبقة خارجية مقاومة للرياح. احمل طبقة دافئة إضافية لتغير طقس الجبل. التسلق والنزول بالحبال يحتاجان إلى معدات وتدريب متخصصين خارج قائمة المشي هذه.",
        "Practical packing: grippy walking footwear, comfortable walking layers and a wind-resistant outer layer. Carry extra warmth for changing mountain weather. Climbing and rappelling require specialised equipment and instruction, beyond this walking checklist.",
        "À emporter en pratique : des chaussures de marche adhérentes, des vêtements confortables adaptés à la marche et une couche extérieure coupe-vent. Prévoyez une couche chaude supplémentaire pour faire face aux changements de météo en montagne. L’escalade et la descente en rappel exigent du matériel spécialisé et un encadrement qui dépassent cette liste destinée à la marche.",
        "实用装备:防滑步行鞋、舒适的分层步行衣物和防风外套。山地天气多变,请携带额外的保暖衣物。攀登和速降需要专业装备与指导,超出本徒步清单范围。",
        "साथ रखने लायक व्यावहारिक चीज़ें: अच्छी पकड़ वाले पैदल चलने के जूते, आरामदायक परतदार कपड़े और हवा रोकने वाली बाहरी परत। बदलते पर्वतीय मौसम के लिए अतिरिक्त गर्म कपड़े रखें। चढ़ाई और रैपलिंग के लिए विशेष उपकरण और प्रशिक्षण चाहिए, जो इस पैदल यात्रा की सूची के दायरे से बाहर हैं।"
      ],
      "sourceIds": [
        "oman-mountains",
        "essentials"
      ]
    },
    {
      "id": "transport",
      "title": [
        "الوصول والتنقل",
        "Access and transport",
        "Accès et déplacements",
        "抵达与交通",
        "पहुँच और परिवहन"
      ],
      "body": [
        "تأكد من طريق الوصول ومكان الوقوف وبداية المسار مع مكان إقامتك أو مرشدك. علامة الخريطة تشير إلى المنطقة، وليست نقطة بداية مسار موثقة. تحقق محلياً من حالة الطريق وملاءمة السيارة قبل الانطلاق.",
        "Confirm the exact access road, parking and route start with your accommodation or guide. A map pin identifies the area, not a verified trailhead. Check road condition and vehicle suitability locally before committing to the drive.",
        "Confirmez la route d’accès exacte, le stationnement et le départ de l’itinéraire auprès de votre hébergement ou de votre guide. Un repère sur une carte indique la zone, pas un départ de sentier vérifié. Vérifiez sur place l’état de la route et l’adéquation du véhicule avant d’entreprendre le trajet.",
        "请与住宿方或向导确认确切的进入道路、停车位置和路线起点。地图上的定位点仅表示大致区域,并非经过核实的登山口。出发前请在当地核实道路状况和车辆适用性。",
        "अपने ठहरने की जगह या गाइड से पहुँचने की सटीक सड़क, पार्किंग और मार्ग के शुरुआती स्थान की पुष्टि करें। नक्शे पर लगा पिन केवल क्षेत्र बताता है, किसी सत्यापित ट्रेलहेड को नहीं। ड्राइव पर निकलने का निर्णय लेने से पहले स्थानीय रूप से सड़क की स्थिति और वाहन की उपयुक्तता जाँचें।"
      ],
      "sourceIds": [
        "oman-mountains"
      ]
    },
    {
      "id": "season",
      "title": [
        "الموسم وظروف يوم الرحلة",
        "Season and day-of-trip conditions",
        "Saison et conditions du jour",
        "季节与出行当天的条件",
        "मौसम और यात्रा के दिन की स्थिति"
      ],
      "body": [
        "راجع توقعات موقع الجبل، وليس طقس مسقط وحده. تحقق من الرياح والأمطار ومدى الرؤية قبل كل خروج، وعدّل الخطة عند تدهور الظروف. هذا الدليل لا يؤكد فتح مسار بعينه في أي موسم.",
        "Use the forecast at the mountain location, not only the forecast for Muscat. Check wind, precipitation and visibility before each outing; change your plan when conditions deteriorate. This guide does not certify a route as open in any season.",
        "Consultez les prévisions pour le site en montagne, pas seulement celles de Mascate. Vérifiez le vent, les précipitations et la visibilité avant chaque sortie ; modifiez votre plan si les conditions se dégradent. Ce guide ne certifie pas qu’un itinéraire est ouvert, quelle que soit la saison.",
        "请查看山区当地的预报,而不只是马斯喀特的预报。每次出行前查看风力、降水和能见度;天气转差时请更改计划。本指南不能证明任何路线在任一季节处于开放状态。",
        "केवल मस्कट का नहीं, पर्वतीय स्थान का मौसम पूर्वानुमान देखें। हर भ्रमण से पहले हवा, वर्षा और दृश्यता जाँचें; परिस्थितियाँ बिगड़ने पर अपनी योजना बदलें। यह गाइड किसी भी मौसम में किसी मार्ग के खुले होने को प्रमाणित नहीं करती।"
      ],
      "sourceIds": [
        "oman-mountains"
      ]
    },
    {
      "id": "equipment",
      "title": [
        "أولويات تجهيزك",
        "Packing priorities",
        "Priorités de préparation",
        "装备准备重点",
        "तैयारी की प्राथमिकताएँ"
      ],
      "body": [
        "للمشي، ابدأ بحذاء متماسك وخريطة مسار محفوظة ومصباح مع مصدر طاقة احتياطي. أضف طبقة دافئة وماءً لكل شخص. ابتعد عن الحواف المكشوفة؛ معدات المشي لا تصلح تلقائياً للحماية أثناء التسلق.",
        "For a walk, prioritise grippy footwear, an offline trail map and a headlamp with spare power. Pack an additional warm layer and personal water. Keep away from exposed edges and do not treat hiking equipment as climbing protection.",
        "Pour une randonnée, privilégiez des chaussures adhérentes, une carte du sentier accessible hors ligne et une lampe frontale avec une alimentation de secours. Emportez une couche chaude supplémentaire et votre propre réserve d’eau. Restez à l’écart des bords exposés et ne considérez pas le matériel de randonnée comme une protection d’escalade.",
        "徒步时优先准备防滑鞋、离线步道地图和配有备用电源的头灯。请多带一件保暖衣物和个人饮水。请远离暴露的边缘,不要把徒步装备当作攀登保护装备。",
        "पैदल यात्रा के लिए अच्छी पकड़ वाले जूतों, ऑफलाइन ट्रेल मानचित्र और अतिरिक्त बिजली वाले हेडलैम्प को प्राथमिकता दें। एक अतिरिक्त गर्म परत और अपना पानी रखें। खुले किनारों से दूर रहें और पैदल यात्रा के उपकरणों को चढ़ाई की सुरक्षा सामग्री न मानें।"
      ],
      "sourceIds": [
        "oman-mountains",
        "essentials"
      ]
    }
  ],
  "black-forest": [
    {
      "id": "visit",
      "title": [
        "ما الذي يناسب زيارتك؟",
        "Choose your visit",
        "Choisir votre visite",
        "选择游览方式",
        "अपनी यात्रा चुनें"
      ],
      "body": [
        "ابدأ من مركز معلومات المتنزه الوطني، ثم اختر مساراً معلّماً أو جولة مع حارس تناسب قدرتك ووقتك. يجمع المتنزه بين البحيرات والغابات والموائل المرتفعة؛ اتبع مساراً محدداً بدلاً من اختراق الغابة.",
        "Start at a national-park information centre, then choose a signed path or ranger-led walk suited to your mobility and time. The park contains lakes, woodland and upland habitats; choose a defined route rather than walking cross-country.",
        "Commencez par un centre d’information du parc national, puis choisissez un sentier balisé ou une promenade accompagnée par un garde, adaptés à votre mobilité et au temps dont vous disposez. Le parc comprend des lacs, des forêts et des habitats d’altitude ; suivez un itinéraire défini plutôt que de marcher hors sentier.",
        "从国家公园信息中心开始,然后选择适合自己行动能力和时间、设有标识的步道或护林员带领的徒步。园内有湖泊、林地和高地栖息地;请选择明确路线,而非随意越野行走。",
        "शुरुआत राष्ट्रीय उद्यान के सूचना केंद्र से करें, फिर अपनी चलने-फिरने की क्षमता और उपलब्ध समय के अनुकूल कोई चिह्नित रास्ता या रेंजर के नेतृत्व वाली पैदल यात्रा चुनें। उद्यान में झीलें, वन क्षेत्र और ऊँचाई वाले प्राकृतिक आवास हैं; बिना रास्ते के इधर-उधर चलने के बजाय निर्धारित मार्ग चुनें।"
      ],
      "sourceIds": [
        "forest-visitor-tips",
        "forest-rules",
        "forest-access",
        "forest-closures"
      ]
    },
    {
      "id": "clothing",
      "title": [
        "ملابس مناسبة للمكان",
        "Clothing for the setting",
        "Vêtements adaptés au lieu",
        "适合当地的衣着",
        "स्थान के अनुसार कपड़े"
      ],
      "body": [
        "جهّز حذاءً متماسكاً للجذور والأسطح الرطبة، وسترة مطر وطبقة دافئة إضافية. يساعد غلاف صغير مقاوم للماء في إبقاء الهاتف والخريطة صالحين للاستخدام. تحقق من سطح المسار؛ ليست جميع دروب الغابة مهيأة لكل المستخدمين.",
        "Practical packing: footwear with grip for roots and damp surfaces, a rain shell and a spare warm layer. A small dry pouch keeps a phone and map readable in rain. Check the route surface rather than assuming every forest path is accessible.",
        "À emporter en pratique : des chaussures adhérentes pour les racines et les surfaces humides, une veste imperméable et une couche chaude de rechange. Une petite pochette étanche permet de garder un téléphone et une carte lisibles sous la pluie. Vérifiez le revêtement de l’itinéraire plutôt que de supposer que tous les sentiers forestiers sont accessibles.",
        "实用装备:应对树根和湿滑路面的防滑鞋、防雨外套和备用保暖层。小巧的防水袋可让手机和地图在雨天保持清晰可读。请核实路面情况,不要默认所有森林小径都便于通行。",
        "साथ रखने लायक व्यावहारिक चीज़ें: जड़ों और नम सतहों के लिए अच्छी पकड़ वाले जूते, बारिश से बचाने वाली बाहरी परत और एक अतिरिक्त गर्म परत। एक छोटी जलरोधी थैली बारिश में फोन और नक्शे को पढ़ने लायक बनाए रखती है। यह मानने के बजाय कि जंगल का हर रास्ता सुगम है, मार्ग की सतह की जाँच करें।"
      ],
      "sourceIds": [
        "forest-visitor-tips",
        "forest-rules",
        "forest-access",
        "forest-closures",
        "essentials"
      ]
    },
    {
      "id": "transport",
      "title": [
        "الوصول والتنقل",
        "Access and transport",
        "Accès et déplacements",
        "抵达与交通",
        "पहुँच और परिवहन"
      ],
      "body": [
        "حدّد نقطة الدخول قبل السفر، وراجع معلومات الوصول الحالية وخطّط للعودة. نزّل خريطة المسار. التزم بالمسارات المعلّمة والإغلاقات المعلنة؛ الوصول بالسيارة لا يعني السماح بدخول كل درب.",
        "Choose your entry point before travelling, check the park's current access information and plan the return journey. Download a route map. Follow signed paths and current closures; a road arrival point is not permission to enter any trail.",
        "Choisissez votre point d’entrée avant de partir, consultez les informations d’accès actuelles du parc et planifiez le trajet de retour. Téléchargez une carte de l’itinéraire. Respectez les sentiers balisés et les fermetures en vigueur ; arriver à un point d’accès routier ne signifie pas que vous êtes autorisé à emprunter n’importe quel sentier.",
        "出行前先确定入口点,查询公园的最新入园信息,并规划返程。请下载路线地图。请沿标识步道行走并遵守临时封闭通知;公路抵达点并不意味着可以进入任何小径。",
        "यात्रा से पहले अपना प्रवेश स्थान चुनें, उद्यान में पहुँच से जुड़ी मौजूदा जानकारी जाँचें और वापसी की योजना बनाएँ। मार्ग का नक्शा डाउनलोड करें। चिह्नित रास्तों और मौजूदा बंदिशों का पालन करें; सड़क से किसी स्थान तक पहुँच जाना किसी भी ट्रेल में प्रवेश की अनुमति नहीं है।"
      ],
      "sourceIds": [
        "forest-visitor-tips",
        "forest-rules",
        "forest-access",
        "forest-closures"
      ]
    },
    {
      "id": "season",
      "title": [
        "الموسم وظروف يوم الرحلة",
        "Season and day-of-trip conditions",
        "Saison et conditions du jour",
        "季节与出行当天的条件",
        "मौसम और यात्रा के दिन की स्थिति"
      ],
      "body": [
        "راجع إغلاقات المسارات الموسمية قبل كل زيارة. قد تغيّر ظروف الشتاء المسارات المناسبة، وقد تكون الأرض الرطبة زلقة حتى خارج الشتاء. اقرأ تنبيهات المتنزه وتوقعات اليوم قبل اختيار الجولة.",
        "Review seasonal trail closures before every visit. Winter conditions can change which paths are suitable, while wet ground can remain slippery outside winter. Check the park's notices and the day's forecast before selecting a walk.",
        "Consultez les fermetures saisonnières des sentiers avant chaque visite. En hiver, les conditions peuvent modifier les sentiers adaptés, tandis qu’un sol humide peut rester glissant en dehors de cette saison. Consultez les avis du parc et les prévisions du jour avant de choisir une promenade.",
        "每次到访前请查看季节性步道封闭信息。冬季状况会影响哪些路径适合行走,而在冬季之外，潮湿地面也可能打滑。选择徒步路线前,请查看公园公告和当天预报。",
        "हर यात्रा से पहले मौसम के अनुसार बंद ट्रेलों की जानकारी देखें। सर्दियों की परिस्थितियाँ बदल सकती हैं कि कौन-से रास्ते उपयुक्त हैं, जबकि सर्दियों के बाहर भी गीली ज़मीन फिसलन भरी रह सकती है। पैदल मार्ग चुनने से पहले उद्यान की सूचनाएँ और उस दिन का मौसम पूर्वानुमान देखें।"
      ],
      "sourceIds": [
        "forest-visitor-tips",
        "forest-rules",
        "forest-access",
        "forest-closures"
      ]
    },
    {
      "id": "equipment",
      "title": [
        "أولويات تجهيزك",
        "Packing priorities",
        "Priorités de préparation",
        "装备准备重点",
        "तैयारी की प्राथमिकताएँ"
      ],
      "body": [
        "ابدأ بسترة المطر والحذاء المتماسك وخريطة محفوظة وكيس تعيد فيه نفاياتك. المنظار اختياري لمراقبة الحياة البرية من بعيد. للمبيت، اختر ترتيبات مسموحة ومحجوزة؛ لا تفترض أن التخييم متاح في أي مكان بالغابة.",
        "Prioritise a rain shell, grippy shoes, a downloaded route and a bag to take all rubbish home. Binoculars are optional for watching wildlife at a distance. Use only permitted, booked overnight arrangements rather than assuming camping is allowed in the forest.",
        "Privilégiez une veste imperméable, des chaussures adhérentes, un itinéraire téléchargé et un sac pour rapporter tous vos déchets. Des jumelles sont facultatives pour observer la faune à distance. Pour passer la nuit, utilisez uniquement des installations autorisées et réservées plutôt que de supposer que le camping est permis dans la forêt.",
        "优先准备防雨外套、防滑鞋、已下载的路线和带走所有垃圾的袋子。双筒望远镜可用于远距离观察野生动物,并非必需。过夜请仅使用经许可和预订的安排,不要默认森林里允许露营。",
        "बारिश से बचाने वाली बाहरी परत, अच्छी पकड़ वाले जूते, डाउनलोड किया हुआ मार्ग और सारा कचरा वापस ले जाने के लिए एक थैला प्राथमिकता से रखें। दूर से वन्यजीव देखने के लिए दूरबीन वैकल्पिक है। यह मानने के बजाय कि जंगल में कैंपिंग की अनुमति है, रातभर ठहरने की केवल अनुमत और पहले से बुक की गई व्यवस्था का उपयोग करें।"
      ],
      "sourceIds": [
        "forest-visitor-tips",
        "forest-rules",
        "forest-access",
        "forest-closures",
        "essentials"
      ]
    }
  ],
  "hurghada": [
    {
      "id": "visit",
      "title": [
        "ما الذي يناسب زيارتك؟",
        "Choose your visit",
        "Choisir votre visite",
        "选择游览方式",
        "अपनी यात्रा चुनें"
      ],
      "body": [
        "حدّد النشاط أولاً: شاطئ، أو قارب بقاع زجاجي، أو سباحة بقناع وأنبوب، أو غوص مع مختص مؤهل. يذكر الدليل السياحي الرسمي رحلات القوارب والجزر في البحر الأحمر. إذا لم ترغب في دخول الماء، فقد تناسبك رحلة قارب للمشاهدة.",
        "Choose the activity first: a beach visit, a glass-bottom boat, snorkelling or a qualified diving outing. Official tourism guidance lists Red Sea boat and island trips. A boat with viewing opportunities can be an alternative when you do not want to enter the water.",
        "Choisissez d’abord l’activité : plage, bateau à fond de verre, plongée avec tuba ou sortie de plongée encadrée par un professionnel qualifié. Les recommandations touristiques officielles mentionnent des excursions en bateau et vers les îles de la mer Rouge. Un bateau offrant des possibilités d’observation peut être une solution de remplacement si vous ne souhaitez pas entrer dans l’eau.",
        "先选定活动:海滩游览、玻璃底船、浮潜或有资质的潜水行程。官方旅游指南列有红海乘船和岛屿行程。不想下水时,提供观景机会的乘船行程可作为替代选择。",
        "पहले गतिविधि चुनें: समुद्र तट की यात्रा, काँच के तल वाली नाव, स्नॉर्कलिंग या योग्य संचालक के साथ डाइविंग। आधिकारिक पर्यटन मार्गदर्शन में लाल सागर की नाव और द्वीप यात्राएँ सूचीबद्ध हैं। अगर आप पानी में नहीं उतरना चाहते, तो नज़ारे देखने की सुविधा वाली नाव एक विकल्प हो सकती है।"
      ],
      "sourceIds": [
        "egypt-sea",
        "egypt-snorkel"
      ]
    },
    {
      "id": "clothing",
      "title": [
        "ملابس مناسبة للمكان",
        "Clothing for the setting",
        "Vêtements adaptés au lieu",
        "适合当地的衣着",
        "स्थान के अनुसार कपड़े"
      ],
      "body": [
        "جهّز ملابس تحمي من الشمس وقبعة ونظارة على الشاطئ أو سطح القارب. خذ ملابس جافة للتبديل بعد الأنشطة المائية. اسأل المنظّم عن ملابس الحماية والمعدات المناسبة لمقاسك ولظروف النشاط.",
        "Practical packing: sun-protective clothing, a hat and sunglasses on shore or on deck. Take a dry change of clothes after water activities. Ask the activity operator what exposure protection and fitted equipment the conditions require.",
        "À emporter en pratique : des vêtements protégeant du soleil, un chapeau et des lunettes de soleil sur le rivage ou sur le pont. Prévoyez des vêtements secs de rechange après les activités aquatiques. Demandez à l’organisateur de l’activité quelle protection contre les éléments et quel équipement ajusté sont nécessaires selon les conditions.",
        "实用装备:岸上或甲板上穿防晒衣物、戴帽子和太阳镜。水上活动后请携带一套干的替换衣物。请询问活动运营方,当前条件下需要何种防护衣物和合身装备。",
        "साथ रखने लायक व्यावहारिक चीज़ें: तट या डेक पर धूप से बचाने वाले कपड़े, टोपी और धूप का चश्मा। पानी की गतिविधियों के बाद बदलने के लिए सूखे कपड़े रखें। गतिविधि संचालक से पूछें कि परिस्थितियों के अनुसार शरीर को बचाने वाली कौन-सी सामग्री और सही नाप के कौन-से उपकरण चाहिए।"
      ],
      "sourceIds": [
        "egypt-sea",
        "egypt-snorkel",
        "essentials"
      ]
    },
    {
      "id": "transport",
      "title": [
        "الوصول والتنقل",
        "Access and transport",
        "Accès et déplacements",
        "抵达与交通",
        "पहुँच और परिवहन"
      ],
      "body": [
        "تأكد من نقطة ركوب القارب ووقت العودة والمعدات التي يوفرها المنظّم. اختر رحلة تناسب قدرتك على السباحة وخبرتك. زيارة الشاطئ والإبحار والغوص خطط مختلفة؛ لا تفترض أن قائمة تجهيز واحدة تناسبها جميعاً.",
        "Confirm your embarkation point, return time and what equipment the operator supplies. Check that the outing matches your swimming ability and experience. Shore access, boating and diving are different plans and should not share one assumed equipment list.",
        "Confirmez le point d’embarquement, l’heure de retour et le matériel fourni par l’organisateur. Vérifiez que la sortie correspond à votre niveau de natation et à votre expérience. L’accès depuis le rivage, la navigation et la plongée sont des activités différentes et ne doivent pas reposer sur une même liste de matériel présumée.",
        "请确认登船地点、返回时间以及运营方提供的装备。请核实该行程是否符合你的游泳能力和经验。岸上游览、乘船和潜水是不同的方案,不应共用同一份想当然的装备清单。",
        "नाव पर चढ़ने की जगह, वापसी का समय और संचालक द्वारा दिए जाने वाले उपकरणों की पुष्टि करें। जाँचें कि भ्रमण आपकी तैराकी की क्षमता और अनुभव के अनुकूल है। तट पर जाना, नाव की सवारी और डाइविंग अलग-अलग योजनाएँ हैं और इनके लिए एक ही अनुमानित उपकरण सूची का उपयोग नहीं करना चाहिए।"
      ],
      "sourceIds": [
        "egypt-sea",
        "egypt-snorkel"
      ]
    },
    {
      "id": "season",
      "title": [
        "الموسم وظروف يوم الرحلة",
        "Season and day-of-trip conditions",
        "Saison et conditions du jour",
        "季节与出行当天的条件",
        "मौसम और यात्रा के दिन की स्थिति"
      ],
      "body": [
        "الشمس الساطعة لا تعني أن البحر مناسب للنشاط. راجع التوقعات البحرية والرياح والتعليمات المحلية قبل السباحة أو ركوب القارب. دع المنظّم يؤكد إمكانية تنفيذ النشاط؛ اسم الشهر ليس تصريحاً بالانطلاق.",
        "Sunshine alone does not confirm suitable sea conditions. Check the marine forecast, wind and local instructions before a boat or swimming outing. Let the operator confirm whether the selected activity can proceed; a calendar month is not a clearance.",
        "Le soleil ne suffit pas à garantir que les conditions en mer sont adaptées. Consultez les prévisions maritimes, le vent et les consignes locales avant une sortie en bateau ou une baignade. Laissez l’organisateur confirmer si l’activité choisie peut avoir lieu ; un mois du calendrier ne constitue pas une autorisation.",
        "天气晴朗本身并不能说明海况合适。乘船或下水前,请查看海洋预报、风力情况和当地指引。请让运营方确认所选活动能否进行;日历月份不是放行许可。",
        "केवल धूप होना समुद्र की परिस्थितियों के उपयुक्त होने की पुष्टि नहीं करता। नाव या तैराकी की यात्रा से पहले समुद्री मौसम पूर्वानुमान, हवा और स्थानीय निर्देश जाँचें। संचालक को पुष्टि करने दें कि चुनी गई गतिविधि हो सकती है या नहीं; कैलेंडर का कोई महीना अपने आप अनुमति नहीं है।"
      ],
      "sourceIds": [
        "egypt-sea",
        "egypt-snorkel",
        "beach-safety"
      ]
    },
    {
      "id": "equipment",
      "title": [
        "أولويات تجهيزك",
        "Packing priorities",
        "Priorités de préparation",
        "装备准备重点",
        "तैयारी की प्राथमिकताएँ"
      ],
      "body": [
        "ابدأ بالحماية من الشمس وحقيبة جافة للأغراض التي يجب ألا تبتل. عند الإبحار، تأكد من سترة نجاة مناسبة لمقاس كل شخص. للسباحة بقناع أو للغوص، راجع ملاءمة المعدات مع المنظّم، ولا تقف على المرجان أو تجمعه.",
        "Prioritise sun protection and a dry bag for items that must stay dry. For boating, confirm a correctly fitted life jacket for each person. For snorkelling or diving, confirm fitted equipment with the operator; never stand on or collect coral.",
        "Privilégiez la protection solaire et un sac étanche pour les objets qui doivent rester secs. Pour une sortie en bateau, confirmez que chaque personne dispose d’un gilet de sauvetage correctement ajusté. Pour la plongée avec tuba ou la plongée sous-marine, confirmez avec l’organisateur que le matériel est bien ajusté ; ne marchez jamais sur les coraux et n’en ramassez jamais.",
        "优先准备防晒用品和存放必须保持干燥物品的防水袋。乘船时,请确认每人都有合身的救生衣。浮潜或潜水时,请与运营方确认装备合身;切勿踩踏或采集珊瑚。",
        "धूप से बचाव और सूखी रखी जाने वाली वस्तुओं के लिए जलरोधी बैग को प्राथमिकता दें। नाव यात्रा के लिए हर व्यक्ति हेतु सही नाप की लाइफ जैकेट की पुष्टि करें। स्नॉर्कलिंग या डाइविंग के लिए संचालक से सही नाप के उपकरणों की पुष्टि करें; मूँगे पर कभी खड़े न हों और न ही उसे इकट्ठा करें।"
      ],
      "sourceIds": [
        "egypt-sea",
        "egypt-snorkel",
        "essentials",
        "beach-safety"
      ]
    }
  ]
};
export function enrichOriginalDestination(destination:Destination):Destination{const base=sections[destination.id];const nature:GuideSection={id:'nature',title:['الطبيعة وما يمكنك ملاحظته','Nature to observe','La nature à observer','可观察的自然','देखने योग्य प्रकृति'],body:[0,1,2,3,4].map(i=>destination.species.map(s=>s.description[i]).join(' ')) as Localized,sourceIds:[...new Set(destination.species.flatMap(s=>s.sourceIds))]};const additions=base?[...base,nature]:undefined;return additions?{...destination,sections:[...destination.sections.filter(section=>!additions.some(next=>next.id===section.id)),...additions],sourceIds:[...new Set([...destination.sourceIds,...additions.flatMap(section=>section.sourceIds)])]}:destination;}
