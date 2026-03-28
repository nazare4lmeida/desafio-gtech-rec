import axios from 'axios'
import {
  AdminResultRow,
  AdminStats,
  PresencaResult,
  Question,
  RecoveryResult,
  StudentResult,
} from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '/api'

const api = axios.create({ baseURL: API_BASE_URL })

export const fetchQuestions = () =>
  api.get<Question[]>('/questions').then((r) => r.data)

export const updateQuestion = (id: number, data: Partial<Question>) =>
  api.put<Question>(`/questions/${id}`, data).then((r) => r.data)

export const fetchResults = () =>
  api.get<StudentResult[]>('/results').then((r) => r.data)

export const postResult = (result: Omit<StudentResult, 'id' | 'ts'>) =>
  api.post<StudentResult>('/results', result).then((r) => r.data)

export const deleteAllResults = () =>
  api.delete('/results').then((r) => r.data)

export const deleteResult = (id: number) =>
  api.delete(`/results/${id}`).then((r) => r.data)

export const fetchStats = () =>
  api.get<AdminStats>('/stats').then((r) => r.data)

export const fetchRecoveryResults = () =>
  api.get<RecoveryResult[]>('/recovery-results').then((r) => r.data)

export const postRecoveryResult = (data: {
  name: string
  email: string
  course?: string
  score: number
  passed: boolean
  projectScore?: number
}) => api.post('/recovery-results', data).then((r) => r.data)

export const deleteRecoveryResult = (id: number) =>
  api.delete(`/recovery-results/${id}`).then((r) => r.data)

export const fetchPresencaResults = () =>
  api.get<PresencaResult[]>('/presenca-results').then((r) => r.data)

export const postPresencaResult = (data: {
  name: string
  email: string
  course?: string
  presencaPct: number
  previousPct?: number
  challengePct?: number
}) => api.post('/presenca-results', data).then((r) => r.data)

export const deletePresencaResult = (id: number) =>
  api.delete(`/presenca-results/${id}`).then((r) => r.data)

export const fetchAdminResults = () =>
  api.get<AdminResultRow[]>('/admin-results').then((r) => r.data)

export const deleteAdminResults = (
  rows: Array<Pick<AdminResultRow, 'id' | 'module'>>
) => api.delete('/admin-results', { data: { rows } }).then((r) => r.data)

export const validateAdminAccess = (data: {
  email: string
  adminCode: string
}) => api.post<{ ok: boolean }>('/admin-auth', data).then((r) => r.data)