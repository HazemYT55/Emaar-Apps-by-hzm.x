import { db } from './firebase-config.js';
import {
  collection, doc, getDocs, getDoc, setDoc, addDoc, deleteDoc,
  updateDoc, query, where, enableNetwork
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Force Firebase to stay online
enableNetwork(db).catch((error) => console.error("Firebase Network Error:", error));

const ADMIN_EMAILS = ["hazemyt55@gmail.com", "m.salama@emaar.gulf"];

const Saves = (() => {
  return {
    // --- USERS ---
    getUserData: async (uid) => {
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();
        return null;
      } catch (e) { console.error("getUserData error:", e); return null; }
    },

    linkUserToWorker: async (email, workerId) => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          const newUserRef = doc(usersRef);
          await setDoc(newUserRef, { email: email, workerId: workerId, name: "مهندس جديد", role: "عامل" });
          return true;
        }
        const userDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { workerId: workerId });
        return true;
      } catch (e) { console.error("Link error:", e); throw e; }
    },

    // --- WORKERS ---
    getWorkers: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workers'));
        const workers = [];
        querySnapshot.forEach((doc) => workers.push({ id: doc.id, ...doc.data() }));
        return workers;
      } catch (e) { console.error("getWorkers error:", e); return []; }
    },

    // دالة جديدة لجلب مهندس واحد فقط (تحل مشكلة الصلاحيات)
    getWorker: async (workerId) => {
      try {
        const snap = await getDoc(doc(db, 'workers', workerId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
      } catch (e) { console.error("getWorker error:", e); return null; }
    },

    addWorker: async (worker) => {
      try {
        const { id, ...data } = worker; 
        await addDoc(collection(db, 'workers'), data);
      } catch (e) { console.error("addWorker error:", e); }
    },

    updateWorker: async (id, patch) => {
      try { await updateDoc(doc(db, 'workers', id), patch); } 
      catch (e) { console.error("updateWorker error:", e); }
    },

    removeWorker: async (id) => {
      try { await deleteDoc(doc(db, 'workers', id)); } 
      catch (e) { console.error("removeWorker error:", e); }
    },

    updateWorkerWithLog: async (workerId, patch, performedBy, eventMeta) => {
      try {
        const workerRef = doc(db, 'workers', workerId);
        const beforeSnap = await getDoc(workerRef);
        const before = beforeSnap.exists() ? beforeSnap.data() : {};
        const events = [];

        if (patch.jobTitle && patch.jobTitle !== before.jobTitle) {
          events.push({ eventType: 'title_changed', title: 'تغيير المسمى الوظيفي', description: `من "${before.jobTitle || 'غير محدد'}" إلى "${patch.jobTitle}"` });
        }
        if (patch.department && patch.department !== before.department) {
          events.push({ eventType: 'department_changed', title: 'تغيير القسم', description: `من "${before.department || 'غير محدد'}" إلى "${patch.department}"` });
        }
        if (patch.lastPromotionDate && !before.lastPromotionDate) {
          events.push({ eventType: 'promotion', title: 'ترقية وظيفية', description: eventMeta?.description || 'تم تسجيل ترقية جديدة' });
        }
        if (patch.lastEvaluationDate && !before.lastEvaluationDate) {
          events.push({ eventType: 'evaluation', title: 'تقييم وظيفي', description: eventMeta?.description || 'تم تسجيل تقييم وظيفي' });
        }
        if (patch.workStatus && patch.workStatus !== before.workStatus) {
          events.push({ eventType: 'work_status_changed', title: 'تغيير حالة العمل', description: `من "${before.workStatus || 'غير محدد'}" إلى "${patch.workStatus}"` });
        }

        await updateDoc(workerRef, { ...patch, profileUpdatedAt: new Date() });

        for (const ev of events) {
          await Saves.addTimelineEvent(workerId, { ...ev, performedBy: performedBy || 'system' });
        }
        return true;
      } catch (e) { console.error("updateWorkerWithLog error:", e); throw e; }
    },

    // --- TIMELINE ---
    getWorkerTimeline: async (workerId, maxEvents = 50) => {
      try {
        const timelineRef = collection(db, 'workers', workerId, 'timeline');
        const snap = await getDocs(timelineRef);
        const events = [];
        snap.forEach((d) => events.push({ id: d.id, ...d.data() }));
        events.sort((a, b) => {
          const ta = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
          const tb = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
          return tb - ta;
        });
        return events.slice(0, maxEvents);
      } catch (e) { console.error("getWorkerTimeline error:", e); return []; }
    },

    addTimelineEvent: async (workerId, event) => {
      try {
        const timelineRef = collection(db, 'workers', workerId, 'timeline');
        const snap = await getDocs(timelineRef);
        const now = Date.now();
        let isDuplicate = false;
        snap.forEach((d) => {
          const data = d.data();
          const ts = data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || 0);
          if (data.eventType === event.eventType && Math.abs(now - ts) < 30000) isDuplicate = true;
        });
        if (isDuplicate) return null;
        const payload = { ...event, timestamp: event.timestamp || new Date(), createdAt: Date.now() };
        const ref = await addDoc(timelineRef, payload);
        return ref.id;
      } catch (e) { console.error("addTimelineEvent error:", e); return null; }
    },

    // --- TASKS ---
    getTasks: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const tasks = [];
        querySnapshot.forEach((doc) => tasks.push({ id: doc.id, ...doc.data() }));
        return tasks;
      } catch (e) { console.error("getTasks error:", e); return []; }
    },
    addTask: async (task) => {
      try { const { id, ...data } = task; await addDoc(collection(db, 'tasks'), data); } catch (e) { console.error(e); }
    },
    removeTask: async (id) => {
      try { await deleteDoc(doc(db, 'tasks', id)); } catch (e) { console.error(e); }
    },
    updateTask: async (id, patch) => {
      try { await updateDoc(doc(db, 'tasks', id), patch); } catch (e) { console.error(e); }
    },

    // --- PROJECTS ---
    getProjects: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projects = [];
        querySnapshot.forEach((doc) => projects.push({ id: doc.id, ...doc.data() }));
        return projects;
      } catch (e) { console.error("getProjects error:", e); return []; }
    },
    addProject: async (name) => {
      try { await addDoc(collection(db, 'projects'), { name: name, createdAt: Date.now() }); } catch (e) { console.error(e); }
    },
    removeProject: async (id) => {
      try { await deleteDoc(doc(db, 'projects', id)); } catch (e) { console.error(e); }
    },

    isAdminEmail: (email) => !!email && ADMIN_EMAILS.includes(email.toLowerCase()),
    newId: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  };
})();

export default Saves;