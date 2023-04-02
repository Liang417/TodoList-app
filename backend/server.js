const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Todo = require('./model.js');
dotenv.config();

// Connect to mongoDB
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB connection success.');
  })
  .catch((err) => {
    console.log('MongoDB connection fail');
  });

// Middleware
function cors(req, res, next) {
  // Set the CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Respond to the preflight request
    res.statusCode = 204;
    res.end();
  } else {
    next();
  }
}

function parser(req, res, next) {
  if (req.method !== 'GET') {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        req.body = parsedData;
        next();
      } catch (err) {
        res.statusCode = 400;
        res.end('Invalid JSON data');
      }
    });
  } else {
    next();
  }
}

// Route controller
async function todoRouter(req, res) {
  console.log(req.method);
  const id = req.url.split('/')[2];

  // Post new todo
  if (req.url === '/todos' && req.method === 'POST') {
    try {
      const newTodo = await Todo.create(req.body);
      res.end(JSON.stringify(newTodo));
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Create new todo fail.');
    }
  }

  // Get all todos
  else if (req.url === '/todos' && req.method === 'GET') {
    try {
      const todos = await Todo.find().select('content isCompleted');
      res.end(JSON.stringify(todos));
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Get all todos from DB fail.');
    }
  }

  // Update todo's status
  else if (req.url === '/todos' && req.method === 'PATCH') {
    try {
      const { id, isCompleted } = req.body;
      const updateTodo = await Todo.findByIdAndUpdate(id, { $set: { isCompleted } }, { new: true });
      res.end('Update todo success.');
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Update todo fail.');
    }
  }

  //  Update many todos
  else if (req.url === '/todos' && req.method === 'PUT') {
    try {
      const remove = await Todo.deleteMany();
      const todos = await Todo.insertMany(req.body);
      res.end('Create many todos success.');
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Create many todos fail.');
    }
  }

  // Delete many todos
  else if (req.url === '/todos' && req.method === 'DELETE') {
    const { deleteTodos } = req.body;
    try {
      await Todo.deleteMany({ _id: { $in: deleteTodos } });
      res.end('Delete many todos success.');
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Delete many todos fail.');
    }
  }

  // Delete specific todo
  else if (req.url === `/todos/${id}` && req.method === 'DELETE') {
    try {
      await Todo.findByIdAndDelete(id);
      res.end('Delete todo success.');
    } catch (err) {
      res.statusCode = 500;
      console.log(err);
      res.end('Delete todo fail.');
    }
  }

  // If route invalid
  else {
    res.statusCode = 500;
    res.end('Invalid route.');
  }
}

// Create server
const server = http.createServer((req, res) => {
  cors(req, res, () => {
    parser(req, res, () => {
      todoRouter(req, res);
    });
  });
});

const port = process.env.port || 5000;
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
