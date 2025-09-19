
import React, { useState, useMemo, useEffect } from 'react';
import { Project, Subproject } from '../../types/projects';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { useClickOutside } from '../../hooks/useClickOutside';

// --- Type Definitions ---
type Selection = { type: 'project' | 'subproject'; id: number };

interface TreeItem {
  id: string;
  name: string;
  type: 'project' | 'subproject';
  entityId: number;
  children: TreeItem[];
  parentId: string | null;
}

interface HierarchicalSelectProps {
  projects: Project[];
  subprojects: Subproject[];
  value: Selection | null;
  onChange: (selection: Selection | null) => void;
  placeholder: string;
}

// --- Helper Functions ---
const buildTreeAndMap = (projects: Project[], subprojects: Subproject[]): { tree: TreeItem[], map: Map<string, TreeItem> } => {
  const allNodes: TreeItem[] = [];
  const nodeMap = new Map<string, TreeItem>();

  projects.forEach(p => {
    const node: TreeItem = {
      id: `project-${p.project_id}`,
      name: p.name,
      type: 'project',
      entityId: p.project_id,
      children: [],
      parentId: null
    };
    allNodes.push(node);
    nodeMap.set(node.id, node);
  });

  subprojects.forEach(sp => {
    const node: TreeItem = {
      id: `subproject-${sp.subproject_id}`,
      name: sp.name,
      type: 'subproject',
      entityId: sp.subproject_id,
      children: [],
      parentId: sp.parent_subproject_id
        ? `subproject-${sp.parent_subproject_id}`
        : sp.project_id ? `project-${sp.project_id}` : null
    };
    allNodes.push(node);
    nodeMap.set(node.id, node);
  });
  
  const tree: TreeItem[] = [];
  allNodes.forEach(node => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return { tree, map: nodeMap };
};


// --- Sub-Components ---
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M3.22 5.72a.75.75 0 0 1 1.06 0L8 9.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 6.78a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

interface TreeNodeProps {
  node: TreeItem;
  level: number;
  onSelect: (selection: Selection) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedId: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onSelect, expandedIds, onToggleExpand, selectedId }) => {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
        style={{ paddingLeft: `${level * 1.25}rem` }}
      >
        {node.children.length > 0 ? (
          <button type="button" onClick={() => onToggleExpand(node.id)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </button>
        ) : (
          <div className="w-6" /> // Placeholder for alignment
        )}
        <div
          className="flex-1 py-2 px-1 text-sm"
          onClick={() => onSelect({ type: node.type, id: node.entityId })}
        >
          {node.name}
        </div>
      </div>
      {isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main Component ---
export const HierarchicalSelect = ({ projects, subprojects, value, onChange, placeholder }: HierarchicalSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const { tree, map: nodeMap } = useMemo(() => buildTreeAndMap(projects, subprojects), [projects, subprojects]);

  const selectedId = value ? `${value.type}-${value.id}` : null;
  const selectedItemLabel = useMemo(() => {
    return selectedId ? nodeMap.get(selectedId)?.name : null;
  }, [selectedId, nodeMap]);

  const filteredTree = useMemo(() => {
    if (!searchTerm) return tree;
    
    const term = searchTerm.toLowerCase();
    const visibleIds = new Set<string>();

    const checkNode = (node: TreeItem) => {
      let isVisible = node.name.toLowerCase().includes(term);
      node.children.forEach(child => {
        if (checkNode(child)) {
          isVisible = true;
        }
      });
      if (isVisible) {
        visibleIds.add(node.id);
      }
      return isVisible;
    };
    tree.forEach(checkNode);

    const filterTree = (nodes: TreeItem[]): TreeItem[] => {
        return nodes.filter(node => visibleIds.has(node.id)).map(node => ({
            ...node,
            children: filterTree(node.children)
        }));
    };

    return filterTree(tree);

  }, [tree, searchTerm]);
  
  useEffect(() => {
      if(searchTerm) {
          const newExpanded = new Set<string>();
          const expandParents = (node: TreeItem) => {
              if (node.children.length > 0) {
                  const hasVisibleChildren = node.children.some(child => filteredTree.some(n => n.id === child.id || n.children.length > 0));
                  if(hasVisibleChildren) {
                      newExpanded.add(node.id);
                      node.children.forEach(expandParents);
                  }
              }
          };
          filteredTree.forEach(expandParents);
          setExpandedIds(newExpanded);
      } else {
          setExpandedIds(new Set());
      }
  }, [searchTerm, filteredTree]);

  const handleSelect = (selection: Selection) => {
    onChange(selection);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };
  
  const handleToggleExpand = (id: string) => {
      setExpandedIds(prev => {
          const newSet = new Set(prev);
          if(newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex h-12 sm:h-10 items-center justify-between rounded-md border border-gray-300 bg-transparent px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:placeholder:text-gray-400 dark:ring-offset-gray-900"
      >
        <span className={`truncate flex-1 ${selectedItemLabel ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {selectedItemLabel || placeholder}
        </span>
        <div className="flex items-center gap-2">
            {selectedItemLabel && (
                <span 
                  onClick={handleClear} 
                  className="mr-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
                  aria-label="Clear selection"
                  tabIndex={0}
                  role="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 sm:w-4 sm:h-4">
                    <path d="M2.22 2.22a.75.75 0 0 1 1.06 0L8 6.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L9.06 8l4.72 4.72a.75.75 0 1 1-1.06 1.06L8 9.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L6.94 8 2.22 3.28a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </span>
            )}
            <span className="flex items-center">
              <ChevronDownIcon />
            </span>
        </div>
      </button>

    {isOpen && (
  <div className="w-full rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg p-2 sm:p-2 max-h-[40vh] sm:max-h-[320px] overflow-y-auto">
          <Input
            placeholder="Пошук..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="mb-2 text-base sm:text-sm px-4 sm:px-2 py-3 sm:py-2"
            autoFocus
          />
          <div className="w-full">
            {filteredTree.length > 0 ? filteredTree.map(node => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                onSelect={handleSelect}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                selectedId={selectedId}
              />
            )) : (
              <div className="text-center text-base sm:text-sm text-gray-500 py-2">Не знайдено</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
