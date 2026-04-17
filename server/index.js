import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './db/db.js'
import userRoutes from './routes/user.routes.js'
import resourceRoutes from './routes/resourceRoutes.js'
import divisionRoutes from './routes/division.routes.js'
import authRoutes from './routes/auth.routes.js'
import sessionRoutes from './routes/session.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users', userRoutes)
app.use('/sessions', sessionRoutes)
app.use('/resources', resourceRoutes)
app.use('/divisions', divisionRoutes)


app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Server Error', message: err.message || 'Internal server error.' })
})

await connectDB()

app.listen(port, () => {
    console.log("Server is running on port: " + port)
})
