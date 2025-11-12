const cors = require('cors')
const express = require('express')
const app = express()
app.use(express.json())
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.eepqhhq.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();



    const database = client.db("AI-Inventory");
    const Modelscollection = database.collection("Models");
    const puchingModelCollection = database.collection('puschasingModel')

    const VarifiedWithfirebase = async (req, res, next) => {
      const authorization = req.headers.authorization
      if (!authorization) {
        return res.status(401).send({ message: 'Unauthorised access' })
      }
      const Token = req.headers.authorization.split(' ')[1]
      if (!Token) {
        return res.status(401).send({ message: 'Unauthorised access' })
      }
      try {
        const decode = await admin.auth().verifyIdToken(Token)
        req.email_token = decode.email
        next()
      } catch {
        return res.status(401).send({ message: 'Unauthorised access' })
      }

    }

    app.post('/allmodels', async (req, res) => {
      const Modelsdata = req.body
      const result = await Modelscollection.insertOne(Modelsdata);
      res.send(result)

    })

    app.get('/allmodels', async (req, res) => {
      const email = req.query.email
      const query = {}
      if (email) {
        query.createdBy = email
      }
      const cursor = Modelscollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues)

    })
    app.get('/leatest/allmodel', async (req, res) => {
      const cursor = Modelscollection.find({}).sort({ createdAt: -1 }).limit(6)
      const allValues = await cursor.toArray();
      res.send(allValues)

    })
    app.get('/purchase', async (req, res) => {
      const email = req.query.email
      const query = {}
      if (email) {
        query.purchaseBy = email
      }
      const cursor = puchingModelCollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues)

    })


    app.get('/allmodels/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await Modelscollection.findOne(query)
      res.send(result)
    })

    app.post('/purchase', async (req, res) => {
      const purcaseData = req.body
      const result = await puchingModelCollection.insertOne(purcaseData)
      res.send(result)
    })


    app.patch('/allmodels/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const Updatedata = req.body
      const Update = {
        $set: Updatedata
      }
      const result = await Modelscollection.updateOne(query, Update);
      res.send(result)


    })

    app.delete('/allmodels/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const deleteResult = await Modelscollection.deleteOne(query);
      res.send(deleteResult)
    })


    app.get('/search', async (req, res) => {
      const search = req.query.search
      const query = { name : {$regex: search, $options:'i'} }
      const cursor = Modelscollection.find(query);
      const allValues = await cursor.toArray();
      res.send(allValues)


    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {


  }
}
run().catch(console.dir);


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is Running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




