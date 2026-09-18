/** Bluetooth SIG Heart Rate Service 1.0, Heart Rate Measurement flags. */
export type HeartMeasurement = { kind: 'reading'; bpm: number; contact: 'detected' | 'unsupported' } | { kind: 'no-contact' | 'invalid' };
export function parseHeartRate(value: DataView): HeartMeasurement {
  if (value.byteLength < 2) return { kind: 'invalid' };
  const flags = value.getUint8(0);
  if ((flags & 1) && value.byteLength < 3) return { kind: 'invalid' };
  if ((flags & 4) && !(flags & 2)) return { kind: 'no-contact' };
  const bpm = flags & 1 ? value.getUint16(1, true) : value.getUint8(1);
  if (bpm <= 0 || bpm > 300) return { kind: 'invalid' };
  return { kind: 'reading', bpm, contact: flags & 4 ? 'detected' : 'unsupported' };
}
export const STALE_AFTER_MS = 15_000;
export interface AlertLimits { low: number; high: number; durationMs: number }
export interface AlertState { outsideSince: number | null; lastReadingAt: number | null; lastAlertAt: number | null }
export const emptyAlertState = (): AlertState => ({ outsideSince: null, lastReadingAt: null, lastAlertAt: null });
export function resetContinuity(state: AlertState): AlertState { return { ...state, outsideSince: null, lastReadingAt: null }; }
export function checkHeartRate(state: AlertState, bpm: number, now: number, limits: AlertLimits | null): { state: AlertState; alert: boolean } {
  const continuous = state.lastReadingAt !== null && now >= state.lastReadingAt && now - state.lastReadingAt <= STALE_AFTER_MS;
  const outside = !!limits && (bpm < limits.low || bpm > limits.high);
  const outsideSince = outside ? continuous && state.outsideSince !== null ? state.outsideSince : now : null;
  const alert = outsideSince !== null && !!limits && now - outsideSince >= limits.durationMs && (state.lastAlertAt === null || now - state.lastAlertAt >= 60_000);
  return { state: { outsideSince, lastReadingAt: now, lastAlertAt: alert ? now : state.lastAlertAt }, alert };
}
export interface HeartCharacteristic extends EventTarget { value?: DataView; startNotifications(): Promise<HeartCharacteristic>; stopNotifications(): Promise<HeartCharacteristic> }
export interface HeartService { getCharacteristic(name: string): Promise<HeartCharacteristic> }
export interface HeartServer { connected: boolean; connect(): Promise<HeartServer>; disconnect(): void; getPrimaryService(name: string): Promise<HeartService> }
export interface HeartDevice extends EventTarget { name?: string; gatt?: HeartServer }
export interface HeartBluetooth { requestDevice(options: { filters: { services: string[] }[] }): Promise<HeartDevice> }
