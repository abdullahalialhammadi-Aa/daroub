"use client";
import {useSite} from './site-shell';
import {useCatalog} from '@/lib/catalog-client';
import {CatalogNotice} from './catalog-notice';
import {catalogText} from '@/lib/catalog-copy';
export function SourcesView(){const{t,locale}=useSite(),{catalog}=useCatalog();return <main id="main" className="page inner-page"><div className="view-heading"><h1>{t('sources')}</h1></div><CatalogNotice/><p className="subtle">{catalogText(locale,'referencesNote')}</p><div className="sources-list">{catalog.sources.map(source=><a key={source.id} className="panel" href={source.url} target="_blank" rel="noreferrer">{source.title} ↗<small>{catalogText(locale,'reviewDate')}: {source.reviewedAt}</small></a>)}</div><p>{t('accessNote')}</p><a className="source-link" href="/editor">{catalogText(locale,'editor')}</a></main>}
