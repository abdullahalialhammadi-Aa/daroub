import { terrains, locales, words } from './terrain';
import content from './terrain-content.json';
import type { Destination, Localized, SourceReference, SpeciesEntry } from './toolkit-types';

const reviewedAt = '2026-09-17';
export const sources: SourceReference[] = [
  ['liwa-culture', 'Abu Dhabi Culture · Liwa Oasis', 'https://abudhabiculture.ae/en/cultural-heritage/tangible/cultural-landscapes-and-oases/liwa-oasis'],
  ['oman-mountains', 'Experience Oman · Mountain activities', 'https://experienceoman.om/things-to-do-categories/mountain-activities'],
  ['forest-nature', 'Black Forest National Park · Nature', 'https://www.nationalpark-schwarzwald.de/nationalpark/natur'],
  ['forest-species', 'Black Forest National Park · Flora and fauna', 'https://www.nationalpark-schwarzwald.de/nationalpark/natur/flora-fauna'],
  ['forest-rules', 'Black Forest National Park · Visitor rules', 'https://www.nationalpark-schwarzwald.de/nationalpark/regeln-tipps/regeln-im-park'],
  ['egypt-sea', 'Egyptian Tourism Authority · Sun and sea', 'https://www.experienceegypt.eg/en/attraction/19/sun-sea'],
  ['essentials', 'National Park Service · Ten essentials', 'https://www.nps.gov/articles/10essentials.htm'],
  ['wildlife-safety', 'CDC · Wildlife, plants and toxic exposures', 'https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/poisonings-envenomations-and-toxic-exposures-during-travel.html'],
  ['beach-safety', 'NOAA · Beach hazards', 'https://oceanservice.noaa.gov/news/jul14/beachdangers.html'],
  ['mountain-safety', 'Mountain Safety Council · Hiking skills', 'https://www.mountainsafety.org.nz/learn/skills/hiking-tramping-skills'],
  ['lichen', 'National Park Service · Lichens', 'https://www.nps.gov/romo/learn/nature/lichens.htm'],
  ['eagle', 'National Park Service · Golden eagle', 'https://www.nps.gov/places/000/golden-eagle.htm'],
  ['seagrass', 'NOAA · Seagrass habitat', 'https://floridakeys.noaa.gov/plants/seagrass.html'],
].map(([id,title,url])=>({id,title,url,reviewedAt}));

const localTitles: Localized = ['المكان كما تصفه مصادره','The place, from local sources','Le lieu selon les sources locales','当地资料中的目的地','स्थानीय स्रोतों से स्थान परिचय'];
const localBodies: Localized[] = [
 ['تقع ليوا على الحافة الشمالية للربع الخالي، حيث تتجاور كثبان الرمال وبساتين النخيل المعتمدة على المياه الجوفية.','Liwa borders the northern Empty Quarter, where sand dunes meet date groves supported by groundwater.','Liwa borde le nord du Rub al-Khali, entre dunes et palmeraies alimentées par les eaux souterraines.','利瓦位于空旷之地沙漠北缘，沙丘与依靠地下水的椰枣园相邻。','लीवा रुब अल खाली के उत्तरी किनारे पर है, जहाँ रेत के टीलों के पास भूजल से सिंचित खजूर के बाग हैं।'],
 ['تضم منطقة جبل شمس مسارات جبلية وتسلقاً للصخور. يميز الدليل الرسمي بين المشي والأنشطة التي تتطلب خبرة؛ راجع الطقس قبل اختيار نشاطك.','Jebel Shams offers mountain trails and rock climbing. The official guide distinguishes walks from experienced climbing; check the weather before choosing an activity.','Le Djebel Shams offre sentiers et escalade. Le guide officiel distingue la randonnée des activités exigeant de l’expérience ; consultez la météo.','沙姆斯山有徒步路线和攀岩活动。官方指南区分步行与需要经验的攀登；选择活动前查看天气。','जेबेल शम्स में पहाड़ी पगडंडियाँ और चट्टान आरोहण हैं। आधिकारिक गाइड पैदल भ्रमण और अनुभवी चढ़ाई में अंतर करता है; पहले मौसम देखें।'],
 ['تشمل الغابة السوداء غابات ومروجاً مرتفعة ومستنقعات وبحيرات. معلومات الطبيعة هنا تخص المتنزه الوطني في شمال المنطقة؛ ليست جرداً لكل الغابة السوداء.','The Black Forest includes woodland, upland heaths, bogs and lakes. Nature details here concern the northern national park, not the whole Black Forest.','La Forêt-Noire comprend forêts, landes, tourbières et lacs. Ces informations concernent le parc national du nord, pas toute la région.','黑森林包括林地、高地荒原、泥炭地和湖泊。此处生态资料指北部国家公园，并非整个黑森林。','ब्लैक फ़ॉरेस्ट में वन, ऊँची झाड़ीभूमि, दलदल और झीलें हैं। यहाँ की प्रकृति जानकारी उत्तरी राष्ट्रीय उद्यान की है, पूरे क्षेत्र की सूची नहीं।'],
 ['الغردقة نقطة انطلاق لاستكشاف ساحل البحر الأحمر وجزر الجفتون. تختلف الأنشطة البحرية عن زيارة الشاطئ؛ اختر النشاط المناسب لخبرتك ومرافقك.','Hurghada is a base for the Red Sea coast and Giftun Islands. A boat or underwater outing needs different preparation from a beach visit.','Hurghada permet de découvrir la mer Rouge et les îles Giftoun. Sorties en mer et plongée demandent une préparation différente de la plage.','赫尔格达是探索红海海岸与吉夫顿群岛的出发点。乘船或水下活动所需准备不同于海滩游览。','हर्गहाडा लाल सागर तट और गिफ्टुन द्वीपों का आधार है। नाव या पानी के भीतर की यात्रा की तैयारी समुद्रतट भ्रमण से अलग होती है।'],
];
const respect: Localized = ['راقب من مسافة، ولا تطعم أو تلمس أو تجمع الكائنات. لا يعتمد تحديد النوع أو صلاحيته للأكل على هذا الدليل.','Observe from a distance; do not feed, touch or collect. This guide cannot establish identification or edibility.','Observez à distance ; ne nourrissez, touchez ou prélevez rien. Ce guide ne permet pas de déterminer une espèce ou sa comestibilité.','保持距离观察，不投喂、触摸或采集。本指南不能用于物种鉴定或食用判断。','दूरी से देखें; न खिलाएँ, छुएँ या संग्रह करें। इस गाइड से प्रजाति या खाने योग्य होने की पहचान नहीं होती।'];
const species = (id:string,name:Localized,description:Localized,sourceIds:string[],coverage:SpeciesEntry['coverage']='terrain-example'):SpeciesEntry=>({id,name,description,precaution:respect,sourceIds,coverage});
const speciesLists:SpeciesEntry[][] = [
 [species('date-palm',['نخيل التمر','Date palms','Palmiers-dattiers','椰枣树','खजूर के पेड़'],['بساتين النخيل جزء من المشهد الزراعي الموثق في ليوا.','Date groves form part of Liwa’s documented agricultural landscape.','Les palmeraies font partie du paysage agricole documenté de Liwa.','椰枣园是利瓦有记录的农业景观的一部分。','खजूर के बाग लीवा के प्रलेखित कृषि परिदृश्य का हिस्सा हैं।'],['liwa-culture'],'local'),
 species('camel',['الإبل','Camels','Dromadaires','骆驼','ऊँट'],['تربية الإبل من الأنشطة التاريخية الموثقة لسكان الواحة.','Camel husbandry is documented in the oasis’s history.','L’élevage des dromadaires est documenté dans l’histoire de l’oasis.','绿洲历史记载有骆驼养殖。','ऊँट पालन का उल्लेख इस नखलिस्तान के इतिहास में है।'],['liwa-culture'],'local')],
 [species('lichen',['الأشنات','Lichens','Lichens','地衣','लाइकेन'],['كائنات بطيئة النمو تستعمر الصخور وتساهم تدريجياً في تكوّن التربة. المثال من مصدر تعليمي، دون توثيق محلي هنا.','Slow-growing organisms colonize rock and contribute to soil formation. This educational example is not locally verified here.','Ces organismes lents colonisent les roches et participent à la formation des sols. Exemple pédagogique non vérifié localement.','缓慢生长的生物在岩石上定居，有助于土壤形成。本教学示例未经当地核实。','धीरे बढ़ने वाले जीव चट्टानों पर बसकर मिट्टी बनने में योगदान करते हैं। यह शैक्षिक उदाहरण यहाँ स्थानीय रूप से सत्यापित नहीं है।'],['lichen']),
 species('golden-eagle',['العقاب الذهبي','Golden eagle','Aigle royal','金雕','सुनहरा उकाब'],['مثال لطائر جارح يستخدم البيئات المفتوحة والمنحدرات الصخرية. لا يؤكد الدليل وجوده عند الإحداثيات المختارة.','An example of a raptor using open landscapes and rocky cliffs; presence at the selected coordinates is not confirmed.','Exemple de rapace des espaces ouverts et falaises ; sa présence aux coordonnées choisies n’est pas confirmée.','利用开阔地带与岩壁的猛禽示例；未确认其在所选坐标出现。','खुले भूभाग और चट्टानी ढलानों के शिकारी पक्षी का उदाहरण; चुने निर्देशांकों पर उपस्थिति पुष्ट नहीं है।'],['eagle'])],
 [species('spruce-beech',['التنوب والزان','Spruce and beech','Épicéas et hêtres','云杉与山毛榉','स्प्रूस और बीच'],['يصف المتنزه الوطني غابات مختلطة تضم هذه الأشجار.','The national park describes mixed forests containing these trees.','Le parc national décrit des forêts mixtes comprenant ces arbres.','国家公园资料记载混交林中有这些树木。','राष्ट्रीय उद्यान इन पेड़ों वाले मिश्रित वनों का वर्णन करता है।'],['forest-nature'],'local'),
 species('capercaillie',['طائر الطيهوج الكبير','Western capercaillie','Grand tétras','西方松鸡','कैपरकैली'],['يوثق المتنزه الوطني أهمية موائله لهذا الطائر. التزم بالمسارات وأبقِ مسافة مشاهدة.','The national park documents important habitat for this bird. Keep to paths and observe from a distance.','Le parc documente des habitats importants pour cet oiseau. Restez sur les chemins et observez à distance.','国家公园记录了该鸟类的重要栖息地。沿步道行走并保持距离。','उद्यान इस पक्षी के महत्वपूर्ण आवास दर्ज करता है। पगडंडी पर रहें और दूरी से देखें।'],['forest-species','forest-rules'],'local')],
 [species('dolphin',['الدلافين','Dolphins','Dauphins','海豚','डॉल्फ़िन'],['يذكر المصدر الرسمي رحلات إلى مناطق مشاهدة الدلافين يمكن الوصول إليها من الغردقة؛ المشاهدة ليست مضمونة.','The official source describes dolphin-viewing outings accessible from Hurghada; sightings are not guaranteed.','La source officielle décrit des sorties d’observation accessibles depuis Hurghada ; les rencontres ne sont pas garanties.','官方资料介绍了从赫尔格达可达的海豚观察区域；不保证能看见。','आधिकारिक स्रोत हर्गहाडा से डॉल्फ़िन देखने की यात्राओं का वर्णन करता है; दिखना सुनिश्चित नहीं है।'],['egypt-sea'],'local'),
 species('seagrass',['الأعشاب البحرية الزهرية','Seagrasses','Herbiers marins','海草','समुद्री घास'],['توفر المروج البحرية موائل للكائنات. هذا مثال ساحلي عام، وليس توثيقاً لمرج عند هذه النقطة.','Seagrass meadows provide habitat. This is a coastal example, not a verified meadow at this point.','Les herbiers abritent la vie marine. Exemple côtier, sans présence vérifiée à ce point.','海草草甸提供栖息地。这是海岸教学示例，并非确认该点存在草甸。','समुद्री घास के मैदान आवास देते हैं। यह तटीय उदाहरण है, इस बिंदु पर सत्यापित मैदान नहीं।'],['seagrass'])],
];

export const destinations: Destination[] = terrains.map((terrain,index)=>{
 const localSource=['liwa-culture','oman-mountains','forest-nature','egypt-sea'][index];
 const sections = ['deeper','equipment','hazard'].map(key=>({
  id:key, title:words[key==='hazard'?'warning':key] as Localized,
  body:locales.map(locale=>content[locale].terrains[index][key as 'deeper'|'equipment'|'hazard']) as Localized,
  sourceIds:key==='equipment'?['essentials']:key==='hazard'?[index===3?'beach-safety':index===1?'mountain-safety':'wildlife-safety']:[],
 }));
 return {id:['liwa','jebel-shams','black-forest','hurghada'][index],terrainId:terrain.id as Destination['terrainId'],terrainIndex:index,names:terrain.places as Localized,summary:terrain.descriptions as Localized,lat:terrain.lat,lon:terrain.lon,image:terrain.image,imageIsIllustrative:true,sourceIds:[localSource],sections:[{id:'place',title:localTitles,body:localBodies[index],sourceIds:[localSource]},...sections],species:speciesLists[index]};
});
export function destinationById(id:string|null|undefined){return destinations.find(d=>d.id===id)}
export function destinationForTerrain(index:number){return destinations[index]??destinations[0]}
export function sourcesFor(ids:string[]){return sources.filter(s=>ids.includes(s.id))}
