export interface SortableStage {
  id?: number;
  name: string;
  slug: string;
  sort_order: number;
}

// there will also be a client round as well which should be addded at the end of the hr round 

export const getLNumber = (name: string): number | null => {
  const match = name.match(/\bL(\d+)\b/i);
  return match ? parseInt(match[1], 10) : null;
};

export const isPostInterview = (name: string, slug: string): boolean => {
  const n = (name || "").toLowerCase();
  const s = (slug || "").toLowerCase();
  return n.includes("offer") || n.includes("hired") || n.includes("joined") || n.includes("select") ||
         s.includes("offer") || s.includes("hired") || s.includes("joined") || s.includes("select");
};



export const isHRStage = (name: string, slug: string): boolean => {
  const n = (name || "").toLowerCase();
  const s = (slug || "").toLowerCase();
  return (
    /\bhr\b/i.test(n) ||
    n.includes("human resources") ||
    n.includes("salary") ||
    n.includes("negotiation") ||
    /\bhr\b/i.test(s) ||
    s.includes("human-resources") ||
    s.includes("salary") ||
    s.includes("negotiation")
  );
};

export const isClientRound=(name:string,slug:string)=>{
    const n = (name || "").toLowerCase();
    const s = (slug || "").toLowerCase();
    return (
        /\bclient\b/i.test(n) ||
        n.includes("client round") ||
        /\bclient\b/i.test(s) ||
        s.includes("client-round")
    );
}

export const getStageGroup = (name: string, slug: string): number => {
  if (isPostInterview(name, slug)) {
    return 5;
  }
  if(isClientRound(name,slug)){
    return 4;
  }
  if (isHRStage(name, slug)) {
    return 3;
  }
  if (getLNumber(name) !== null) {
    return 2;
  }
  return 1;
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
    const groupA = getStageGroup(a.name, a.slug);
    const groupB = getStageGroup(b.name, b.slug);
    if (groupA !== groupB) {
      return groupA - groupB;
    }
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

