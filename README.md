# Grind ICMC - Website

## What is this?
This is the official website for **Grind ICMC**, a university extension group from the University of São Paulo (USP) - ICMC. We focus on preparing students for Big Tech technical interviews through weekly practice, mock interviews, algorithms, and system design, while also prioritizing soft skills and networking.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Radix UI / Shadcn
- **Icons:** Lucide React & React Icons

## How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Grind-ICMC/website.git
   cd website
   ```

2. **Install dependencies:**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   Create a local `.env` file based on `.env.example`.
   `AUTH_SECRET` is the Auth.js session secret and is different from
   `GITHUB_ADMIN_TOKEN`.

   Required variables:
   - `AUTH_SECRET`: random secret used by Auth.js to sign/encrypt sessions.
   - `AUTH_GITHUB_ID`: GitHub OAuth app client ID for the login flow.
   - `AUTH_GITHUB_SECRET`: GitHub OAuth app client secret for the login flow.
   - `GITHUB_ADMIN_TOKEN`: GitHub token used by the server to read/write the
     `Grind-ICMC/meetings`, `Grind-ICMC/docs`, and `Grind-ICMC/studies`
     repositories.

   For local development, create a GitHub OAuth App with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL:
     `http://localhost:3000/api/auth/callback/github`

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

5. **View the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
Contributions are welcome! If you find any issues or want to add new features, feel free to open an issue or a Pull Request.
