require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middlewares 
app.use(cors());

async function run() {

      const RoomsDB = client.db("RoomsDB").collection("roomCollection")




  try {



    //all get api
    app.get("/rooms", async (req, res) => {
      try {
        const result = await RoomsDB.find({ Availability: 'available' }).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    });
   













    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
      res.send("Running server");
    });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
