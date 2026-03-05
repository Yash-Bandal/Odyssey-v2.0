# Odyssey Study Planner – Setup Instructions

This guide explains how to set up the Odyssey Study Planner locally, including the Supabase backend and the React frontend.



# 1. Prerequisites

Ensure the following tools are installed:

* Node.js 18+
* npm 9+
* Git
* A Supabase account

<br>


---

<br>


# 2. Clone the Repository

```bash
git clone https://github.com/Yash-Bandal/Odyssey-v2.0.git
cd Odyssey-v2.0
```

<br>


---

<br>


# 3. Supabase Backend Setup

## 3.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **New Project**
3. Choose organization
4. Set project name
5. Set database password
6. Choose region
7. Create the project

Wait until the database is fully initialized.


<br>



## 3.2 Get Supabase Credentials

From the Supabase dashboard:

Settings → API

Copy:

* Project URL
* anon public key

You will use these in the frontend environment variables.


<br>



## 3.3 Create Database Tables

Open:

Supabase Dashboard → SQL Editor

Run the SQL scripts provided in:

```
docs/database_backend_docs.md
```

These scripts will create:

* semesters
* subjects
* sessions
* user_rewards
* daily_journal

They will also:

* enable Row Level Security
* create policies
* create indexes

Run the entire script once to initialize the database schema.

<br>


---

<br>


# 4. Frontend Setup

## 4.1 Install Dependencies

Inside the project root:

```bash
npm install
```


<br>



## 4.2 Configure Environment Variables

Create a `.env` file in the root directory.

```
Odyssey-v2.0/.env
```

Add the following:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

These values come from the Supabase dashboard API settings.


<br>

---

<br>



# 5. Run the Development Server

Start the Vite dev server:

```bash
npm run dev
```

Open the app in the browser:

```
http://localhost:5173
```

<br>


---

<br>


# 6. First Time App Flow

When the app starts:

1. User signs up or logs in
2. Email verification must be completed
3. User goes through the **Semester Setup Wizard**
4. Subjects are created for the semester
5. Dashboard becomes available

<br>


---

<br>


# 7. Production Build

To create the production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

<br>


---

<br>


# 8. Deployment

The project can be deployed to platforms such as:

* Netlify
* Vercel
* Cloudflare Pages

Ensure environment variables are configured in the deployment platform.

Required variables:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

<br>


---

<br>


# 9. Common Setup Issues

## Missing Environment Variables

If the app throws a Supabase initialization error:

* Check `.env` file exists
* Restart the dev server

<br>


---

## RLS Blocking Queries

If inserts or queries fail:

* Ensure RLS policies were created
* Ensure the user is authenticated

<br>


---

## Empty Dashboard

This usually means:
* No semester created
* No sessions logged yet

Complete the onboarding wizard to initialize data.

<br>


---

# 10. Project Startup Checklist

1. Create Supabase project
2. Run database SQL scripts
3. Add `.env` variables
4. Install dependencies
5. Start dev server
6. Create user account
7. Complete semester setup

The application should now be fully functional.
