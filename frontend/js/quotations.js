document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadQuotations();
});

function getStatusBadge(status) {
    const map = {
        'DRAFT': 'badge-draft',
        'PENDING_APPROVAL': 'badge-pending',
        'APPROVED': 'badge-approved',
        'SENT': 'badge-sent',
        'ACCEPTED': 'badge-accepted',
        'REJECTED': 'badge-rejected',
        'CONVERTED': 'badge-converted',
        'EXPIRED': 'badge-draft'
    };
    return `<span class="badge ${map[status] || 'badge-draft'}">${status.replace('_', ' ')}</span>`;
}

async function loadQuotations() {
    const { data } = await fetchApi('/quotations');
    const tbody = document.getElementById('quotationsTable');
    tbody.innerHTML = '';
    const user = getUser();

    if (data.success) {
        data.data.forEach(q => {
            let actions = `<a href="quotation-details.html?id=${q._id}" class="btn btn-sm" style="background: rgba(255,255,255,0.1);">View</a>`;
            
            if (q.status === 'DRAFT' && (user.role === 'SALES' || user.role === 'ADMIN')) {
                actions += ` <button onclick="updateStatus('${q._id}', 'submit')" class="btn btn-sm btn-primary">Submit</button>`;
            }
            if (q.status === 'PENDING_APPROVAL' && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
                actions += ` <button onclick="openApproveModal('${q._id}')" class="btn btn-sm btn-success">Review</button>`;
            }
            if (q.status === 'APPROVED' && (user.role === 'SALES' || user.role === 'ADMIN')) {
                actions += ` <button onclick="updateStatus('${q._id}', 'send')" class="btn btn-sm" style="background: #3b82f6; color: white;">Send to Customer</button>`;
            }
            if (q.status === 'SENT' && (user.role === 'SALES' || user.role === 'ADMIN')) {
                actions += ` <button onclick="updateStatus('${q._id}', 'accept')" class="btn btn-sm" style="background: #10b981; color: white;">Mark Accepted</button>`;
            }
            if (q.status === 'ACCEPTED' && (user.role === 'SALES' || user.role === 'ADMIN')) {
                actions += ` <button onclick="convertOrder('${q._id}')" class="btn btn-sm" style="background: #8b5cf6; color: white;">Convert to Order</button>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${q.quotationNumber}</td>
                <td>${q.customerDetails?.name || '-'}</td>
                <td>$${q.grandTotal.toFixed(2)}</td>
                <td>${getStatusBadge(q.status)}</td>
                <td>${new Date(q.createdAt).toLocaleDateString()}</td>
                <td class="action-btns">${actions}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function updateStatus(id, action) {
    const { data } = await fetchApi(`/quotations/${id}/${action}`, 'POST');
    if (data.success) {
        loadQuotations();
    } else {
        alert(data.message);
    }
}

async function convertOrder(id) {
    const { data } = await fetchApi(`/quotations/${id}/convert`, 'POST');
    if (data.success) {
        alert('Converted to order successfully!');
        window.location.href = 'orders.html';
    } else {
        alert(data.message);
    }
}

function openApproveModal(id) {
    document.getElementById('approveQuoteId').value = id;
    document.getElementById('approveComments').value = '';
    document.getElementById('approveModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

async function submitReview(status) {
    const id = document.getElementById('approveQuoteId').value;
    const comments = document.getElementById('approveComments').value;
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    
    const { data } = await fetchApi(`/quotations/${id}/${action}`, 'POST', { comments });
    if (data.success) {
        closeModal('approveModal');
        loadQuotations();
    } else {
        alert(data.message);
    }
}
