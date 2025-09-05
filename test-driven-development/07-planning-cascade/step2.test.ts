/**
 * TRUE TDD: Planning Cascade View
 * Step 2: Tree structure representation
 * 
 * Discovering we need a tree data structure for navigation
 */

import { describe, it, expect } from 'vitest';

describe('Step 2: Tree structure for planning', () => {
  it('should create a tree node', () => {
    // Discovering we need tree nodes
    interface TreeNode {
      id: string;
      type: 'term' | 'unit' | 'lesson';
      title: string;
      children?: TreeNode[];
    }

    const node: TreeNode = {
      id: 'term-1',
      type: 'term',
      title: 'Term 1 (Sept-Nov)',
      children: []
    };

    expect(node.id).toBe('term-1');
    expect(node.type).toBe('term');
    expect(node.title).toBe('Term 1 (Sept-Nov)');
    expect(node.children).toEqual([]);
  });

  it('should build a nested tree structure', () => {
    interface TreeNode {
      id: string;
      type: 'term' | 'unit' | 'lesson';
      title: string;
      children?: TreeNode[];
    }

    const tree: TreeNode = {
      id: 'term-1',
      type: 'term',
      title: 'Term 1',
      children: [
        {
          id: 'unit-1',
          type: 'unit',
          title: 'Our Senses',
          children: [
            {
              id: 'lesson-1',
              type: 'lesson',
              title: 'Five Senses Exploration'
            },
            {
              id: 'lesson-2',
              type: 'lesson',
              title: 'Touch and Texture'
            }
          ]
        },
        {
          id: 'unit-2',
          type: 'unit',
          title: 'Patterns',
          children: [
            {
              id: 'lesson-3',
              type: 'lesson',
              title: 'AB Patterns'
            }
          ]
        }
      ]
    };

    expect(tree.children).toHaveLength(2);
    expect(tree.children![0].title).toBe('Our Senses');
    expect(tree.children![0].children).toHaveLength(2);
    expect(tree.children![1].title).toBe('Patterns');
  });

  it('should navigate to a specific node by path', () => {
    interface TreeNode {
      id: string;
      type: string;
      title: string;
      children?: TreeNode[];
    }

    function findNodeByPath(root: TreeNode, path: string[]): TreeNode | null {
      let current: TreeNode | undefined = root;
      
      for (const id of path) {
        if (current?.id === id) {
          continue;
        }
        current = current?.children?.find(child => child.id === id);
        if (!current) {
          return null;
        }
      }
      
      return current || null;
    }

    const tree: TreeNode = {
      id: 'root',
      type: 'root',
      title: 'Year Plan',
      children: [
        {
          id: 'term-1',
          type: 'term',
          title: 'Term 1',
          children: [
            {
              id: 'unit-1',
              type: 'unit',
              title: 'Our Senses',
              children: [
                {
                  id: 'lesson-1',
                  type: 'lesson',
                  title: 'Five Senses'
                }
              ]
            }
          ]
        }
      ]
    };

    const found = findNodeByPath(tree, ['root', 'term-1', 'unit-1', 'lesson-1']);
    expect(found).not.toBeNull();
    expect(found?.title).toBe('Five Senses');
    
    const notFound = findNodeByPath(tree, ['root', 'term-2']);
    expect(notFound).toBeNull();
  });
});