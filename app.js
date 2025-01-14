const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const contactsRouter = require('./routes/api/contacts')
const userRouter = require("./routes/api/users");

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

// new
app.use(express.static("public"));
// new

app.use('/api/contacts', contactsRouter)
app.use('/api/users', userRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app
