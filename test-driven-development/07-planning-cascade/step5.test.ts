/**
 * TRUE TDD: Planning Cascade View
 * Step 5: Tree expansion and collapse
 * 
 * Discovering we need collapsible tree functionality
 */

import { describe, it, expect } from 'vitest';

describe('Step 5: Tree expansion state management', () => {
  it('should track expansion state of nodes', () => {
    // Discovering we need expansion state
    interface TreeState {
      expanded: Set<string>;
    }

    const state: TreeState = {
      expanded: new Set(['term-1', 'unit-1'])
    };

    expect(state.expanded.has('term-1')).toBe(true);
    expect(state.expanded.has('unit-1')).toBe(true);
    expect(state.expanded.has('unit-2')).toBe(false);
  });

  it('should toggle node expansion', () => {
    class TreeExpansionManager {
      private expanded = new Set<string>();

      toggle(nodeId: string): void {
        if (this.expanded.has(nodeId)) {
          this.expanded.delete(nodeId);
        } else {
          this.expanded.add(nodeId);
        }
      }

      isExpanded(nodeId: string): boolean {
        return this.expanded.has(nodeId);
      }

      expandAll(): void {
        // Would normally take all node IDs
        this.expanded.add('term-1');
        this.expanded.add('unit-1');
        this.expanded.add('unit-2');
      }

      collapseAll(): void {
        this.expanded.clear();
      }
    }

    const manager = new TreeExpansionManager();
    
    expect(manager.isExpanded('unit-1')).toBe(false);
    
    manager.toggle('unit-1');
    expect(manager.isExpanded('unit-1')).toBe(true);
    
    manager.toggle('unit-1');
    expect(manager.isExpanded('unit-1')).toBe(false);
    
    manager.expandAll();
    expect(manager.isExpanded('term-1')).toBe(true);
    expect(manager.isExpanded('unit-1')).toBe(true);
    
    manager.collapseAll();
    expect(manager.isExpanded('term-1')).toBe(false);
  });

  it('should determine visible nodes based on expansion', () => {
    interface TreeNode {
      id: string;
      children?: TreeNode[];
    }

    function getVisibleNodes(
      root: TreeNode, 
      expanded: Set<string>
    ): string[] {
      const visible: string[] = [];

      function traverse(node: TreeNode, parentExpanded: boolean) {
        if (parentExpanded) {
          visible.push(node.id);
          
          if (node.children && expanded.has(node.id)) {
            node.children.forEach(child => traverse(child, true));
          }
        }
      }

      traverse(root, true);
      return visible;
    }

    const tree: TreeNode = {
      id: 'root',
      children: [
        {
          id: 'term-1',
          children: [
            { id: 'unit-1', children: [{ id: 'lesson-1' }, { id: 'lesson-2' }] },
            { id: 'unit-2', children: [{ id: 'lesson-3' }] }
          ]
        }
      ]
    };

    // Only root expanded
    let expanded = new Set<string>(['root']);
    let visible = getVisibleNodes(tree, expanded);
    expect(visible).toEqual(['root', 'term-1']);

    // Root and term-1 expanded
    expanded = new Set(['root', 'term-1']);
    visible = getVisibleNodes(tree, expanded);
    expect(visible).toEqual(['root', 'term-1', 'unit-1', 'unit-2']);

    // Everything expanded
    expanded = new Set(['root', 'term-1', 'unit-1', 'unit-2']);
    visible = getVisibleNodes(tree, expanded);
    expect(visible).toEqual([
      'root', 'term-1', 'unit-1', 'lesson-1', 'lesson-2', 'unit-2', 'lesson-3'
    ]);
  });
});