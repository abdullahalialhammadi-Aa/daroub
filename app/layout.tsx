import type { Metadata } from "next";
import "./globals.css";
import {SiteShell} from '@/components/site-shell';
import {CatalogProvider} from '@/lib/catalog-client';
export const metadata: Metadata={title:"دروب | دليلك إلى كل تضاريس",description:"استكشف الصحاري والجبال والغابات والسواحل، واستعد لرحلتك مع دليل دروب التفاعلي بخمس لغات.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body><CatalogProvider><SiteShell>{children}</SiteShell></CatalogProvider></body></html>}
