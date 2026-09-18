import {translate,type Locale} from './terrain';

export const packingWorkspaceWords={
 views:['عرض التجهيزات','Packing view','Vue des préparatifs','装备视图','तैयारी का दृश्य'],
 list:['قائمتي','My checklist','Ma liste','我的清单','मेरी सूची'],
 suggestions:['اقتراحات الرحلة','Trip suggestions','Suggestions du voyage','行程建议','यात्रा के सुझाव'],
 listHint:['جهّز أغراضك وتابع ما ينقصك','Pack your items and see what remains','Préparez vos affaires et voyez ce qui reste','整理装备，查看尚未完成的项目','सामान पैक करें और बाकी देखें'],
 suggestionsHint:['اختر ما يناسب رحلتك وأضفه','Choose what fits your trip and add it','Choisissez les articles adaptés et ajoutez-les','选择适合行程的物品并添加','यात्रा के लिए उपयोगी सामान चुनें और जोड़ें'],
 guide:['دليل تجهيز هذه الوجهة','This destination’s preparation guide','Guide de préparation de cette destination','目的地准备指南','इस गंतव्य की तैयारी गाइड'],
} satisfies Record<string,string[]>;
export const packingWorkspaceText=(locale:Locale,key:keyof typeof packingWorkspaceWords)=>translate(locale,packingWorkspaceWords[key]);
