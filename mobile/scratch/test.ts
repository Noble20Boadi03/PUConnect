import { api } from '../services/api';

async function test() {
    const filters = await api.getSubcategoryFilters('Study Group Facilitation');
    console.log('Study Group Facilitation:', filters);
    
    const filters2 = await api.getSubcategoryFilters('Website & App Development');
    console.log('Website & App Development:', filters2);
}

test();
