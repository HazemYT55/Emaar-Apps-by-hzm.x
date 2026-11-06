function renderWorkers() {
  const workers = Saves.getWorkers();
  const list = document.getElementById('workerList');
  
  // If there are no workers, show a clean message
  if (!workers || workers.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; padding: 16px; text-align: center;">لم يتم إضافة عمال بعد.</p>';
    return;
  }

  // Generate the worker cards
  list.innerHTML = workers.map(w => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--surface);">
      <div>
        <strong style="font-size: 16px; color: var(--primary); margin-left: 8px;">${w.name || 'عامل'}</strong> 
        <span style="font-size: 13px; color: var(--text-muted); background: var(--bg); padding: 2px 8px; border-radius: 4px;">${w.role || 'بدون مسمى'}</span>
        <br>
        <small style="color: var(--text-muted); font-size: 12px; display: inline-block; margin-top: 6px;">
          <i class="ph ph-phone"></i> ${w.phone || 'لا يوجد رقم'}
        </small>
      </div>
      <button class="danger" onclick="deleteWorker('${w.id}')" style="padding: 6px 10px; font-size: 12px; border-radius: 6px;">
        <i class="ph ph-trash"></i>
      </button>
    </div>
  `).join('');
}

function addWorker() {
  const name = document.getElementById('workerName').value.trim();
  const role = document.getElementById('workerRole').value.trim();
  const phone = document.getElementById('workerPhone').value.trim();
  
  if (!name) {
    alert('الرجاء إدخال اسم العامل.');
    return;
  }

  // Play success sound if it exists
  if (typeof Sounds !== 'undefined') {
    Sounds.playSuccess();
  }

  // Save the worker
  Saves.addWorker({ 
    id: Saves.newId(), 
    name: name, 
    role: role, 
    phone: phone, 
    createdAt: Date.now() 
  });
  
  // Clear the input fields
  document.getElementById('workerName').value = '';
  document.getElementById('workerRole').value = '';
  document.getElementById('workerPhone').value = '';
  
  // Re-render the list
  renderWorkers();
}

function deleteWorker(id) {
  if (confirm('هل أنت متأكد من حذف هذا العامل؟')) {
    Saves.removeWorker(id);
    renderWorkers();
  }
}