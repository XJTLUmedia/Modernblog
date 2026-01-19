
---

# ModernBlog: AI blog for you to review your knowledge

ModernBlog is a high-performance, AI-augmented platform designed for thinkers, learners, and creators. It blends professional engineering with personal development tools, creating a digital garden that grows alongside you.

## The Vision

ModernBlog isn't just a content management system; it’s an intellectual partner. By combining the **Next.js 15** ecosystem with **AI Services**, it transforms static writing into an interactive journey of self-improvement and discovery.
<img width="1856" height="752" alt="Screenshot 2026-01-11 104551" src="https://github.com/user-attachments/assets/d53aae7a-5399-43b4-9ff5-326ef6ebae8e" />
<img width="1822" height="745" alt="Screenshot 2026-01-11 104822" src="https://github.com/user-attachments/assets/39eec852-31bd-44c4-96db-e8ca6a9b6623" />
<img width="1773" height="665" alt="Screenshot 2026-01-11 104749" src="https://github.com/user-attachments/assets/9215bff0-6279-4a55-8e10-afe3f20a6ed4" />

---

## Technical Infrastructure

### Core Framework

* **Next.js 15 (App Router):** Leveraging the latest in React Server Components for a lightning-fast, "instant-load" reading experience.
* **Prisma ORM & PostgreSQL:** Ensuring your thoughts and data are persisted in a robust, structured way (moving beyond local SQLite for production).
* **Tailwind CSS 4:** A streamlined, modern aesthetic that prioritizes readability and focus.

### AI-Integrated Growth Tools

ModernBlog is designed to integrate seamlessly with LLMs (OpenAI, Anthropic) to provide:

* **Intelligent Summarization:** Automatically distill long-form reflections into actionable insights.
* **Semantic Search:** Find connections between your past thoughts using vector-based search.
* **Growth Analytics:** AI-driven tracking of personal milestones and writing patterns.
<img width="1661" height="857" alt="Screenshot 2026-01-11 104233" src="https://github.com/user-attachments/assets/7f33d8de-3cde-4e0d-b34f-7f28abe3b0f3" />

---

## Directory Structure

*Clean, logical, and optimized for both human developers and AI agents.*

```text
src/
├── app/          # The heart of the blog: routes, layouts, and growth-tracking views
├── components/   # Beautiful, accessible UI components (shadcn/ui)
├── lib/          # AI service integrations, Prisma client, and utility logic
├── schemas/      # The shared "Truth": Zod models for your data and AI prompts
└── hooks/        # Reactive logic for a seamless user experience
```
---

## Installation and Setup

### 1. Environment Setup

Clone the repository and install dependencies using npm:

```bash
npm install

```

### 2. Database Initialization

Replace .env.example to actual info and rename it to .env

Generate the Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push

```

Create admin account:

```bash
npx prisma db seed
```

Check if admin exist (optional):

```bash
npx prisma studio
```

### 3. Development Server

Start the local development environment:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 4. Future Consideration

I still lack of ideas on how to integrate (AI image and AI video into summary and reflection part). Therefore, although there are AI generation tool there, it is not fully functional.

Meanwhile, I am lacking ideas on badge creation, I am thinking about a custom badge for admin to add themselves, but that would require some editor logic. I have no idea yet. 

If you would like to contribute, think about improving this part. I would be deeply appreciate if you can further improve this project. 







---

