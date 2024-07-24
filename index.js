const express = require('express');
const app = express();
var cors = require('cors');

const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
app.use(cors(), express.json())

const port = process.env.PORT || 5001;
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

client.connect(err => {
    const usersCollection = client.db("mskhalequetraders").collection("users");
    const sellsCollection = client.db("mskhalequetraders").collection("sells");

    // login
    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        const user = await usersCollection.findOne({ email: email.toLowerCase(), password })

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

    // Get Single User by id
    app.get('/user/:id', async (req, res) => {
        const id = req.params.id;

        try {
            const user = await usersCollection.findOne({ _id: ObjectId(id) })
            user &&
                res.send({
                    status: true,
                    user
                })
        }
        catch {
            res.send({
                status: false,
                message: "আইডি মিলছেনা !"
            })
        }
    })

    // Update User By Id
    app.patch('/user/:id', async (req, res) => {
        await usersCollection.updateOne(
            {
                _id: ObjectId(req.params.id),
            },
            {
                $set: req.body
            },
            (err, result) => {
                err &&
                    res.send({
                        status: false,
                        message: "সার্ভার এ সমস্যা, কিছুক্ষন পর আবার চেষ্টা করুন"
                    })
                result &&
                    res.send({
                        status: true,
                        message: "তথ্য হালনাগাদ করা হয়েছে!"
                    })
            }
        )
    })

    // Create Sell
    app.post('/sell', async (req, res) => {
        const sell = req.body;
        
        await sellsCollection.insertOne(sell, (err, result) => {
            err && res.send({
                status: false,
                message: 'নতুন বিক্রি যোগ করা যাচ্ছে না কিছুক্ষন পর আবার চেষ্টা করুন !',
            })
            result && res.send({
                status: true,
                message: 'বিক্রিত মালের হিসাব যোগ করা হয়েছে'
            });
        });
    })

    // get all sells
    app.get('/sells', async (req, res) => {
        await sellsCollection.find().toArray((err, sells) => {
            err && res.send({
                status: false,
                message: "সকল বিক্রি পেতে একটু সময় লাগছে, কিছুক্ষন পর আবার চেষ্টা করুন !"
            })
            res.send({
                status: true,
                sells
            });
        })
    })

    err ? console.log("Error: " + err) : console.log("MongoDB Connected");
})

app.listen(port, () => {
    console.log(`Backend is Running on port ${port}`);
})