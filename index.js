const express = require('express');
const app = express();
var cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
app.use(cors(), express.json())

const port = process.env.PORT || 5000;
const user = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD

const uri = `mongodb+srv://${user}:${password}@mskhalequetraders.twt14kk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.json({
        code: 200,
        message: "Welcome to the Backend Server!",
        status: true
    })
})

async function run() {

    try {
        await client.connect(err => {
            const usersCollection = client.db("mskhalequetraders").collection("users");

            // login
            app.post('/login', async (req, res) => {
                const { email, password } = req.body;

                const user = await usersCollection.findOne({ email, password })

                user ?
                    res.send({
                        message: "লগইন সম্পন্ন হয়েছে!",
                        status: true,
                        user
                    })
                    :
                    res.send({
                        message: "আপনার নাম এবং পাসওয়ার্ড মিলছেনা!",
                        status: false
                    })
            })

            // Create New User
            app.post('/user', async (req, res) => {
                const user = req.body;

                await usersCollection.findOne({ email: req.body.email }, (err, result) => {
                    err && res.send({
                        status: false,
                        message: 'এই নামে নতুন ইউজার তৈরী করা যাচ্ছেনা, অনুগ্রহ করে কিছুক্ষন পর আবার চেষ্টা করুন!',
                    })
                    result ?
                        res.send({
                            status: false,
                            message: 'এই নামে ইউজার ইতিমধ্যে আছে!'
                        }) :
                        usersCollection.insertOne(user, (err, result) => {
                            err && res.send({
                                status: false,
                                message: 'এই নামে নতুন ইউজার তৈরী করা যাচ্ছেনা, অনুগ্রহ করে কিছুক্ষন পর আবার চেষ্টা করুন!',
                            })
                            result && res.send({
                                status: true,
                                message: 'নতুন ইউজার তৈরী করা হয়েছে'
                            });
                        });
                });
            })

            err ? console.log("Error: " + err) : console.log("MongoDB Connected");
        })

    }
    catch (error) {
        console.log(error);
    }
    finally {
        console.log("Closed connection to MongoDB");
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Backend is Running on port ${port}`);
})