'use client';
import {useState} from 'react';
import {Compass,ArrowUpLeft,Users} from 'lucide-react';
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {activeDestinations} from '@/lib/catalog-seed';
import {prepText} from '@/lib/preparation-copy';
import {releaseText,activityIds} from '@/lib/preparation-release-copy';
import './trip-launcher.css';
export function TripLauncher(){
 const {locale,tr}=useSite(),{catalog,loading}=useCatalog(),destinations=activeDestinations(catalog),[group,setGroup]=useState(2);
 return <section className="trip-launcher" aria-labelledby="trip-launcher-title"><div className="trip-launcher-intro"><Compass size={26} aria-hidden="true"/><div><h2 id="trip-launcher-title">{tr(['خطّط رحلتك بخطوة','Start planning your trip','Commencez à préparer votre voyage','开始规划旅程','यात्रा की योजना शुरू करें'])}</h2><p>{tr(['اختر الوجهة والنشاط وعدد المشاركين، ثم أكمل خطتك.','Choose a destination, an activity and your group, then build your plan.','Choisissez une destination, une activité et votre groupe, puis complétez votre plan.','选择目的地、活动和人数，再完善计划。','गंतव्य, गतिविधि और यात्रियों की संख्या चुनें, फिर योजना पूरी करें।'])}</p></div></div><form action="/trips" method="get"><label>{prepText(locale,'destination')}<select name="destination" required disabled={loading||!destinations.length}>{destinations.map(d=><option key={d.id} value={d.id}>{tr(d.names)}</option>)}</select></label><label>{releaseText(locale,'activity')}<select name="activity" defaultValue="walking">{activityIds.map(id=><option key={id} value={id}>{releaseText(locale,id)}</option>)}</select></label><label><span><Users size={15} aria-hidden="true"/>{prepText(locale,'group')}</span><input name="group" type="number" min={1} max={1000} step={1} required value={group||''} onChange={e=>setGroup(Number(e.target.value))}/></label><button className="primary-btn" type="submit" disabled={loading||!destinations.length}>{tr(['افتح مسودة الرحلة','Open trip draft','Ouvrir le brouillon','打开行程草稿','यात्रा का मसौदा खोलें'])}<ArrowUpLeft size={18} aria-hidden="true"/></button></form></section>
}
