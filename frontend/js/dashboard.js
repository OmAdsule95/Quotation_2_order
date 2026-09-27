document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    
    // Load dashboard stats
    try {
        const [custRes, prodRes, quotRes, ordRes] = await Promise.all([
            fetchApi('/customers'),
            fetchApi('/products'),
            fetchApi('/quotations'),
            fetchApi('/orders')
        ]);
        
        if (custRes.data.success) document.getElementById('stat-customers').textContent = custRes.data.data.length;
        if (prodRes.data.success) document.getElementById('stat-products').textContent = prodRes.data.data.length;
        if (quotRes.data.success) {
            const quotations = quotRes.data.data;
            document.getElementById('stat-quotations').textContent = quotations.length;
            document.getElementById('stat-pending').textContent = quotations.filter(q => q.status === 'PENDING_APPROVAL').length;
            document.getElementById('stat-accepted').textContent = quotations.filter(q => q.status === 'ACCEPTED').length;
        }
        if (ordRes.data.success) document.getElementById('stat-orders').textContent = ordRes.data.data.length;
    } catch (error) {
        console.error("Dashboard load error", error);
    }
});
