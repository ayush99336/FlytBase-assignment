import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, uiActions } from '@/lib/store';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  onChange?: (tabId: string) => void;
}

export function TabNavigation({ tabs, onChange }: TabNavigationProps) {
  const activeTab = useSelector((state: RootState) => state.ui.activeTab);
  const dispatch = useDispatch();

  const handleTabClick = (tabId: string) => {
    dispatch(uiActions.setActiveTab(tabId));
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div className="bg-white border-b border-neutral-300">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-4 py-3 font-medium border-b-2 transition",
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-neutral-600 hover:text-primary border-transparent hover:border-primary"
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TabNavigation;
