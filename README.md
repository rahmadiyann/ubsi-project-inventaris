# Pharmacin: Revolutionizing Pharmacy Inventory Management

![Pharmacin Logo](/public/logo.png)

Pharmacin is a cutting-edge web application designed to streamline pharmacy inventory management, enhance operational efficiency, and improve patient care. Built with Next.js, Prisma, and PostgreSQL, this full-stack solution offers a comprehensive set of features for pharmacies of all sizes.

## 🌟 Key Features

- **Intuitive Dashboard**: Real-time insights into inventory levels, sales trends, and expiry dates.
- **User Management**: Role-based access control for administrators, operators, and stakeholders.
- **Inventory Tracking**: Effortlessly manage medicines, suppliers, and categories.
- **Transaction Management**: Record and analyze sales and purchases with ease.
- **Data Visualization**: Interactive charts and graphs for better decision-making.
- **Responsive Design**: Seamless experience across desktop and mobile devices.

## 🚀 Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Charting**: Recharts
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 🏗️ Project Structure

```
pharmacin/
├── app/
│   ├── admin/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   └── ...
├── components/
├── lib/
├── public/
├── prisma/
├── .env
└── README.md
```

## 🔧 Setup and Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables in `.env`
4. Run Prisma migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`
6. Open `http://localhost:3000` in your browser

## 🔐 Authentication

Pharmacin uses JWT for secure authentication. The core authentication logic can be found in:

- `/app/api/auth/route.ts`

## 📊 Dashboard

The dashboard provides a comprehensive overview of the pharmacy's operations utilizing Recharts for data visualization.

## 🤝 Contributing

We welcome contributions to Pharmacin! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## 📄 License

Pharmacin is released under the [MIT License](LICENSE).

---

Pharmacin - Empowering pharmacies with intelligent inventory management.
