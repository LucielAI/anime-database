import PowerEngineTab from './tabs/PowerEngineTab'
import EntityDatabaseTab from './tabs/EntityDatabaseTab'
import FactionsTab from './tabs/FactionsTab'
import CoreLawsTab from './tabs/CoreLawsTab'

const TABS = [PowerEngineTab, EntityDatabaseTab, FactionsTab, CoreLawsTab]

export default function TabContent({ activeTab, data, isSystemMode, theme, revealStep, isRevealing }) {
  const TabPanel = TABS[activeTab]
  if (!TabPanel) return null
  return <TabPanel data={data} isSystemMode={isSystemMode} theme={theme} revealStep={revealStep} isRevealing={isRevealing} />
}
