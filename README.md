# EduAble (EduLearn Accessibility Platform)

EduAble is an accessible, comprehensive learning management platform focused on providing seamless video courses with integrated transcripts, automated captioning, and accessibility features.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation Setup](#installation-setup)
- [Running the Application](#running-the-application)

---

## Project Overview

EduAble aims to deliver highly accessible video content for diverse learners. Instructors can easily upload courses, and the platform utilizes custom integrations to automate captioning, upload transcripts (`.text`, `.srt`), and provide an inclusive player experience.

## Architecture

The platform operates on a microservices-inspired architecture:

- **Frontend** built with Next.js, handling user interface, accessibility, UI logic, and client-side processing using FFmpeg.
- **Backend API** built with Express.js Node.js Server offering secure endpoints, authentication (JWT), and connecting to MongoDB.
- **Automations (n8n)** leveraging n8n webhooks for advanced background processing, including generating automated captions for video uploads and streamlining transcript generation.
- **Storage** using Google Cloud Storage for reliable video streaming and object storage.

## Project Structure

```
EduAble/
│
├── backend/                # Express REST API
│   ├── src/                # Controllers, models, routers, middlewares
│   ├── .env                # Backend environment configuration
│   └── package.json
│
├── inclulearn/             # Next.js Frontend Application
│   ├── src/app/            # App Router (Pages & Layouts)
│   ├── public/             # Static assets
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── package.json
│
├── n8n_workflows/          # N8n Automation Workflows & Webhooks
│
├── LICENSE                 # Project license
└── README.md               # You are here!
```

## Features

- **Interactive Course Player**: Accessible media player optimized for smooth playback, supporting integrated captions and side-by-side transcripts.
- **Video & Audio Processing**: Client-side video manipulation and audio extraction functionalities utilizing WebAssembly (`@ffmpeg/ffmpeg`).
- **Automated Captioning Pipeline**: Seamless integration via n8n webhooks to transcribe extracted audio and process `.srt` creation in the background.
- **Transcript Uploads**: Instructors are empowered to directly upload `.text` or `.srt` files alongside video uploads, linking the transcript data to the video player timeline.
- **Storage Integrations**: Managed video upload streams via Google Cloud Storage to bypass local file limits and handle big files.
- **Secure Authentication**: Built-in JWT and `bcryptjs` protected user boundaries.

## Tech Stack

### Frontend (`inclulearn`)

- Next.js 16
- React 19
- Tailwind CSS 4 & shadcn/ui
- `@ffmpeg/ffmpeg` for web-based multi-media conversion
- Lucide React (Icons)

### Backend (`edulearn-backend`)

- Node.js & Express.js
- MongoDB & Mongoose
- `@google-cloud/storage`
- JSON Web Token (JWT) & bcryptjs

### Workflows (`n8n_workflows`)

- n8n (Node-based automation and proxy handlers)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or newer recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
- Google Cloud Storage Bucket & Service Account Credentials
- [n8n](https://n8n.io/) instance for backend workflows

### Installation Setup

#### 1. Clone the repository

Ensure you are in the project root:

```bash
git clone <repository_url>
cd EduAble
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../inclulearn
npm install
```

#### 4. Configure Environments

- Create a `.env` file in the `backend/` directory referencing your Database, JWT secrets, and Google Cloud settings.
- Create a `.env.local` file in the `inclulearn/` directory for frontend Next.js variables.

## Running the Application

To run the application locally for development, use two terminal sessions.

**Terminal 1: Start Backend**

```bash
cd backend
npm run dev
# The API will typically start on http://localhost:5000 (depending on your .env)
```

**Terminal 2: Start Frontend**

```bash
cd inclulearn
npm run dev
# The Next.js application will open on http://localhost:3000
```
