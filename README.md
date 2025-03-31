# Heart Lens App

![](https://github.com/user-attachments/assets/44589cce-815d-48da-8684-f966a9af28ce)

HeartLen is a web-based tool designed to process photoplethysmography (PPG) signals captured via a webcam. It calculates key health metrics such as heart rate, heart rate variability (HRV), and signal quality using machine learning models. The processed data can be saved to a MongoDB database for further analysis.

## Features

- **Real-time PPG Signal Processing**: Extracts and processes PPG signals using webcam input.
- **Health Metrics Calculation**: Computes heart rate, HRV, and signal quality.
- **Machine Learning Integration**: Leverages TensorFlow.js models for signal quality prediction.
- **Data Storage**: Saves processed data into a MongoDB database for future access.
- **Interactive Visualization**: Displays real-time metrics and charts to provide user feedback.

## Prerequisites

Before running the app, ensure that you have the following:

- **Node.js** (v18 or higher)
- **MongoDB Atlas Account** (or a local MongoDB instance)

## Installation & Setup

### Step 1: Clone the Repository

Clone the project to your local machine:

```bash
git clone https://github.com/your-username/heartlen-app.git
cd heartlen-app
```

### Step 2: Install Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory and add your MongoDB connection string:

```plaintext
MONGODB_URI=your_mongodb_connection_string
```

### Step 4: Start the Development Server

Run the development server:

```bash
npm run dev
```

Then, open your browser and visit:

```plaintext
http://localhost:3000
```

## Connecting to MongoDB

To link the app to your MongoDB instance:

1. **Create a MongoDB Atlas Cluster** or use a local MongoDB instance.
2. Copy the connection string from MongoDB Atlas and paste it into the `.env.local` file as shown above.
3. Ensure your database has a collection named `records` to store PPG data.

## Deployment

To deploy the app:

1. Build the production version:

   ```bash
   npm run build
   ```

2. Deploy the generated `build` folder to your preferred hosting service (e.g., Vercel, Netlify, AWS).

## Repository Structure

The project follows a modular structure to ensure maintainability and readability:

```
/heartlen-app
├── /app
│    ├── api/              # Backend API routes (eg. save-record)
│    ├── components/       # React components (eg. CameraFeed, ChartComponent)
│    ├── db/               # Database utilities (eg. MongoDb)
│    ├── fonts/            # Font files
│    ├── hooks/            # Custom hooks (eg. userPPGProcessing, useSignalQuality)
│    └── models/           # Data models (eg. RecordSchema)
├── /public                # Public assets (e.g., TensorFlow.js model)
├── /types                 # TypeScript types (if applicable)
├── README.md              # Developer instructions
├── .env.local             # Environment variables
├── .eslintrc.json         # ESLint configuration
├── .gitignore             # Git ignore rules
├── next-env.d.ts          # Next.js environment types
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── postcss.config.mjs     # PostCSS configuration
├── README.md              # Developer instructions
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Code Quality

- Ensure your code is clean and well-commented.
- Use meaningful variable names and modularize your logic into reusable components and hooks.
- Follow best practices for React and backend development.

## License

This project is licensed under the **MIT License**.

## Contributions

Contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request for review.

## Author

By Ho Cheuk Hai Jason, this project was developed as part of the **BIOF3003 Digital Health Technology** course at HKU.
