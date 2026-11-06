import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    addDoc, 
    deleteDoc, 
    updateDoc,
    enableNetwork
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Force Firebase to stay online (Prevents hanging on "Loading...")
enableNetwork(db).then(() => {
    console.log("✅ Firebase Network is Online");
}).catch((error) => {
    console.error("❌ Firebase Network Error:", error);
});

const Saves = (() => {
  return {
    // --- WORKERS ---
    getWorkers: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workers'));
        const workers = [];
        querySnapshot.forEach((doc) => {
          workers.push({ id: doc.id, ...doc.data() });
        });
        return workers;
      } catch (e) {
        console.error("Firebase getWorkers error:", e);
        return [];
      }
    },
    addWorker: async (worker) => {
      try {
        const { id, ...data } = worker; 
        await addDoc(collection(db, 'workers'), data);
      } catch (e) {
        console.error("Firebase addWorker error:", e);
      }
    },
    updateWorker: async (id, patch) => {
      try {
        await updateDoc(doc(db, 'workers', id), patch);
      } catch (e) {
        console.error("Firebase updateWorker error:", e);
      }
    },
    removeWorker: async (id) => {
      try {
        await deleteDoc(doc(db, 'workers', id));
      } catch (e) {
        console.error("Firebase removeWorker error:", e);
      }
    },

    // --- TASKS ---
    getTasks: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = [];
        querySnapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() });
        });
        return tasks;
      } catch (e) {
        console.error("Firebase getTasks error:", e);
        return [];
      }
    },
    addTask: async (task) => {
      try {
        const { id, ...data } = task;
        await addDoc(collection(db, 'tasks'), data);
      } catch (e) {
        console.error("Firebase addTask error:", e);
      }
    },
    removeTask: async (id) => {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (e) {
        console.error("Firebase removeTask error:", e);
      }
    },
    updateTask: async (id, patch) => {
      try {
        await updateDoc(doc(db, 'tasks', id), patch);
      } catch (e) {
        console.error("Firebase updateTask error:", e);
      }
    },

    // --- PROJECTS ---
    getProjects: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        return projects;
      } catch (e) {
        console.error("Firebase getProjects error:", e);
        return [];
      }
    },
    addProject: async (name) => {
      try {
        await addDoc(collection(db, 'projects'), { name: name, createdAt: Date.now() });
      } catch (e) {
        console.error("Firebase addProject error:", e);
      }
    },
    removeProject: async (id) => {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (e) {
        console.error("Firebase removeProject error:", e);
      }
    },

    // Utility
    newId: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

export default Saves;