# Practice Tool

A tool for managing practice routines, tracking time spent on activities, and viewing progress over time.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14.x or v16.x)
- MongoDB (v4.4)

### Installing

1. Clone the repository
   ```
   git clone https://github.com/yourusername/practice-tool.git
   cd practice-tool
   ```

2. Install dependencies
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/practice-app
   ```

4. Start the development server
   ```
   npm run dev
   ```

This will start both the backend server and the React frontend. The backend will be available at `http://localhost:5000` and the frontend at `http://localhost:3000`.

## Running the tests

To run the tests, use the following command:

```
npm test
```

To run the tests with coverage reporting:

```
npm run test:coverage
```

This will generate a coverage report in the `coverage` directory. You can view the HTML report by opening `coverage/lcov-report/index.html` in your browser.

## Continuous Integration

This project uses GitHub Actions for continuous integration. On every push and pull request to the `main` branch, the CI pipeline will:

1. Set up the Node.js environment
2. Start a MongoDB instance
3. Install dependencies
4. Run tests
5. Upload coverage reports to Codecov

You can view the CI workflow file at `.github/workflows/node.js.yml`.

## Built With

- [Node.js](https://nodejs.org/) - The runtime server environment
- [Express](https://expressjs.com/) - The web application framework
- [MongoDB](https://www.mongodb.com/) - The database
- [Mongoose](https://mongoosejs.com/) - Object modeling for Node.js
- [React](https://reactjs.org/) - The frontend library

## License

This project is licensed under the MIT License.