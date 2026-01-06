# 🚀 AI-Powered README Generator

An intelligent web application that leverages **Google Gemini 1.5 Flash** to automatically generate professional and well-structured README files for your projects.  
Users simply provide the **project title, tech stack, languages used, and description**, and the AI crafts a polished README.md file ready to use.  

---

## ✨ Features

- 🤖 **AI-Generated Documentation** – Uses **Gemini 1.5 Flash** to generate high-quality README files tailored to your project.  
- 🔒 **JWT Authentication** – Secure login and user management system for personalized experience.  
- 💾 **FileDB Integration** – Efficient file-based storage for managing generated README files.  
- ⚡ **Modern Tech Stack** – Built with **FastAPI (backend)** and **TypeScript + React (frontend)** for performance and scalability.  
- 🌐 **Real-Time Interaction** – Smooth communication between frontend and backend for instant README generation.  

---

## 🛠️ Tech Stack

**Frontend:**  
- React (TypeScript)  
- TailwindCSS (optional for styling)  

**Backend:**  
- FastAPI (Python)  
- JWT Authentication  
- FileDB  

**AI:**  
- Google Gemini 1.5 Flash  

---

## 🏗️ System Architecture

```

User (React + TypeScript Frontend)
⬇
FastAPI Backend (JWT Auth + FileDB)
⬇
Google Gemini 1.5 Flash API

````

---

## 📦 Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-readme-generator.git
cd ai-readme-generator
````

### 2. Setup Environment Variables

Create a `.env` file in the backend directory:

```env
# backend/.env
GEMINI_API_KEY="your_google_gemini_api_key"
JWT_SECRET="your_secret_key"
```

### 3. Backend Setup

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

Backend will run at: **[http://localhost:8000](http://localhost:8000)**

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm start
```

Frontend will run at: **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Future Improvements

* 🌍 Multi-language README generation
* 📂 Direct GitHub integration (push generated README.md to repos)
* 📊 Dashboard to view and manage previously generated READMEs
* 🎨 Markdown preview with live formatting

---

## 📫 Contact

👤 **Samarth Tikotkar**

* GitHub: [@someear9h](https://github.com/someear9h)
* LinkedIn: [Samarth Tikotkar](https://www.linkedin.com/in/samarth-tikotkar-7532b0328/)
* Email: [tikotkarsamarth@gmail.com](mailto:tikotkarsamarth@gmail.com)
