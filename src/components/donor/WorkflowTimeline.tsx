const workflowSteps = [
  { label: 'Created', done: true },
  { label: 'Matched', done: true },
  { label: 'Picked Up', done: false },
  { label: 'Delivered', done: false },
  { label: 'Verified', done: false }
]
import { Check } from 'lucide-react'

export function WorkflowTimeline() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text dark:text-white">Request Workflow</h3>
        <p className="text-sm text-text-secondary mt-1">
          Track FB-DN-2026-0847 from creation through certificate generation.
        </p>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[720px] gap-0">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step.done ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-text-secondary'
                }`}>
                  {step.done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <p className={`text-[10px] mt-2 text-center max-w-[72px] leading-tight ${
                  step.done ? 'text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {step.label}
                </p>
              </div>
              {i < workflowSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-6 ${step.done && workflowSteps[i + 1]?.done ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
