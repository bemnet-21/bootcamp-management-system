import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { swaggerUi, swaggerSpecs } from './swagger.js'

import authRoutes from './routes/auth.routes.js'
import connectDB from './db/db.js'
import userRoutes from './routes/user.routes.js'
import resourceRoutes from './routes/resource.routes.js'
import divisionRoutes from './routes/division.routes.js'
import sessionRoutes from './routes/session.routes.js'
import attendanceRoutes from './routes/attendance.routes.js'
import instructorRoutes from './routes/instructor.routes.js'
import adminBootcampRoutes from './routes/adminBootcamp.routes.js'

dotenv.config()

const app = express() 
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/auth', authRoutes)
app.use('/admin/users', userRoutes)
app.use('/sessions', sessionRoutes)
app.use('/resources', resourceRoutes)
app.use("/admin/divisions", divisionRoutes);
app.use('/instructor/bootcamps' ,instructorRoutes)
app.use("/admin/bootcamps" , adminBootcampRoutes);

// app.use('/', attendanceRoutes)
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: 'Server Error', message: err.message || 'Internal server error.' })
})

await connectDB()

app.listen(port, () => {
    console.log("Server is running on port: " + port)
})
