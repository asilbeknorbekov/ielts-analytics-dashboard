# 📊 IELTS Performance & Cohort Analytics Dashboard

An interactive, full-stack EdTech analytics dashboard designed to monitor, analyze, and visualize student examination metrics across all IELTS modules (Reading, Listening, Writing, Speaking). 

Built with **React 19**, **Vite**, **Recharts**, and an automated **Python / Pandas ETL pipeline**.

---

## 🌟 Key Features

- **🌐 Global Cohort Overview**:
  - Comparative analysis across multiple teachers and study groups.
  - Multi-select interactive filters with instant re-aggregation.
  - Performance breakdown across Overall, Reading, Listening, Writing, and Speaking modules.
  
- **🎯 Granular Student Deep-Dive**:
  - **Reading & Listening**: Accuracy breakdowns by specific question types (e.g., *Matching Headings*, *True/False/Not Given*, *Multiple Choice*).
  - **Writing Assessment**: Task 1 & Task 2 band score tracking and comparison.
  - **Speaking Evaluation**: 4-axis **Radar Chart** visualizing *Fluency & Coherence*, *Lexical Resource*, *Grammatical Range & Accuracy*, and *Pronunciation*.

- **⚡ Automated Python ETL Pipeline**:
  - Ingests multi-sheet Excel data (.xlsx) using **Pandas**.
  - Normalizes schemas, cleans missing NaN values, and serializes optimized structured JSON data.

- **🎨 Modern Dark-Mode UI/UX**:
  - Glassmorphic design with custom tooltips, smooth animations, and responsive chart containers.

---

## 🛠️ Tech Stack & Skills Demonstrated

| Layer | Technologies & Tools |
| :--- | :--- |
| **Data Engineering & ETL** | Python, Pandas, JSON serialization, Data Cleaning & Normalization |
| **Frontend Framework** | React 19, Vite, Modern JavaScript (ES6+), React Hooks |
| **Data Visualization** | Recharts (Radar Charts, Bar Charts, Responsive Containers, Custom Tooltips) |
| **Styling & UI Components** | CSS Variables, Lucide Icons, Glassmorphic Dark Theme |

---

## 🚀 Quick Start

### 1. Clone the repository
`ash
git clone https://github.com/asilbeknorbekov/ielts-analytics-dashboard.git
cd ielts-analytics-dashboard
`

### 2. Install dependencies
`ash
npm install
`

### 3. Run the development server
`ash
npm run dev
`
Open http://localhost:5173 in your browser.

### 4. Update Dataset (Optional)
To re-process or update the student data from Excel:
`ash
python update_data.py
`

---

## 👨‍💻 Author
**Asilbek Norbekov**
- LinkedIn: [linkedin.com/in/asilbek-norbekov](https://linkedin.com/in/asilbek-norbekov)
- GitHub: [github.com/asilbeknorbekov](https://github.com/asilbeknorbekov)
