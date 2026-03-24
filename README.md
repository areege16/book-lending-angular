# 📚 Readify — Book Lending System

A digital library web application built with Angular, allowing users to browse books, borrow and return them, while admins can manage the catalog.

🌐 **Live Demo:** [https://book-lending-angular.vercel.app/](https://book-lending-angular.vercel.app/)

---

## ✨ Features

### 🔐 Authentication
- Register and login with JWT
- Role-based routing (Admin / Reader)

### 👤 Reader
- Browse book catalog with search and pagination
- View book details
- Borrow one book at a time
- Return borrowed books
- Profile page with borrowing history and due dates

### 🛠️ Admin
- Manage books (add, edit, delete)
- View all borrowing records with search and pagination
- View overdue/delayed books

### 🎨 General
- User-friendly error messages
- Loading indicators
- Smooth animations
- Responsive design for all devices

---

## 🧰 Tech Stack

- **Framework:** Angular 21
- **Styling:** CSS with custom design tokens
- **Auth:** JWT (JSON Web Token)
- **HTTP:** Angular HttpClient with interceptors

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Angular CLI

### Installation
```bash
git clone https://github.com/areege16/readify.git
cd readify
npm install
ng serve
```

### Environment
Update the API base URL in:
```
src/app/core/config/api.config.ts
```

---

## 📁 Project Structure
```
src/
├── app/
│   ├── core/
│   │   ├── config/
│   │   ├── guards/
│   │   ├── models/
│   │   ├── interceptors/
│   │   └── utils/
│   ├── features/
│   │   ├── auth/
│   │   ├── books/
│   │   └── borrowing/
│   ├── services/
│   ├── shared/
```

---

## 🔌 API

This app integrates with the Book Lending System REST API using JWT authentication.

- 🗄️ **Backend Repository:** [github.com/areege16/book-lending-system](https://github.com/areege16/book-lending-system)
- 📡 **Backend Server:** [book-lending.runasp.net/swagger](https://book-lending.runasp.net/swagger/index.html)

---
