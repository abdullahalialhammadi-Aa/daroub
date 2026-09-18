"""Create dated, self-contained fieldbook PDFs from an exported Daroub catalog.

Run export-fieldbook-data.mjs first. Requires reportlab, uharfbuzz,
arabic-reshaper and python-bidi. DAROUB_FONT_DIR may override Windows fonts.
Books contain Daroub's source-linked summaries, not copied third-party books.
"""
import json, os, re, sys
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
import arabic_reshaper
from bidi.algorithm import get_display

ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'work/fieldbook-data.json').read_text(encoding='utf-8'))
CAT=DATA['catalog']; LOCALES=DATA['locales']; WORDS=DATA['words']
DATE='2026-09-17'; OUT=ROOT/'public/fieldbooks'; OUT.mkdir(parents=True,exist_ok=True)
FONT=Path(os.environ.get('DAROUB_FONT_DIR','C:/Windows/Fonts'))
for name,file in [('Body','arial.ttf'),('Strong','arialbd.ttf'),('Hindi','Nirmala.ttc'),('Chinese','msyh.ttc')]:
    pdfmetrics.registerFont(TTFont(name,str(FONT/file),shapable=name=='Hindi'))
WIDTH=A4[0]-114
COPY={
 'edition':['دليل ميداني مختصر','A compact field guide','Un guide de terrain pratique','实用旅行手册','संक्षिप्त क्षेत्र गाइड'],
 'contents':['داخل هذا الكتاب','Inside this book','Dans ce guide','本书内容','इस पुस्तिका में'],
 'reference':['نسخة مرجعية بتاريخ','Reference edition dated','Édition de référence du','参考版本日期','संदर्भ संस्करण दिनांक'],
 'scope':['دليل دروب موجز مبني على المصادر المدرجة. الموقع تقريبي، وليس نقطة بداية مسار. تحقق من الطقس والإغلاقات محلياً قبل المغادرة.','A concise Daroub guide based on the listed sources. The location is approximate, not a trailhead. Check current weather and local closures before leaving.','Un guide Daroub fondé sur les sources citées. Le repère est approximatif, pas un départ de sentier. Vérifiez météo et fermetures avant de partir.','根据所列资料编写的 Daroub 简明指南。位置为大致区域，并非步道起点。出发前请核查天气和当地关闭信息。','सूचीबद्ध स्रोतों पर आधारित दरोब की संक्षिप्त पुस्तिका। स्थान अनुमानित है, पगडंडी का आरंभ नहीं। निकलने से पहले मौसम और स्थानीय बंदिशें जाँचें।'],
 'generic':['إرشادات لنوع التضاريس وليست تقريراً موثقاً لنقطة بعينها.','Terrain guidance, not a locally verified report for a specific point.','Conseils de terrain, sans vérification locale pour un point précis.','地形通用指南，并非针对特定坐标的当地核实报告。','भूभाग का सामान्य मार्गदर्शन, किसी खास बिंदु की स्थानीय सत्यापित रिपोर्ट नहीं।'],
 'check':['قبل أن تنطلق','Before you leave','Avant le départ','出发前','निकलने से पहले'],
 'checkbody':['حدد المسار ونقطة العودة، وتحقق من تصاريح الدخول والإغلاقات.\nراجع الطقس واحفظ خريطة يمكن فتحها دون إنترنت.\nراجع الملابس والماء والغذاء ووسيلة الاتصال مع رفقائك.\nاتفق على وقت العودة وخطة بديلة، وشاركهما مع شخص موثوق.','Choose your route and turn-back point; check entry permissions and closures.\nCheck the forecast and save an offline map.\nReview clothing, water, food and communication with your companions.\nAgree a return time and alternative plan, and share them with a trusted contact.','Choisissez le parcours et le point de retour ; vérifiez accès et fermetures.\nConsultez la météo et conservez une carte hors ligne.\nVérifiez vêtements, eau, nourriture et communication avec vos compagnons.\nConvenez d’une heure de retour et d’un plan de repli, partagés avec un proche.','确认路线、折返点、入场许可和关闭情况。\n查看天气预报并保存离线地图。\n与同伴核对衣物、饮水、食物和通信方式。\n约定返回时间和备用方案，并告知可信任的人。','रास्ता और वापसी का बिंदु तय करें; प्रवेश अनुमति और बंदिशें जाँचें।\nमौसम देखें और ऑफ़लाइन नक्शा सहेजें।\nसाथियों के साथ कपड़े, पानी, भोजन और संपर्क साधन जाँचें।\nवापसी का समय और वैकल्पिक योजना तय कर किसी भरोसेमंद व्यक्ति को बताएँ।'],
 'sources':['المراجع والقراءة الإضافية','Sources and further reading','Sources et lectures complémentaires','参考资料与延伸阅读','स्रोत और अतिरिक्त पठन'],
 'official':['دليل إضافي من الجهة الرسمية','Further guide from the official publisher','Guide complémentaire de l’organisme officiel','官方发布的延伸指南','आधिकारिक प्रकाशक का अतिरिक्त गाइड'],
 'local':['معلومات مرتبطة بمصادر المنطقة','Information linked to regional sources','Informations liées aux sources régionales','关联当地资料的信息','क्षेत्रीय स्रोतों से जुड़ी जानकारी'],
 'example':['مثال عام للتضاريس؛ لا يثبت وجوده عند إحداثيات محددة','Terrain example; not proof of presence at given coordinates','Exemple du milieu ; présence non prouvée à des coordonnées précises','地形示例；并不证明该物种在指定坐标存在','भूभाग का उदाहरण; दिए निर्देशांकों पर मौजूदगी का प्रमाण नहीं'],
}
def word(key,i): return COPY[key][i]
def visual(text): return get_display(arabic_reshaper.reshape(text))
def clean(text): return str(text).replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
def arabic_lines(text,font,size,width):
    lines=[]
    for raw in text.split('\n'):
        line=''
        for token in raw.split():
            trial=(line+' '+token).strip()
            if line and pdfmetrics.stringWidth(visual(trial),font,size)>width:
                lines.append(visual(line));line=token
            else: line=trial
        lines.append(visual(line))
    return '<br/>'.join(escape(line) for line in lines)

def source_title(text):
    """Keep the publication's original script readable in every edition locale."""
    text=clean(text)
    if re.search(r'[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]',text):
        return arabic_lines(text,'Body',9,WIDTH)
    return escape(text)

def make_book(d,locale):
    i=LOCALES.index(locale); ar=locale=='ar'; font='Hindi' if locale=='hi' else 'Chinese' if locale=='zh' else 'Body'
    bold=font if locale in ('hi','zh') else 'Strong'; ident=d['id']; title=d['names'][i]; generic=ident.startswith('terrain-')
    sections=d['sections']; species=d.get('species',[]); guidance=next(x for x in CAT['terrainGuidance'] if x['terrainId']==d['terrainId'])
    styles={}
    for name,size,color in [('body',11.5,'#203f43'),('small',9,'#466660'),('h1',29,'#173b40'),('h2',19,'#a4482a'),('h3',13,'#173b40')]:
        styles[name]=ParagraphStyle(name,fontName=bold if name.startswith('h') else font,fontSize=size,textColor=HexColor(color),leading=size*1.65,spaceAfter=10,alignment=TA_RIGHT if ar else TA_LEFT,shaping=locale=='hi',wordWrap='CJK' if locale=='zh' else None,keepWithNext=name.startswith('h'))
    def p(text,style='body',link=None):
        s=styles[style];text=clean(text)
        markup=arabic_lines(text,s.fontName,s.fontSize,WIDTH) if ar else escape(text).replace('\n','<br/>')
        if link: markup=f'<link href="{escape(link)}" color="#2e725d">{markup}</link>'
        return Paragraph(markup,s)
    used=[]
    def cite(ids):
        for source_id in ids:
            if source_id not in used:used.append(source_id)
        sources=[s for s in CAT['sources'] if s['id'] in ids]
        result=[]
        for source in sources:
            # Source titles and links retain their original script/direction.
            st=ParagraphStyle('source',parent=styles['small'],fontName='Body',alignment=TA_LEFT,shaping=False)
            result.append(Paragraph('<link href="'+escape(source['url'])+'" color="#2e725d">'+source_title(source['title'])+'</link>',st))
        return result
    path=OUT/f'{ident}-{locale}.pdf'
    document=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=50,leftMargin=50,topMargin=62,bottomMargin=55,title=title+' | Daroub',author='Daroub',subject=word('edition',i),pageCompression=1)
    elements=[Spacer(1,18),p('DAROUB','small'),p(title,'h1'),p(word('edition',i),'h2'),p(d['summary'][i]),Spacer(1,7),HRFlowable(width='100%',thickness=2,color=HexColor('#a4482a')),Spacer(1,16),p(word('reference',i)+' '+DATE,'small')]
    elements+=[p(word('generic' if generic else 'scope',i),'small')]
    if not generic:elements.append(p(f"{d['lat']:.3f}, {d['lon']:.3f} | {d.get('timezone','')}",'small'))
    elements.extend([Spacer(1,12),p(word('contents',i),'h3')])
    for n,section in enumerate(sections,1):elements.append(p(f'{n:02d}  '+section['title'][i],'small'))
    elements.append(PageBreak())
    for n,section in enumerate(sections,1):
        elements.extend([p(f'{n:02d}  '+section['title'][i],'h2'),p(section['body'][i])]);elements.extend(cite(section['sourceIds']));elements.append(Spacer(1,15))
    if species:
        elements.append(p(WORDS['nature'][i],'h2'))
        for animal in species:
            elements.extend([p(animal['name'][i],'h3'),p(word('local' if animal['coverage']=='local' else 'example',i),'small'),p(animal['description'][i]),p(animal['precaution'][i])]);elements.extend(cite(animal['sourceIds']));elements.append(Spacer(1,10))
    elements.extend([p(WORDS['group'][i],'h2'),p(guidance['group'][i]),p(word('check',i),'h2'),p(word('checkbody',i)),p(WORDS['examples'][i],'small')]);cite(d.get('sourceIds',[]))
    elements.extend([PageBreak(),p(word('sources',i),'h2')])
    for n,s in enumerate([s for s in CAT['sources'] if s['id'] in used],1):
        st=ParagraphStyle('reference',parent=styles['small'],fontName='Body',alignment=TA_LEFT,shaping=False,spaceAfter=14)
        elements.append(Paragraph(f"{n}. {source_title(s['title'])}<br/><link href=\"{escape(s['url'])}\" color=\"#2e725d\">{escape(s['url'])}</link><br/>{escape(s['reviewedAt'])}",st))
    refs_path=ROOT/'lib/official-region-books.json'
    if refs_path.exists():
        refs=json.loads(refs_path.read_text(encoding='utf-8'))
        ref=next((r for r in refs if r['destinationId']==ident),None)
        if ref:
            elements.extend([p(word('official',i),'h3'),Paragraph('<link href="'+escape(ref['url'])+'" color="#2e725d">'+source_title(ref['title'])+'</link>',ParagraphStyle('official',parent=styles['small'],fontName='Body',alignment=TA_LEFT,shaping=False))])
    elements.extend([Spacer(1,12),p(word('scope' if not generic else 'generic',i),'small'),p('daroub-terrain-guide.ifritliwa.chatgpt.site','small')])
    pages=[]
    def frame(canvas,doc):
        pages.append(doc.page);canvas.saveState();canvas.setFillColor(HexColor('#173b40'));canvas.rect(0,A4[1]-17,A4[0],17,fill=1,stroke=0)
        canvas.setFont('Strong',9);canvas.drawString(50,A4[1]-40,'DAROUB  /  FIELD GUIDE');canvas.setStrokeColor(HexColor('#cfdfd8'));canvas.line(50,43,A4[0]-50,43);canvas.setFillColor(HexColor('#466660'));canvas.setFont('Body',9);canvas.drawString(50,29,DATE);canvas.drawRightString(A4[0]-50,29,str(doc.page));canvas.restoreState()
    document.build(elements,onFirstPage=frame,onLaterPages=frame)
    return {'url':'/fieldbooks/'+path.name,'pages':max(pages),'publishedAt':DATE}

destinations=list(CAT['destinations'])
for terrain in DATA['terrains']:
    guide=next(x for x in CAT['terrainGuidance'] if x['terrainId']==terrain['id'])
    destinations.append({'id':'terrain-'+terrain['id'],'terrainId':terrain['id'],'names':terrain['names'],'summary':terrain['descriptions'],'sections':guide['sections'],'species':[]})
manifest={}
for d in destinations:
    manifest[d['id']]={}
    for locale in LOCALES:manifest[d['id']][locale]=make_book(d,locale)
(ROOT/'lib/fieldbook-pdfs.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'books':sum(len(v) for v in manifest.values()),'minPages':min(b['pages'] for v in manifest.values() for b in v.values()),'maxPages':max(b['pages'] for v in manifest.values() for b in v.values())}))
