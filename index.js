require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
app.use(bodyParser.json());
app.use(cookieParser());

async function run() {
  const RoomsDB = client.db("RoomsDB").collection("roomCollection");

  try {
    //all get api===========================================
    app.get("/rooms", async (req, res) => {
      try {
        const result = await RoomsDB.find({
          Availability: "available",
        }).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    //     add Booking
    app.get("/room_details/:RoomTitle", async (req, res) => {
      const RoomTitle = req.params;

      try {
        const result = await RoomsDB.findOne(RoomTitle);

        res.send(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/my_bookings", async (req, res) => {
      const userEmail = req.query.email.replace(/'/g, "");
      if (!userEmail) {
        return res.status(400).json({ error: "User email not provided" });
      }
      const UserDatasDB = client.db("UserDatas").collection(userEmail);
      try {
        const result = await UserDatasDB.find().toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //     post api ===============================

    app.post("/room_details", async (req, res) => {
      const userEmail = req.query.email;
      const cardData = req.body;

      if (!userEmail) {
        console.log("not found");
        return res.status(400).json({ error: "User email not provided" });
      }

      try {
        const UserDatasDB = client.db("UserDatas").collection(userEmail);

        const result = await UserDatasDB.insertOne(cardData);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    //update requests

    //req update for set available and unavailable
    app.put("/room_details/:RoomTitle", async (req, res) => {
      try {
        const RoomTitle = req.params;
        const updateDoc = {
          $set: {
            Availability: "unavailable",
          },
        };
        const result = await RoomsDB.updateOne(RoomTitle, updateDoc, {
          upsert: false,
        });
        res.send(result);
      } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    //================== DELETE OPERATIONS
    //Book cancel operation

    app.delete("/my_bookings/delete", async (req, res) => {
      const { deleteBook, email, title } = req.query;
      const UserDatasDB = client.db("UserDatas").collection(email);

      // delete from my bookings
      const myBookingDelete = await UserDatasDB.deleteOne({
        _id: new ObjectId(deleteBook),
      });

      const updateDoc = {
        $set: {
          Availability: "available",
        },
      };
      const updateRoom = await RoomsDB.updateOne(
        { RoomTitle: title },
        updateDoc,
        {
          upsert: false,
        }
      );

      console.log(myBookingDelete, updateRoom);
      res.send();
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
