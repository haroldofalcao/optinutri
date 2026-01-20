// Stub for analytics
export const trackPageView = (page: string, title?: string) => {
    console.log(`[Analytics] Page View: ${page} - ${title}`);
};

export const trackOptimizationStarted = (selectedFormulas: string[], volumeMax: number, custom: boolean) => {
    console.log(`[Analytics] Optimization Started`, { count: selectedFormulas.length, volumeMax });
};

export const trackOptimizationCompleted = (bags: number, cost: number, time: number, volume: number) => {
    console.log(`[Analytics] Optimization Completed`, { bags, cost, time, volume });
};

export const trackOptimizationFailed = (reason: string, volumeMax: number) => {
    console.log(`[Analytics] Optimization Failed: ${reason}`);
};

export const trackOptimizationDetailsViewed = (id: string, expanded: boolean) => {
    console.log(`[Analytics] History Details Viewed: ${id} (${expanded ? 'expanded' : 'collapsed'})`);
};
