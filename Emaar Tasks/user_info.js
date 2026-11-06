// user_info.js
document.addEventListener('DOMContentLoaded', () => {
  const user = Saves.getUser();
  
  if (user) {
    // If user exists, replace form with a success message
    document.getElementById('userForm').innerHTML = `
      <div style="background: var(--bg); padding: 16px; border-radius: 8px; border: 1px solid var(--border);">
        <p style="margin: 0; font-weight: 600; color: var(--success);"><i class="ph ph-check-circle"></i> Profile Active</p>
        <p style="margin: 8px 0 0 0; font-size: 14px;">Logged in as <b>${user.name}</b><br>${user.role}</p>
      </div>
    `;
  }
  if (typeof renderWorkers === 'function') renderWorkers();
});

function saveUser() {
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const role = document.getElementById('userRole').value.trim();

  if (!name) return alert('Please enter your name.');

  const user = { id: Saves.newId(), name, email, role, createdAt: Date.now() };
  Saves.setUser(user);
  window.location.reload();
}