import { createFileRoute } from '@tanstack/react-router'
import DTFDashboard from '@/components/DTFDashboard'

export const Route = createFileRoute('/')({
  component: DTFDashboard,
})
