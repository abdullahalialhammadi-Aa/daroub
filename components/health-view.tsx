"use client";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Watch, HeartPulse, Bluetooth, ShieldCheck, Bell, TriangleAlert } from 'lucide-react';
import { useSite } from './site-shell';
import { companionText, companionWords } from '@/lib/companion-i18n';
import { parseHeartRate, checkHeartRate, emptyAlertState, resetContinuity, STALE_AFTER_MS, type AlertLimits, type HeartBluetooth, type HeartDevice, type HeartCharacteristic } from '@/lib/health-monitor';
import './companion.css';

export function HealthView() {
  const { t, locale } = useSite(); const c = (key: string) => companionText(locale, key); const label = (key: string) => companionWords[key] ? c(key) : t(key);
  const [deviceName, setDeviceName] = useState(''), [previousName, setPreviousName] = useState(''), [bpm, setBpm] = useState<number | null>(null), [last, setLast] = useState(0), [now, setNow] = useState(Date.now);
  const [status, setStatus] = useState(''), [readingState, setReadingState] = useState('noReading'), [busy, setBusy] = useState(false), [supported, setSupported] = useState<boolean | null>(null);
  const [lower, setLower] = useState(''), [upper, setUpper] = useState(''), [duration, setDuration] = useState('15'), [enabled, setEnabled] = useState(false), [alert, setAlert] = useState('');
  const [notifications, setNotifications] = useState(false), [notificationStatus, setNotificationStatus] = useState('notificationsOff');
  const selected = useRef<HeartDevice | null>(null), characteristic = useRef<HeartCharacteristic | null>(null), dataHandler = useRef<EventListener | null>(null), disconnectHandler = useRef<EventListener | null>(null);
  const threshold = useRef<AlertLimits | null>(null), monitor = useRef(emptyAlertState()), mounted = useRef(true), generation = useRef(0), notifyRef = useRef<(test?: boolean) => void>(() => {}), notificationsRef = useRef(false), openNotification = useRef<Notification | null>(null);
  function notify(test = false) {
    setAlert(test ? 'testOnly' : 'alertBody');
    if (notificationsRef.current && 'Notification' in window && Notification.permission === 'granted') {
      try { openNotification.current?.close(); openNotification.current = new Notification(t('health'), { body: t(test ? 'testOnly' : 'alertBody'), tag: 'daroub-health' }); }
      catch { setNotificationStatus('notificationsDenied'); }
    }
  }
  useEffect(() => { notifyRef.current = notify; });
  function detach() {
    if (characteristic.current && dataHandler.current) characteristic.current.removeEventListener('characteristicvaluechanged', dataHandler.current);
    if (selected.current && disconnectHandler.current) selected.current.removeEventListener('gattserverdisconnected', disconnectHandler.current);
    if (characteristic.current && selected.current?.gatt?.connected) void characteristic.current.stopNotifications().catch(() => {});
    characteristic.current = null; dataHandler.current = null; disconnectHandler.current = null;
  }
  function clearReading(state = 'noReading') { monitor.current = emptyAlertState(); setBpm(null); setLast(0); setReadingState(state); }
  function disconnect() { generation.current++; detach(); selected.current?.gatt?.disconnect(); setDeviceName(''); clearReading(); setStatus('notConnected'); setAlert(''); }
  useEffect(() => {
    mounted.current = true;
    // Web Bluetooth and secure-context capability can only be inspected after browser hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(window.isSecureContext && !!(navigator as Navigator & { bluetooth?: HeartBluetooth }).bluetooth);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    const visibility = () => { monitor.current = resetContinuity(monitor.current); setBpm(null); setLast(0); setReadingState('hiddenPause'); };
    document.addEventListener('visibilitychange', visibility);
    // Invalidate the latest connection attempt at cleanup, rather than its mount-time generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { mounted.current = false; generation.current++; clearInterval(timer); document.removeEventListener('visibilitychange', visibility); detach(); selected.current?.gatt?.disconnect(); openNotification.current?.close(); };
  }, []);
  const stale = last > 0 && now - last > STALE_AFTER_MS;
  useEffect(() => { if (stale) monitor.current = resetContinuity(monitor.current); }, [stale]);
  async function connect(reconnect = false) {
    if (busy) return; const bluetooth = (navigator as Navigator & { bluetooth?: HeartBluetooth }).bluetooth;
    if (!bluetooth || !window.isSecureContext) { setStatus('unsupported'); return; }
    const attempt = ++generation.current; setBusy(true); setStatus(''); detach(); selected.current?.gatt?.disconnect(); setDeviceName(''); clearReading(); setAlert('');
    let candidate: HeartDevice | null = null;
    try {
      candidate = reconnect && selected.current ? selected.current : await bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
      if (!mounted.current || attempt !== generation.current) return;
      selected.current = candidate; setPreviousName(candidate.name || 'Bluetooth HR');
      if (!candidate.gatt) throw Error('No GATT');
      const server = await candidate.gatt.connect();
      if (!mounted.current || attempt !== generation.current) { candidate.gatt.disconnect(); return; }
      const service = await server.getPrimaryService('heart_rate'); const ch = await service.getCharacteristic('heart_rate_measurement');
      if (!mounted.current || attempt !== generation.current) { candidate.gatt.disconnect(); return; }
      characteristic.current = ch;
      disconnectHandler.current = () => { if (!mounted.current || attempt !== generation.current) return; generation.current++; detach(); setBusy(false); setDeviceName(''); clearReading('stale'); setStatus('connectHelp'); setAlert(''); };
      candidate.addEventListener('gattserverdisconnected', disconnectHandler.current);
      dataHandler.current = () => {
        if (!mounted.current || attempt !== generation.current || document.visibilityState !== 'visible') return;
        const reading = ch.value ? parseHeartRate(ch.value) : { kind: 'invalid' as const };
        if (reading.kind !== 'reading') { monitor.current = resetContinuity(monitor.current); setBpm(null); setLast(0); setReadingState(reading.kind === 'no-contact' ? 'lowContact' : 'invalidReading'); return; }
        const time = Date.now(); setBpm(reading.bpm); setLast(time); setNow(time); setReadingState('');
        const result = checkHeartRate(monitor.current, reading.bpm, time, threshold.current); monitor.current = result.state;
        if (result.alert) notifyRef.current();
      };
      ch.addEventListener('characteristicvaluechanged', dataHandler.current); await ch.startNotifications();
      if (!mounted.current || attempt !== generation.current) { detach(); candidate.gatt.disconnect(); return; }
      setDeviceName(candidate.name || 'Bluetooth HR'); setStatus('');
    } catch (error) {
      if (!mounted.current || attempt !== generation.current) return;
      detach(); candidate?.gatt?.disconnect(); setDeviceName(''); clearReading(); setStatus(error instanceof DOMException && error.name === 'NotFoundError' ? 'cancelled' : 'connectHelp');
    } finally { if (mounted.current && attempt === generation.current) setBusy(false); }
  }
  function disableAlerts() { threshold.current = null; monitor.current = emptyAlertState(); setEnabled(false); setAlert(''); }
  function alerts(event: FormEvent) {
    event.preventDefault(); const low = Number(lower), high = Number(upper), seconds = Number(duration);
    if (!lower || !upper || !Number.isFinite(low) || !Number.isFinite(high) || low < 20 || high > 250 || low >= high) { setStatus('invalidLimits'); return; }
    if (!Number.isInteger(seconds) || seconds < 5 || seconds > 120) { setStatus('invalidDuration'); return; }
    threshold.current = { low, high, durationMs: seconds * 1000 }; monitor.current = emptyAlertState(); setEnabled(true); setStatus('alertEnabled');
  }
  async function toggleNotifications() {
    if (notificationsRef.current) { notificationsRef.current = false; setNotifications(false); setNotificationStatus('notificationsOff'); openNotification.current?.close(); return; }
    if (!('Notification' in window)) { setNotificationStatus('notificationsDenied'); return; }
    try { const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission; const allowed = permission === 'granted'; notificationsRef.current = allowed; setNotifications(allowed); setNotificationStatus(allowed ? 'notificationsOn' : 'notificationsDenied'); }
    catch { setNotificationStatus('notificationsDenied'); }
  }
  return <main id="main" className="page inner-page"><div className="view-heading"><div><span className="eyebrow">DAROUB / {t('health')}</span><h1>{t('health')}</h1><p>{t('wellDesc')}</p></div><span className="status-badge"><Bluetooth size={16} aria-hidden/>{t(deviceName ? 'connected' : 'notConnected')}</span></div>
    <div className="health-grid"><section className="panel vitals-panel"><HeartPulse size={37} aria-hidden/><h2>{t('heartRate')}</h2><div className="heart-value" dir="ltr">{stale ? '—' : bpm ?? '—'}<small>{t('bpm')}</small></div><p role="status">{stale ? t('stale') : readingState ? label(readingState) : deviceName}</p>{last > 0 && !stale && <time dateTime={new Date(last).toISOString()}>{new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(last))}</time>}
      <div className="companion-buttons"><button className="primary-btn" disabled={busy || supported === false} onClick={deviceName ? disconnect : () => connect(false)}><Bluetooth size={19} aria-hidden/>{busy ? t('load') : t(deviceName ? 'disconnect' : 'connect')}</button>{!deviceName && previousName && <button className="outline-btn" disabled={busy || supported === false} onClick={() => connect(true)}>{c('reconnect')} · <bdi>{previousName}</bdi></button>}</div>{supported === false && <p className="status-message" role="status">{c('unsupported')}</p>}<p className="subtle">{t('bleNote')}</p><p className="subtle">{c('background')}</p><a className="source-link" href="https://developer.chrome.com/docs/capabilities/bluetooth" target="_blank" rel="noreferrer">Web Bluetooth <span aria-hidden>↗</span></a>
    </section><section className="panel"><div className="panel-title"><Bell aria-hidden/><h2>{t('alerts')}</h2></div><p className="subtle">{c('alertHelp')}</p><form onSubmit={alerts}><div className="limits"><label>{t('lowerLimit')}<input type="number" min="20" max="249" value={lower} onChange={event => { setLower(event.target.value); disableAlerts(); }} required/></label><label>{t('upperLimit')}<input type="number" min="21" max="250" value={upper} onChange={event => { setUpper(event.target.value); disableAlerts(); }} required/></label><label>{c('duration')}<input type="number" min="5" max="120" step="1" value={duration} onChange={event => { setDuration(event.target.value); disableAlerts(); }} required aria-describedby="alert-duration-note"/></label></div><p id="alert-duration-note" className="subtle">{c('durationNote')}</p><div className="companion-buttons"><button className="primary-btn" type="submit">{t('enableAlerts')}{enabled ? ' ✓' : ''}</button>{enabled && <button className="outline-btn" type="button" onClick={() => { disableAlerts(); setStatus('alertsOff'); }}>{c('disableAlerts')}</button>}<button className="outline-btn" type="button" onClick={() => notify(true)}>{t('testAlert')}</button></div></form>
      <div className="companion-notifications"><h3>{c('notifications')}</h3><p className="subtle" role="status">{c(notificationStatus)}</p><button className="outline-btn" onClick={toggleNotifications}>{c(notifications ? 'disableNotifications' : 'enableNotifications')}</button></div>{status && <p className="status-message" role="status">{label(status)}</p>}{alert && <div className="health-alert" role="alert"><TriangleAlert aria-hidden/><div><p>{t(alert)}</p><button className="outline-btn" onClick={() => { setAlert(''); openNotification.current?.close(); }}>{c('dismiss')}</button></div></div>}
    </section></div><div className="platforms">{['Apple Watch · HealthKit', 'Samsung / Wear OS · Health Connect'].map(name => <details className="panel" key={name}><summary><Watch aria-hidden/><span lang="en">{name}</span></summary><p>{t('nativeNote')}</p><a className="source-link" href={name.startsWith('Apple') ? 'https://developer.apple.com/documentation/healthkit' : 'https://developer.android.com/health-and-fitness/health-services'} target="_blank" rel="noreferrer">{t('sources')} <span aria-hidden>↗</span></a></details>)}</div><div className="medical-note"><ShieldCheck aria-hidden/><p>{t('medicalNote')}</p></div></main>;
}
