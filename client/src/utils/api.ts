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
  score: number
  max: number
  passed: boolean
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

// ---------- Login do aluno e Desafio de Presença ----------

export const loginAluno = (data: { email: string; dataNascimento: string; curso: string }) =>
  api.post<{ nome: string; email: string; curso: string }>('/login', data).then((r) => r.data)

export const fetchDesafio = (curso: string) =>
  api.get<DesafioAluno>('/desafio', { params: { curso } }).then((r) => r.data)

export const fetchGuia = (curso: string) =>
  api.get<GuiaEstudo>('/guia', { params: { curso } }).then((r) => r.data)

export const fetchDesafioStatus = (data: { email: string; dataNascimento: string; curso: string }) =>
  api.post<DesafioStatus>('/desafio-status', data).then((r) => r.data)

export const enviarDesafio = (data: {
  email: string
  dataNascimento: string
  curso: string
  respostas: number[]
  codigos?: Record<string, string>
  texto?: string
}) => api.post<DesafioResultado>('/desafio-enviar', data).then((r) => r.data)

export interface DesafioStatus {
  usadas: number
  restantes: number
  aprovado: boolean
  melhorPct: number
}

export interface DesafioResultado {
  acertos: number
  total: number
  pct: number
  prova: { acertos: number; total: number }
  desafio: { acertos: number; total: number }
  aprovado: boolean
  motivo: string
  restantes: number
}

export interface ProvaQuestao {
  id: string
  pergunta: string
  opcoes: string[]
}

export interface DesafioAluno {
  curso: string
  titulo: string
  nivel: string
  tipo: 'codigo' | 'prompt'
  enunciado: string
  notaMinima: number
  limite: number
  prova: ProvaQuestao[]
  minimoCaracteres?: number
  criterios?: { id: string; rotulo: string }[]
  questoes?: {
    id: string
    titulo: string
    descricao: string
    funcao: string
    inicial: string
    testes: { id: string; args: unknown[] }[]
  }[]
}

export interface GuiaEstudo {
  titulo: string
  secoes: { titulo: string; texto: string }[]
}
