import { auth, db } from './firebase-config.js';
import Saves from './saves.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ADMIN_EMAILS = ["hazemyt55@gmail.com", "m.salama@emaargulf.com"];
let isAdmin = false;
let allTasks = [];
let allWorkers = [];
let selectedWorkerIds = [];
let editingWorkerIds = [];

onAuthStateChanged(auth, (user) => {
  if (user) {
    isAdmin = ADMIN_EMAILS.includes(user.email);
    initPage();
  } else {
    window.location.href = 'index.html';
  }
});

async function initPage() {
  allWorkers = await Saves.getWorkers();
  const dropdown = document.getElementById('workerDropdown');
  const reviewerSelect = document.getElementById('taskReviewer');
  
  if (allWorkers.length === 0) {
    dropdown.innerHTML = '<option value="">⚠️ أضف عاملاً أولاً</option>';
  } else {
    const options = allWorkers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('');
    dropdown.innerHTML = '<option value="">-- اختر عاملاً --</option>' + options;
    reviewerSelect.innerHTML = '<option value="">بدون مراجع</option>' + allWorkers.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
  }
  
  const editDropdown = document.getElementById('editWorkerDropdown');
  editDropdown.innerHTML = allWorkers.map(w => `<option value="${w.id}">${w.name} (${w.role})</option>`).join('');

  // Load Projects into BOTH dropdowns
  const projectsSnap = await getDocs(collection(db, 'projects'));
  const projectSelect = document.getElementById('taskProject');
  const editProjectSelect = document.getElementById('editTaskProject');
  
  projectSelect.innerHTML = '<option value="">بدون مشروع</option>';
  editProjectSelect.innerHTML = '<option value="">بدون مشروع</option>';
  
  projectsSnap.forEach(d => {
      projectSelect.innerHTML += `<option value="${d.id}">${d.data().name}</option>`;
      editProjectSelect.innerHTML += `<option value="${d.id}">${d.data().name}</option>`;
  });

  allTasks = await Saves.getTasks();
  renderTasks(allTasks);
}

// --- CREATE CHAIN ---
window.addWorkerToChain = function() {
  const workerId = document.getElementById('workerDropdown').value;
  if (!workerId) return alert('الرجاء اختيار عامل أولاً.');
  if (selectedWorkerIds.includes(workerId)) return alert('هذا العامل موجود بالفعل.');
  selectedWorkerIds.push(workerId);
  document.getElementById('workerDropdown').value = ''; 
  renderWorkersChain();
};

window.clearWorkersChain = function() { selectedWorkerIds = []; renderWorkersChain(); };

function renderWorkersChain() {
  const container = document.getElementById('workersChainList');
  if (selectedWorkerIds.length === 0) {
    container.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">لم يتم اختيار عمال بعد.</span>';
    return;
  }
  container.innerHTML = selectedWorkerIds.map((id, index) => {
    const worker = allWorkers.find(w => w.id === id);
    const isLast = index === selectedWorkerIds.length - 1;
    return `<span style="background: var(--primary); color: white; padding: 5px 12px; border-radius: 20px; font-size: 13px;">${worker.name}</span>${!isLast ? '<i class="ph ph-arrow-left" style="color: var(--text-muted);"></i>' : ''}`;
  }).join('');
}

// --- CREATE TASK ---
window.createTask = function() {
  const reviewerId = document.getElementById('taskReviewer').value;
  const projectId = document.getElementById('taskProject').value;
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDesc').value.trim();
  const location = document.getElementById('taskLocation').value.trim();
  const mapLink = document.getElementById('taskMapLink').value.trim();
  const dueDate = document.getElementById('taskDueDate').value;
  const imageFile = document.getElementById('taskImage').files[0];

  if (selectedWorkerIds.length === 0) return alert('الرجاء إضافة عامل واحد على الأقل للتسلسل.');
  if (!title) return alert('عنوان المهمة مطلوب.');

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        saveTaskToDB(reviewerId, projectId, title, description, location, mapLink, dueDate, compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveTaskToDB(reviewerId, projectId, title, description, location, mapLink, dueDate, null);
  }
};

async function saveTaskToDB(reviewerId, projectId, title, description, location, mapLink, dueDate, imageBase64) {
  if (typeof Sounds !== 'undefined') Sounds.playSuccess();

  await Saves.addTask({
    workerIds: selectedWorkerIds, 
    reviewerId: reviewerId || null, 
    projectId: projectId || null,
    title, 
    description, 
    location, 
    mapLink, 
    dueDate, 
    image: imageBase64, 
    status: 'pending', 
    createdAt: Date.now()
  });

  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskLocation').value = '';
  document.getElementById('taskMapLink').value = '';
  document.getElementById('taskDueDate').value = '';
  document.getElementById('taskImage').value = '';
  clearWorkersChain(); 

  allTasks = await Saves.getTasks();
  renderTasks(allTasks);
}

// --- EDIT CHAIN ---
window.openEditModal = function(taskId) {
  const task = allTasks.find(t => t.id === taskId);
  if (!task) return;
  document.getElementById('editTaskId').value = task.id;
  document.getElementById('editTitle').value = task.title;
  document.getElementById('editDesc').value = task.description || '';
  document.getElementById('editLocation').value = task.location || '';
  document.getElementById('editMapLink').value = task.mapLink || '';
  document.getElementById('editDate').value = task.dueDate || '';
  
  const editProjectSelect = document.getElementById('editTaskProject');
  if (editProjectSelect) editProjectSelect.value = task.projectId || "";

  editingWorkerIds = task.workerIds ? [...task.workerIds] : [];
  renderEditWorkersChain();
  document.getElementById('editModal').style.display = 'flex';
};

window.closeEditModal = function() { document.getElementById('editModal').style.display = 'none'; };

window.addWorkerToEditChain = function() {
  const workerId = document.getElementById('editWorkerDropdown').value;
  if (!workerId) return;
  if (editingWorkerIds.includes(workerId)) return alert('هذا العامل موجود بالفعل.');
  editingWorkerIds.push(workerId);
  renderEditWorkersChain();
};

window.clearEditWorkersChain = function() { editingWorkerIds = []; renderEditWorkersChain(); };

function renderEditWorkersChain() {
  const container = document.getElementById('editWorkersChainList');
  if (editingWorkerIds.length === 0) {
    container.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">لم يتم اختيار عمال.</span>';
    return;
  }
  container.innerHTML = editingWorkerIds.map((id, index) => {
    const worker = allWorkers.find(w => w.id === id);
    const isLast = index === editingWorkerIds.length - 1;
    return `<span style="background: var(--primary); color: white; padding: 5px 12px; border-radius: 20px; font-size: 13px;">${worker ? worker.name : 'غير معروف'}</span>${!isLast ? '<i class="ph ph-arrow-left" style="color: var(--text-muted);"></i>' : ''}`;
  }).join('');
}

window.saveEditTask = async function() {
  const taskId = document.getElementById('editTaskId').value;
  const title = document.getElementById('editTitle').value.trim();
  const description = document.getElementById('editDesc').value.trim();
  const location = document.getElementById('editLocation').value.trim();
  const mapLink = document.getElementById('editMapLink').value.trim();
  const dueDate = document.getElementById('editDate').value;
  const projectId = document.getElementById('editTaskProject').value;

  if (!title) return alert('عنوان المهمة مطلوب.');
  if (editingWorkerIds.length === 0) return alert('يجب أن تحتوي المهمة على عامل واحد على الأقل.');

  await Saves.updateTask(taskId, { 
      title, description, location, mapLink, dueDate, workerIds: editingWorkerIds, projectId: projectId || null 
  });
  
  closeEditModal();
  allTasks = await Saves.getTasks();
  renderTasks(allTasks);
  if (typeof Sounds !== 'undefined') Sounds.playSuccess();
};

// --- RENDER TASKS ---
function renderTasks(tasksToRender) {
  const list = document.getElementById('taskList');
  if (tasksToRender.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">لا توجد مهام.</p>';
    return;
  }

  tasksToRender.sort((a, b) => {
      const orderA = a.listOrder !== undefined ? a.listOrder : (a.createdAt || 0);
      const orderB = b.listOrder !== undefined ? b.listOrder : (b.createdAt || 0);
      return orderA - orderB;
  });

  list.innerHTML = tasksToRender.map((t, index) => {
    let statusArabic = ""; let badgeClass = "";
    if (t.status === 'pending') { statusArabic = "قيد الانتظار"; badgeClass = "pending"; }
    if (t.status === 'in_progress') { statusArabic = "قيد التنفيذ"; badgeClass = "in-progress"; }
    if (t.status === 'review') { statusArabic = "بانتظار المراجعة"; badgeClass = "review"; }
    if (t.status === 'done') { statusArabic = "تم الانتهاء"; badgeClass = "done"; }
    
    const chainDisplay = (t.workerIds || []).map(id => {
      const w = allWorkers.find(worker => worker.id === id);
      return w ? w.name : 'غير معروف';
    }).join(' <i class="ph ph-arrow-left"></i> ');

    const editBtn = isAdmin ? `<button onclick="openEditModal('${t.id}')" style="background: transparent !important; border: none !important; color: var(--primary) !important; cursor: pointer; font-size: 18px; padding: 0 5px;" title="تعديل"><i class="ph ph-pencil"></i></button>` : '';

    const orderControls = isAdmin ? `
      <div style="display: flex; flex-direction: column; gap: 2px; margin-left: 10px;">
        <button class="order-btn" onclick="event.stopPropagation(); moveTaskList(${index}, -1)" ${index === 0 ? 'disabled' : ''}><i class="ph ph-caret-up"></i></button>
        <button class="order-btn" onclick="event.stopPropagation(); moveTaskList(${index}, 1)" ${index === tasksToRender.length - 1 ? 'disabled' : ''}><i class="ph ph-caret-down"></i></button>
      </div>
    ` : '';

    const mapBtn = t.mapLink ? `
        <a href="${t.mapLink}" target="_blank" class="map-btn" onclick="event.stopPropagation();" style="display: inline-flex; align-items: center; gap: 5px; background: #e0f2fe; color: #0284c7; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; margin-top: 5px;">
            <i class="ph ph-map-trifold"></i> فتح الموقع على الخريطة
        </a>
    ` : '';

    return `
      <div class="task-item" style="border-left: 4px solid var(--primary); padding: 16px; background: var(--bg); border-radius: 8px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="display: flex; align-items: flex-start;">
            ${orderControls}
            <div>
                <h3 style="font-size: 16px; margin-bottom: 4px;">${t.title}</h3>
            </div>
          </div>
          <div style="display: flex; align-items: center;">${editBtn} <span class="badge ${badgeClass}">${statusArabic}</span></div>
        </div>
        ${t.description ? `<p style="font-size: 13px; margin: 10px 0;">${t.description}</p>` : ''}
        
        ${t.image ? `<img src="${t.image}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 6px; margin-top: 10px;">` : ''}

        <div style="background: var(--surface); padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 13px; border: 1px solid var(--border); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <i class="ph ph-users" style="color: var(--primary);"></i> <strong>التسلسل:</strong> ${chainDisplay}
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 10px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
          ${t.location ? `<span><i class="ph ph-map-pin"></i> ${t.location}</span>` : ''}
          ${t.dueDate ? `<span><i class="ph ph-calendar"></i> تاريخ التسليم: ${t.dueDate}</span>` : ''}
          ${mapBtn}
        </div>
        <div style="margin-top: 15px; display: flex; gap: 10px; border-top: 1px solid var(--border); padding-top: 12px;">
          <select onchange="updateTaskStatus('${t.id}', this.value)" style="width: auto; padding: 6px; font-size: 12px; background: var(--surface); border: 1px solid var(--border);">
            <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
            <option value="in_progress" ${t.status === 'in_progress' ? 'selected' : ''}>قيد التنفيذ</option>
            <option value="review" ${t.status === 'review' ? 'selected' : ''}>بانتظار المراجعة</option>
            <option value="done" ${t.status === 'done' ? 'selected' : ''}>تم الانتهاء</option>
          </select>
          <button class="danger" style="padding: 6px 10px; font-size: 12px;" onclick="deleteTask('${t.id}')"><i class="ph ph-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

window.moveTaskList = async function(index, direction) {
  const term = document.getElementById('searchBar').value.toLowerCase();
  let visibleTasks = allTasks.filter(t => t.title.toLowerCase().includes(term) || t.status.toLowerCase().includes(term));
  
  visibleTasks.sort((a, b) => {
      const orderA = a.listOrder !== undefined ? a.listOrder : (a.createdAt || 0);
      const orderB = b.listOrder !== undefined ? b.listOrder : (b.createdAt || 0);
      return orderA - orderB;
  });

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= visibleTasks.length) return;

  const temp = visibleTasks[index];
  visibleTasks[index] = visibleTasks[targetIndex];
  visibleTasks[targetIndex] = temp;

  for (let i = 0; i < visibleTasks.length; i++) {
      await Saves.updateTask(visibleTasks[i].id, { listOrder: i });
  }

  allTasks = await Saves.getTasks();
  renderTasks(allTasks);
  if (typeof Sounds !== 'undefined') Sounds.playClick();
};

window.updateTaskStatus = async function(id, newStatus) {
  await Saves.updateTask(id, { status: newStatus });
  allTasks = await Saves.getTasks();
  renderTasks(allTasks);
};

window.deleteTask = async function(id) {
  if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
    await Saves.removeTask(id);
    allTasks = await Saves.getTasks();
    renderTasks(allTasks);
  }
};

window.filterTasks = function() {
  const term = document.getElementById('searchBar').value.toLowerCase();
  const filtered = allTasks.filter(t => t.title.toLowerCase().includes(term) || t.status.toLowerCase().includes(term));
  renderTasks(filtered);
};