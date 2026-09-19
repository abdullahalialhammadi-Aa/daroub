/**
 * The angled scene: icons of the life and the essentials of a terrain, standing on the imagery around the focus point.
 * Catalogue species come first; the rest are educational terrain examples, never claims of presence at the coordinates.
 * Pure and unit-tested; the component only maps icon keys to drawings.
 */
import type { Localized, SpeciesEntry, TerrainId } from './toolkit-types';
import { FOCUS_COUNTRY } from './region';

export type SceneKind = 'animal' | 'plant' | 'hazard' | 'gear' | 'camp';
export type SceneIcon = 'paw' | 'bird' | 'fish' | 'bug' | 'rabbit' | 'turtle' | 'worm' | 'squirrel' | 'shell' | 'dog' | 'cat' | 'treePine' | 'treeDeciduous' | 'flower' | 'wheat' | 'sprout' | 'leaf' | 'sun' | 'droplets' | 'tent' | 'wind' | 'footprints' | 'mountainSnow' | 'snowflake' | 'compass' | 'waves' | 'flame';
export type SceneTopic = 'nature' | 'precautions' | 'equipment' | 'group' | 'terrain';
export interface SceneItem { id: string; kind: SceneKind; icon: SceneIcon; label: Localized; topic: SceneTopic; example: boolean; dx: number; dy: number }
type Example = { id: string; kind: SceneKind; icon: SceneIcon; label: Localized; topic: SceneTopic };

const life: Record<TerrainId, Example[]> = {
  desert: [
    { id: 'camel', kind: 'animal', icon: 'paw', topic: 'nature', label: ['الجمل', 'Camel', 'Dromadaire', '骆驼', 'ऊँट'] },
    { id: 'fennec', kind: 'animal', icon: 'dog', topic: 'nature', label: ['ثعلب الفنك', 'Fennec fox', 'Fennec', '耳廓狐', 'फ़ेनेक लोमड़ी'] },
    { id: 'scorpion', kind: 'animal', icon: 'bug', topic: 'precautions', label: ['العقرب', 'Scorpion', 'Scorpion', '蝎子', 'बिच्छू'] },
    { id: 'date-palm', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['نخلة التمر', 'Date palm', 'Palmier dattier', '椰枣树', 'खजूर का पेड़'] },
    { id: 'acacia', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['السنط', 'Acacia', 'Acacia', '金合欢', 'बबूल'] },
  ],
  mountain: [
    { id: 'ibex', kind: 'animal', icon: 'paw', topic: 'nature', label: ['الوعل', 'Ibex', 'Bouquetin', '野山羊', 'आइबेक्स'] },
    { id: 'golden-eagle', kind: 'animal', icon: 'bird', topic: 'nature', label: ['العقاب الذهبي', 'Golden eagle', 'Aigle royal', '金雕', 'सुनहरा बाज़'] },
    { id: 'marmot', kind: 'animal', icon: 'squirrel', topic: 'nature', label: ['المرموط', 'Marmot', 'Marmotte', '土拨鼠', 'मार्मोट'] },
    { id: 'juniper', kind: 'plant', icon: 'treePine', topic: 'nature', label: ['العرعر', 'Juniper', 'Genévrier', '杜松', 'जूनिपर'] },
    { id: 'lichen', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['الأشنة', 'Lichen', 'Lichen', '地衣', 'लाइकेन'] },
  ],
  forest: [
    { id: 'roe-deer', kind: 'animal', icon: 'paw', topic: 'nature', label: ['الأيل', 'Roe deer', 'Chevreuil', '狍', 'हिरण'] },
    { id: 'woodpecker', kind: 'animal', icon: 'bird', topic: 'nature', label: ['نقار الخشب', 'Woodpecker', 'Pic', '啄木鸟', 'कठफोड़वा'] },
    { id: 'tick', kind: 'animal', icon: 'bug', topic: 'precautions', label: ['القراد', 'Tick', 'Tique', '蜱虫', 'किलनी'] },
    { id: 'spruce', kind: 'plant', icon: 'treePine', topic: 'nature', label: ['شجرة التنوب', 'Spruce', 'Épicéa', '云杉', 'स्प्रूस'] },
    { id: 'fern', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['السرخس', 'Fern', 'Fougère', '蕨类', 'फ़र्न'] },
  ],
  coast: [
    { id: 'seagull', kind: 'animal', icon: 'bird', topic: 'nature', label: ['النورس', 'Seagull', 'Goéland', '海鸥', 'समुद्री गल'] },
    { id: 'crab', kind: 'animal', icon: 'shell', topic: 'nature', label: ['السلطعون', 'Crab', 'Crabe', '螃蟹', 'केकड़ा'] },
    { id: 'dolphin', kind: 'animal', icon: 'fish', topic: 'nature', label: ['الدلفين', 'Dolphin', 'Dauphin', '海豚', 'डॉल्फ़िन'] },
    { id: 'mangrove', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['القرم', 'Mangrove', 'Palétuvier', '红树', 'मैंग्रोव'] },
    { id: 'seagrass', kind: 'plant', icon: 'leaf', topic: 'nature', label: ['الأعشاب البحرية', 'Seagrass', 'Herbier marin', '海草', 'समुद्री घास'] },
  ],
};
/** UAE terrain examples (docs/uae-plan.md §4): native species typical of each terrain, drawn with distinct icons.
 *  Educational examples only — the catalogue's sourced species still come first and carry the local/example flag. */
const uaeLife: Record<TerrainId, Example[]> = {
  desert: [
    { id: 'arabian-oryx', kind: 'animal', icon: 'paw', topic: 'nature', label: ['المها العربي', 'Arabian oryx', 'Oryx d’Arabie', '阿拉伯大羚羊', 'अरबी ओरिक्स'] },
    { id: 'arabian-red-fox', kind: 'animal', icon: 'dog', topic: 'nature', label: ['الثعلب الأحمر العربي', 'Arabian red fox', 'Renard roux d’Arabie', '阿拉伯赤狐', 'अरबी लाल लोमड़ी'] },
    { id: 'scorpion', kind: 'animal', icon: 'bug', topic: 'precautions', label: ['العقرب', 'Scorpion', 'Scorpion', '蝎子', 'बिच्छू'] },
    { id: 'ghaf', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['شجرة الغاف', 'Ghaf tree', 'Ghaf (Prosopis cineraria)', '加夫树（牧豆树）', 'घाफ़ (खेजड़ी) वृक्ष'] },
    { id: 'samr', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['شجرة السمر', 'Samr acacia', 'Acacia samr', '伞刺金合欢（萨姆尔）', 'समर बबूल'] },
  ],
  mountain: [
    { id: 'arabian-tahr', kind: 'animal', icon: 'paw', topic: 'nature', label: ['الطهر العربي', 'Arabian tahr', 'Tahr d’Arabie', '阿拉伯塔尔羊', 'अरबी टार'] },
    { id: 'egyptian-vulture', kind: 'animal', icon: 'bird', topic: 'nature', label: ['الرخمة المصرية', 'Egyptian vulture', 'Vautour percnoptère', '白兀鹫', 'सफ़ेद (मिस्री) गिद्ध'] },
    { id: 'saw-scaled-viper', kind: 'animal', icon: 'worm', topic: 'precautions', label: ['أفعى الحراشف المنشارية', 'Saw-scaled viper', 'Échide carénée', '锯鳞蝰', 'आरी-शल्क वाइपर'] },
    { id: 'wild-olive', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['الزيتون البري', 'Wild olive', 'Olivier sauvage', '野橄榄', 'जंगली जैतून'] },
    { id: 'sidr', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['السدر', 'Sidr tree', 'Jujubier sidr', '滨枣（西德尔）', 'सिद्र (बेर) वृक्ष'] },
  ],
  forest: [
    { id: 'ghaf', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['شجرة الغاف', 'Ghaf tree', 'Ghaf (Prosopis cineraria)', '加夫树（牧豆树）', 'घाफ़ (खेजड़ी) वृक्ष'] },
    { id: 'arabian-babbler', kind: 'animal', icon: 'bird', topic: 'nature', label: ['الثرثارة العربية', 'Arabian babbler', 'Cratérope écaillé', '阿拉伯鸫鹛', 'अरबी बैबलर'] },
    { id: 'desert-hedgehog', kind: 'animal', icon: 'paw', topic: 'nature', label: ['القنفذ الصحراوي', 'Desert hedgehog', 'Hérisson du désert', '沙漠刺猬', 'मरुस्थलीय हेजहॉग'] },
    { id: 'arabian-red-fox', kind: 'animal', icon: 'dog', topic: 'nature', label: ['الثعلب الأحمر العربي', 'Arabian red fox', 'Renard roux d’Arabie', '阿拉伯赤狐', 'अरबी लाल लोमड़ी'] },
    { id: 'sidr', kind: 'plant', icon: 'sprout', topic: 'nature', label: ['السدر', 'Sidr tree', 'Jujubier sidr', '滨枣（西德尔）', 'सिद्र (बेर) वृक्ष'] },
  ],
  coast: [
    { id: 'greater-flamingo', kind: 'animal', icon: 'bird', topic: 'nature', label: ['النحام الكبير', 'Greater flamingo', 'Flamant rose', '大红鹳', 'बड़ा राजहंस'] },
    { id: 'green-turtle', kind: 'animal', icon: 'turtle', topic: 'nature', label: ['السلحفاة الخضراء', 'Green turtle', 'Tortue verte', '绿海龟', 'हरा समुद्री कछुआ'] },
    { id: 'dugong', kind: 'animal', icon: 'fish', topic: 'nature', label: ['الأطوم', 'Dugong', 'Dugong', '儒艮', 'डुगोंग'] },
    { id: 'grey-mangrove', kind: 'plant', icon: 'treeDeciduous', topic: 'nature', label: ['القرم الرمادي', 'Grey mangrove', 'Palétuvier gris', '白骨壤（灰红树）', 'ग्रे मैंग्रोव'] },
    { id: 'jellyfish', kind: 'animal', icon: 'bug', topic: 'precautions', label: ['قنديل البحر', 'Jellyfish', 'Méduse', '水母', 'जेलीफ़िश'] },
  ],
};
const lifeByFocus: Record<string, Record<TerrainId, Example[]>> = { world: life, AE: uaeLife };
/** Terrain examples for the product focus (lib/region.ts); unknown focuses fall back to the world set. */
export function lifeExamples(terrainId: TerrainId, focus: string | null = FOCUS_COUNTRY): Example[] { const set = lifeByFocus[focus ?? 'world'] ?? life; return set[terrainId] ?? set.desert; }

const essentials: Record<TerrainId, Example[]> = {
  desert: [
    { id: 'heat', kind: 'hazard', icon: 'sun', topic: 'precautions', label: ['حرارة النهار', 'Daytime heat', 'Chaleur du jour', '白天高温', 'दिन की गर्मी'] },
    { id: 'water', kind: 'gear', icon: 'droplets', topic: 'equipment', label: ['الماء', 'Water', 'Eau', '饮水', 'पानी'] },
    { id: 'sandstorm', kind: 'hazard', icon: 'wind', topic: 'precautions', label: ['عاصفة رملية', 'Sandstorm', 'Tempête de sable', '沙尘暴', 'रेत का तूफ़ान'] },
    { id: 'camp', kind: 'camp', icon: 'tent', topic: 'group', label: ['المخيم', 'Camp', 'Camp', '营地', 'शिविर'] },
  ],
  mountain: [
    { id: 'altitude', kind: 'hazard', icon: 'mountainSnow', topic: 'precautions', label: ['الارتفاع', 'Altitude', 'Altitude', '海拔', 'ऊँचाई'] },
    { id: 'cold', kind: 'gear', icon: 'snowflake', topic: 'equipment', label: ['البرد', 'Cold', 'Froid', '寒冷', 'ठंड'] },
    { id: 'navigation', kind: 'gear', icon: 'compass', topic: 'equipment', label: ['الملاحة', 'Navigation', 'Navigation', '导航', 'दिशा-निर्देशन'] },
    { id: 'camp', kind: 'camp', icon: 'tent', topic: 'group', label: ['المخيم', 'Camp', 'Camp', '营地', 'शिविर'] },
  ],
  forest: [
    { id: 'trail', kind: 'gear', icon: 'footprints', topic: 'terrain', label: ['المسار', 'Trail', 'Sentier', '小径', 'पगडंडी'] },
    { id: 'water', kind: 'gear', icon: 'droplets', topic: 'equipment', label: ['الماء', 'Water', 'Eau', '饮水', 'पानी'] },
    { id: 'wildfire', kind: 'hazard', icon: 'flame', topic: 'precautions', label: ['حرائق الغابات', 'Wildfire', 'Feu de forêt', '山火', 'जंगल की आग'] },
    { id: 'camp', kind: 'camp', icon: 'tent', topic: 'group', label: ['المخيم', 'Camp', 'Camp', '营地', 'शिविर'] },
  ],
  coast: [
    { id: 'tides', kind: 'hazard', icon: 'waves', topic: 'precautions', label: ['المد والجزر', 'Tides', 'Marées', '潮汐', 'ज्वार-भाटा'] },
    { id: 'heat', kind: 'hazard', icon: 'sun', topic: 'precautions', label: ['حرارة النهار', 'Daytime heat', 'Chaleur du jour', '白天高温', 'दिन की गर्मी'] },
    { id: 'wind', kind: 'hazard', icon: 'wind', topic: 'precautions', label: ['الرياح', 'Wind', 'Vent', '风', 'हवा'] },
    { id: 'camp', kind: 'camp', icon: 'tent', topic: 'group', label: ['المخيم', 'Camp', 'Camp', '营地', 'शिविर'] },
  ],
};

const plantWords = /palm|tree|acacia|cactus|fig|pine|spruce|fir|cedar|juniper|oak|beech|birch|fern|grass|flower|orchid|lily|heather|moss|lichen|shrub|bush|olive|date|tamarisk|reed|mangrove|kelp|seaweed|sidr|saxaul|wormwood|sage|thyme|lavender|bilberry|blueberry|willow|poplar|maple|alder|hazel|ivy|vine|sea ?grass/i;
const animalPatterns: [RegExp, SceneIcon][] = [
  [/fox|wolf|jackal|dog|hyena|coyote/i, 'dog'], [/cat|lynx|leopard|caracal|cheetah|puma|bobcat/i, 'cat'],
  [/bird|eagle|falcon|hawk|owl|vulture|gull|tern|heron|stork|flamingo|capercaillie|chukar|grouse|partridge|woodpecker|crow|raven|pelican|osprey|kite|swift|swallow|finch|kestrel|buzzard|ptarmigan|puffin/i, 'bird'],
  [/fish|dolphin|whale|seal|shark|ray|tuna|salmon|trout|manatee|dugong/i, 'fish'], [/turtle|tortoise/i, 'turtle'],
  [/snake|viper|cobra|adder|lizard|gecko|skink|monitor|agama|alligator|crocodile|caiman|iguana|salamander|newt|frog|toad/i, 'worm'],
  [/scorpion|spider|tick|mosquito|bee|wasp|hornet|ant|beetle|butterfly|moth|locust|jellyfish|centipede|fly|dragonfly/i, 'bug'],
  [/rabbit|hare|pika/i, 'rabbit'], [/squirrel|marten|marmot|chipmunk|weasel|otter|beaver|mongoose/i, 'squirrel'], [/crab|snail|shell|urchin|clam|mussel|lobster|shrimp|starfish|coral/i, 'shell'],
];
/** Guesses whether a catalogue species is a plant or an animal, and which drawing suits it, from its identifier and English name. */
export function classifySpecies(id: string, english: string): { kind: 'animal' | 'plant'; icon: SceneIcon } {
  const text = `${id} ${english}`;
  if (plantWords.test(text)) {
    if (/pine|spruce|fir|cedar|juniper|conifer/i.test(text)) return { kind: 'plant', icon: 'treePine' };
    if (/palm|tree|acacia|oak|beech|birch|olive|tamarisk|mangrove|willow|poplar|maple|alder|hazel|sidr|fig|date/i.test(text)) return { kind: 'plant', icon: 'treeDeciduous' };
    if (/flower|orchid|lily|heather|lavender/i.test(text)) return { kind: 'plant', icon: 'flower' };
    if (/grass|reed|wheat/i.test(text)) return { kind: 'plant', icon: 'wheat' };
    if (/moss|lichen|fern|shrub|bush|cactus|saxaul|wormwood|sage|thyme|bilberry|blueberry/i.test(text)) return { kind: 'plant', icon: 'sprout' };
    return { kind: 'plant', icon: 'leaf' };
  }
  for (const [pattern, icon] of animalPatterns) if (pattern.test(text)) return { kind: 'animal', icon };
  return { kind: 'animal', icon: 'paw' };
}
/** Deterministic spots on a flattened spiral around the focus point, so the same place always shows the same scene. */
function place(index: number, count: number, radius: number): { dx: number; dy: number } {
  const angle = (index * 137.508 * Math.PI) / 180 + 0.6, r = radius * (0.38 + 0.62 * Math.sqrt((index + 1) / Math.max(count, 1)));
  return { dx: Math.round(Math.cos(angle) * r), dy: Math.round(Math.sin(angle) * r * 0.72) };
}
/** Up to six living things (catalogue species first, then the focus's terrain examples) and four essentials, positioned around the centre. */
export function sceneItems(terrainId: TerrainId, species: SpeciesEntry[], radius: number, maxLife = 6, focus: string | null = FOCUS_COUNTRY): SceneItem[] {
  const items: Omit<SceneItem, 'dx' | 'dy'>[] = [];
  for (const entry of species.slice(0, maxLife)) {
    const { kind, icon } = classifySpecies(entry.id, entry.name[1] ?? '');
    items.push({ id: `species:${entry.id}`, kind, icon, label: entry.name, topic: 'nature', example: entry.coverage !== 'local' });
  }
  for (const example of lifeExamples(terrainId, focus)) {
    if (items.length >= maxLife) break;
    if (items.some((item) => item.icon === example.icon && item.kind === example.kind)) continue;
    items.push({ ...example, example: true });
  }
  for (const example of essentials[terrainId] ?? essentials.desert) items.push({ ...example, example: false });
  return items.map((item, index) => ({ ...item, ...place(index, items.length, radius) }));
}
