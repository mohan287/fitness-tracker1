# Fitness Tracker - Full Project

This project is a web-based Fitness Tracker (gym management) scaffold with:
- Node.js + Express backend
- MongoDB (Mongoose)
- JWT authentication
- Role-based dashboards: owner, gym_owner, staff, member
- CRUD UIs for members, staff, payments, attendance
- Password reset via Nodemailer (email) and reset tokens
- Stripe demo payment-intent creation route

## Quick start (local)
1. Install dependencies:
   ```bash
   cd fitness_tracker_project
   npm install
   ```
2. Create a `.env` (copy from `.env.example`) with the following keys:
   ```
   PORT=5000
   MONGO_URI=<your_mongo_connection_string>
   JWT_SECRET=replace_this_with_a_secret

   # SMTP (for email reset) - optional for testing
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=smtp_user
   SMTP_PASS=smtp_pass
   SMTP_FROM=no-reply@fitness.com

   # APP_URL used to build reset link (e.g. https://yourdomain.com)
   APP_URL=http://localhost:5000

   # Stripe secret (for demo payments)
   STRIPE_SECRET=sk_test_replace
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5000/public/login.html` and use the **Create Demo Users** button or register.

## Deploying to production (summary)
- Use MongoDB Atlas for managed database.
- Use Render, Heroku, Vercel (backend via Render) or similar for hosting.
- Set environment variables in your host dashboard.
- Configure an SMTP provider (SendGrid, Mailgun) for email sending.
- For Stripe, add your live secret key in environment for production.

## Notes & Next steps
- Improve security: rate-limit reset routes, validate inputs, restrict registration in production.
- Add role-management UI for owner to assign gym owners to gyms.
- Add file uploads (member photos) and storage (S3).
- Add robust analytics dashboard and charts.

