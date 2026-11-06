# Emaar Gulf - Internal Project & Task Management System

A comprehensive, enterprise-grade web application built for **Emaar Gulf** to manage engineering projects, assign tasks, track worker performance, and generate professional reports.

## 🌟 Key Features

### 1. Portal & Branding
*   **Emaar Portal:** A centralized dashboard to access all apps, view device previews, and quickly access official social media links.
*   **Dynamic Themes:** Light (Emaar Blue), Dark Mode, and Desert Gold.
*   **Arabic Support:** Full RTL layout with a custom Arabic font.
*   **Responsive:** Perfectly adapts to Desktop, Tablet, and Mobile.

### 2. Authentication & Roles
*   **Admins:** Full access to create tasks, manage workers, edit data, and generate reports.
*   **Workers:** Workers can sign up using their email and select their name. They get a dedicated view that only shows *their* tasks. They can mark tasks as "Done" for review.
*   **Social Login:** Supports Google and GitHub authentication.

### 3. Task & Team Management
*   **Workers Directory:** Add, edit, and delete workers. Sort them visually using Up/Down arrows.
*   **Task Creation:** Assign tasks to multiple workers (Worker Chain), set due dates, locations, and upload site photos.
*   **Kanban Board:** Drag-and-drop tasks between Pending, In Progress, Review, and Done. Includes a dynamic color-coded chart and manual task reordering.

### 4. Smart Reports & Exporting
*   **Project-Specific Reports:** Filter tasks by location/project to see exact stats and delays.
*   **Export to 4 Formats:** Download reports instantly as **PDF**, **PowerPoint (.pptx)**, **Excel (.xlsx)**, and **Markdown (.md)**.
*   **AI Recommendations:** Automatically detects delayed tasks and highlights worker performance.

### 5. Device Preview
*   Showcase the app to clients by viewing the Desktop and Mobile layouts side-by-side in real-time.

---

## 🛠️ Technology Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules).
*   **Backend / Database:** Google Firebase (Firestore & Authentication).
*   **Libraries:** Phosphor Icons, PptxGenJS, SheetJS, jsPDF, html2canvas.
*   **Image Optimization:** Built-in client-side image compression to save database space.

---

## 💻 How to Run Locally
Because this project uses ES6 Modules, it **must** run on a local server. 
1. Open your terminal in the project folder.
2. Run: `python -m http.server 8000`
3. Open your browser and go to: `http://localhost:8000`
