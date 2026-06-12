/**
 * 流浪动物救助站TNR记录与领养后追踪系统 API服务器
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import './data/seed.js'

import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import animalRoutes from './routes/animals.js'
import tnrRoutes from './routes/tnr.js'
import adoptionRoutes from './routes/adoption.js'
import followupRoutes from './routes/followup.js'
import transferRoutes from './routes/transfer.js'
import stationRoutes from './routes/stations.js'
import userRoutes from './routes/users.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/animals', animalRoutes)
app.use('/api/tnr', tnrRoutes)
app.use('/api/adoption', adoptionRoutes)
app.use('/api/followups', followupRoutes)
app.use('/api/transfers', transferRoutes)
app.use('/api/stations', stationRoutes)
app.use('/api/users', userRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'TNR救助系统API服务正常运行',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API接口不存在',
  })
})

export default app
