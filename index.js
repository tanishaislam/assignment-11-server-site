const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    
  ],
  credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.naursbo.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const featureCollection = client.db('studyFeature').collection('studyCard');
    const assignmentCollection = client.db('studyFeature').collection('assignments');

    //server related api

    app.post('/jwt', async (req, res) =>{
      const user = req.body;
      console.log('user for token', user)
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      
      res.
      cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true})
    })




    app.get('/studyCard', async(req, res)=>{
        const cursor = featureCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })


    //assignment
    app.post('/assignments', async(req, res) =>{
      const assignment = req.body;
      console.log(assignment)
      const result = await assignmentCollection.insertOne(assignment)
      res.send(result)
    })
    // app.get('/assignments', async(req, res) =>{
    //   const result = await assignmentCollection.find().toArray()
    //   res.send(result)
    // })
    app.get('/assignments', async(req, res) =>{
      console.log( req.query.email)
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await assignmentCollection.find(query).toArray()
      res.send(result)
    })



    app.get('/assignments/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await assignmentCollection.findOne(query)
      res.send(result)
    })


    app.put('/assignments/:id', async(req, res) =>{
      const id = req.params.id;
      const assignment = req.body;
      // console.log(id, updateAssignment)
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true}
      const updateAssignment = {
        $set: {
          title: assignment.title,
          imgURL: assignment.imgURL,
          mark: assignment.mark,
          difficulty: assignment.difficulty,
          discription: assignment.discription,
          startDate: assignment.startDate
        }
      }
      const result = await assignmentCollection.updateOne(filter, updateAssignment, option);
      res.send(result)

    })

    app.delete('/assignments/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await assignmentCollection.deleteOne(query)
      res.send(result)
    })



 // Send a ping to confirm a successful connection

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})