const express = require('express')
const cors = require('cors')
const uploadRouter = require('./routes/upload')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3002

app.use(cors())
app.use(express.json())

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use('/api/upload', uploadRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
