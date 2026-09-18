import {translate,type Locale} from './terrain';
export const itineraryWords:Record<string,string[]>={
 yourPlan:['خطتك، يوماً بيوم','Your plan, day by day','Votre programme, jour par jour','逐日规划','हर दिन की आपकी योजना'],
 intro:['أضف الأنشطة والمحطات، وافتح تفاصيل أي نشاط لتعديله.','Add activities and stops. Open any activity to adjust its details.','Ajoutez vos activités et étapes, puis ouvrez-les pour modifier leurs détails.','添加活动与停留点，展开任一活动即可修改详情。','गतिविधियाँ और पड़ाव जोड़ें। विवरण बदलने के लिए कोई भी गतिविधि खोलें।'],
 days:['الأيام','Days','Jours','天数','दिन'],activities:['الأنشطة','Activities','Activités','活动数','गतिविधियाँ'],
 tripActivities:['أنشطة الرحلة','Trip activities','Activités du voyage','行程活动类型','यात्रा की गतिविधियाँ'],
 activitiesHelp:['اختر الأنشطة المتوقعة لتخصيص اقتراحات التجهيز. يمكنك تحديد نشاط مختلف لكل محطة أدناه.','Choose planned activities to tailor packing suggestions. Each stop below can have its own activity type.','Choisissez les activités prévues pour adapter les suggestions de matériel. Chaque étape peut avoir son propre type d’activité.','选择计划中的活动，以调整装备建议。下方每个停留点可设置独立的活动类型。','सामान के सुझावों के लिए नियोजित गतिविधियाँ चुनें। नीचे हर पड़ाव का गतिविधि प्रकार अलग हो सकता है।'],
 optional:['اختياري','Optional','Facultatif','可选','वैकल्पिक'],
 emptyTitle:['ابدأ برنامج رحلتك','Start your itinerary','Commencez votre programme','开始规划行程','अपना यात्रा कार्यक्रम शुरू करें'],
 datesLater:['يمكن إضافة التواريخ لاحقاً','Dates can be added later','Dates à ajouter plus tard','可稍后填写日期','तिथियाँ बाद में जोड़ सकते हैं'],
 dayOptions:['خيارات اليوم','Day options','Options du jour','当日选项','दिन के विकल्प'],
 emptyDay:['لا توجد أنشطة بعد. أضف محطتك الأولى لهذا اليوم.','No activities yet. Add your first stop for this day.','Aucune activité. Ajoutez votre première étape du jour.','尚无活动，请添加当天的第一个停留点。','अभी कोई गतिविधि नहीं है। इस दिन का पहला पड़ाव जोड़ें।'],
 flexible:['وقت مرن','Flexible','Libre','时间灵活','समय तय नहीं'],minutes:['دقيقة','min','min','分钟','मिनट'],
 newActivity:['نشاط جديد','New activity','Nouvelle activité','新活动','नई गतिविधि'],
 completeDetails:['أكمل التفاصيل المطلوبة','Complete required details','Complétez les champs requis','请补全必填信息','आवश्यक विवरण भरें'],
 close:['طيّ','Close','Fermer','收起','बंद करें'],done:['تمّ التعديل','Done editing','Terminer','完成编辑','संपादन पूरा'],
 extraDetails:['التنقل والملاحظات','Transport and notes','Transport et notes','交通与备注','परिवहन और नोट्स'],added:['مُضافة','Added','Ajoutés','已添加','जोड़े गए'],
 planningNotes:['ملاحظات التخطيط والحدود','Planning notes and limits','Conseils de planification et limites','规划说明与限制','योजना संबंधी नोट्स और सीमाएँ'],
 nameRequired:['أدخل اسماً للنشاط أو المحطة.','Enter a name for this activity or stop.','Nommez cette activité ou étape.','请输入活动或停留点的名称。','इस गतिविधि या पड़ाव का नाम भरें।'],
 invalidDay:['أدخل رقم يوم صحيحاً من 1 إلى 3651.','Enter a whole day number from 1 to 3651.','Saisissez un numéro de jour entier entre 1 et 3651.','请输入1至3651之间的整数日序号。','1 से 3651 तक पूर्ण दिन क्रमांक भरें।'],
 invalidDuration:['أدخل عدداً صحيحاً من 0 إلى 10080 دقيقة.','Enter a whole number from 0 to 10080 minutes.','Saisissez un nombre entier de 0 à 10080 minutes.','请输入0至10080之间的整数分钟数。','0 से 10080 मिनट तक पूर्ण संख्या भरें।'],
};
export function itineraryText(locale:Locale,key:string){return translate(locale,itineraryWords[key]??[key,key,key,key,key]);}
