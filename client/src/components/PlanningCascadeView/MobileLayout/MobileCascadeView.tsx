import React, { useState } from 'react';
import { ArrowLeft, Menu, Search, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { useCascadeStore } from '../../../stores/cascadeStore';
import { VirtualizedTree } from '../VirtualizedTree/VirtualizedTree';
import { CascadeDetailPanel } from '../CascadeDetailPanel';
import { FilterBar } from '../FilterBar';
import { CascadeSearch } from '../CascadeSearch/CascadeSearch';
import { CascadeProgressIndicator } from '../CascadeProgressIndicator';
import { SwipeableViews } from './SwipeableViews';
import { BottomSheet } from './BottomSheet';
import type { PlanningCascadeData } from '../../../hooks/usePlanningCascade';
import type { CascadeSelection } from '../types';

interface MobileCascadeViewProps {
  data: PlanningCascadeData;
  onNodeSelect: (selection: CascadeSelection) => void;
  onNodeExpand: (nodeId: string) => void;
  onNodeCollapse: (nodeId: string) => void;
  onFilterChange: (filters: any) => void;
}

type ViewMode = 'tree' | 'detail' | 'filters';

export const MobileCascadeView: React.FC<MobileCascadeViewProps> = ({
  data,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  onFilterChange,
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>('tree');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const selectedNode = useCascadeStore((state) => state.selectedNode);
  const filters = useCascadeStore((state) => state.filters);
  
  // Transform data for tree
  const transformToTreeData = (cascadeData: PlanningCascadeData) => {
    // Implementation would transform cascade data to tree format
    // This is a simplified version
    return [];
  };
  
  const treeData = transformToTreeData(data);
  
  const handleNodeSelect = (node: any) => {
    onNodeSelect({
      type: node.type,
      id: node.id,
      data: node.data,
    });
    setCurrentView('detail');
  };
  
  const handleBack = () => {
    if (currentView === 'detail') {
      setCurrentView('tree');
    }
  };
  
  const renderHeader = () => {
    const title = currentView === 'tree' ? 'Planning Cascade' : 
                  currentView === 'detail' ? 'Details' : 'Filters';
    
    return (
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {currentView !== 'tree' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Filters"
            >
              <Filter className="h-5 w-5" />
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {data.metrics && currentView === 'tree' && (
          <div className="px-4 pb-3 overflow-x-auto">
            <CascadeProgressIndicator metrics={data.metrics} />
          </div>
        )}
      </header>
    );
  };
  
  const renderContent = () => {
    switch (currentView) {
      case 'tree':
        return (
          <div className="flex-1 overflow-hidden">
            <VirtualizedTree
              data={treeData}
              onNodeSelect={handleNodeSelect}
              onNodeExpand={onNodeExpand}
              onNodeCollapse={onNodeCollapse}
              className="h-full"
            />
          </div>
        );
        
      case 'detail':
        return selectedNode ? (
          <div className="flex-1 overflow-y-auto">
            <CascadeDetailPanel selection={selectedNode} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-500">No item selected</p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {renderHeader()}
      
      {/* Main content with swipeable views */}
      <SwipeableViews
        index={currentView === 'tree' ? 0 : 1}
        onChangeIndex={(index) => setCurrentView(index === 0 ? 'tree' : 'detail')}
        className="flex-1"
      >
        <div className="h-full">
          <VirtualizedTree
            data={treeData}
            onNodeSelect={handleNodeSelect}
            onNodeExpand={onNodeExpand}
            onNodeCollapse={onNodeCollapse}
            className="h-full"
          />
        </div>
        
        <div className="h-full">
          {selectedNode ? (
            <CascadeDetailPanel selection={selectedNode} />
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-gray-500">Swipe left to select an item</p>
            </div>
          )}
        </div>
      </SwipeableViews>
      
      {/* Filter bottom sheet */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filters"
      >
        <div className="p-4">
          <FilterBar
            filters={filters}
            onFilterChange={(newFilters) => {
              onFilterChange(newFilters);
              setIsFilterOpen(false);
            }}
          />
        </div>
      </BottomSheet>
      
      {/* Search modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <CascadeSearch
            data={treeData}
            onResultSelect={(node) => {
              handleNodeSelect(node);
              setIsSearchOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

MobileCascadeView.displayName = 'MobileCascadeView';