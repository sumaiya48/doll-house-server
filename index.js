const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// URL encode the password
const encodedPassword = encodeURIComponent(process.env.DB_PASS);

// Construct MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${encodedPassword}@cluster0.oszsgbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log('MongoDB URI:', uri); // Check if the URI is correct

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const dollCollection = client.db('dollUser').collection('doll');

    app.get('/doll', async (req, res) => {
      const cursor = dollCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/doll/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await dollCollection.findOne(query);
      res.send(result);
    });

    app.post('/doll', async (req, res) => {
      const newToy = req.body;
      try {
        const result = await dollCollection.insertOne(newToy);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to add toy', error });
      }
    });

    app.put('/doll/:id', async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await dollCollection.updateOne(query, { $set: updatedToy });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to update toy', error });
      }
    });

    app.delete('/doll/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const query = { _id: new ObjectId(id) };
        const result = await dollCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Failed to delete toy', error });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Connection error", err);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('doll house');
});

app.listen(port, () => {
  console.log(`Doll house server running on port ${port}`);
});
