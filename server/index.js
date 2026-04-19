import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import authRoutes from './routes/auth.routes.js'
import connectDB from './db/db.js'
import userRoutes from './routes/user.routes.js'
import resourceRoutes from './routes/resource.routes.js'
import divisionRoutes from './routes/division.routes.js'
import sessionRoutes from './routes/session.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Swagger setup
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bootcamp Management System API',
            version: '1.0.0',
            description: 'API documentation for Bootcamp Management System',
        },
        servers: [
            {
                url: 'http://localhost:' + port,
            },
        ],
    },
    apis: [
        path.join(__dirname, 'routes', '*.routes.js'),
        path.join(__dirname, 'models', '*.js'),
    ], // Absolute path to the API docs
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/auth', authRoutes)
app.use('/admin/users', userRoutes)
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
