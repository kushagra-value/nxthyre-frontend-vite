export interface SortableStage {
  id?: number;
  name: string;
  slug: string;
  sort_order: number;
}

export const getLNumber = (name: string): number | null => {
  const match = name.match(/\bL(\d+)\b/i);
  return match ? parseInt(match[1], 10) : null;
};

export const sortStages = <T extends SortableStage>(stagesList: T[]): T[] => {
  if (!stagesList || !Array.isArray(stagesList) || stagesList.length === 0) return [];
  
  let listCopy = [...stagesList];
  
  // 1. Identify all L-stages
  const lStages = listCopy.filter(s => getLNumber(s.name) !== null);
  
  if (lStages.length > 0) {
    // 2. Collect and sort their sort_orders
    const sortOrders = lStages.map(s => s.sort_order).sort((a, b) => a - b);
    
    // 3. Sort L-stages by their L-number
    const sortedLStages = [...lStages].sort((a, b) => {
      const lA = getLNumber(a.name)!;
      const lB = getLNumber(b.name)!;
      return lA - lB;
    });
    
    // 4. Map the sorted L-stages back to the sorted sort_orders
    const stageIdToNewSortOrder = new Map<any, number>();
    sortedLStages.forEach((stage, idx) => {
      const key = stage.id !== undefined ? stage.id : stage.slug;
      stageIdToNewSortOrder.set(key, sortOrders[idx]);
    });
    
    // 5. Update sort_order for L-stages in the list
    listCopy = listCopy.map(s => {
      const key = s.id !== undefined ? s.id : s.slug;
      if (stageIdToNewSortOrder.has(key)) {
        return {
          ...s,
          sort_order: stageIdToNewSortOrder.get(key)!
        };
      }
      return s;
    });
  }
  
  // 6. Sort the entire list
  return listCopy.sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    const lA = getLNumber(a.name);
    const lB = getLNumber(b.name);
    if (lA !== null && lB !== null) {
      return lA - lB;
    }
    return a.name.localeCompare(b.name);
  });
};
