import { lazy, Suspense } from 'react'
import TabSkeleton from './tabs/TabSkeleton'

const PowerEngineTab = lazy(() => import('./tabs/PowerEngineTab'))
const EntityDatabaseTab = lazy(() => import('./tabs/EntityDatabaseTab'))
const FactionsTab = lazy(() => import('./tabs/FactionsTab'))
const CoreLawsTab = lazy(() => import('./tabs/CoreLawsTab'))

const TABS = [PowerEngineTab, EntityDatabaseTab, FactionsTab, CoreLawsTab]

export default function TabContent({ activeTab, data, isSystemMode, theme, revealStep, isRevealing }) {
  const TabPanel = TABS[activeTab]
  if (!TabPanel) return null

  return (
    <Suspense fallback={<TabSkeleton />}>
      <TabPanel data={data} isSystemMode={isSystemMode} theme={theme} revealStep={revealStep} isRevealing={isRevealing} />
    </Suspense>
  )
}
