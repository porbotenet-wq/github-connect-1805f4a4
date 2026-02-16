import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { workflowStages, canUserExecuteStep, type WorkflowStage } from '../data/workflowStages';

export default function Workflow() {
  const { user } = useAppStore();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'my'>('all');

  const roleSystemName = user?.department || user?.role || 'user';

  const filteredStages = filter === 'my'
    ? workflowStages.map(stage => ({
        ...stage,
        steps: stage.steps.filter(step => canUserExecuteStep(roleSystemName, step)),
      })).filter(stage => stage.steps.length > 0)
    : workflowStages;

  const totalSteps = workflowStages.reduce((acc, s) => acc + s.steps.length, 0);

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">📋 Бизнес-процесс</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {workflowStages.length} этапов • {totalSteps} шагов
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Все этапы</FilterButton>
        <FilterButton active={filter === 'my'} onClick={() => setFilter('my')}>Мои действия</FilterButton>
      </div>

      <div className="space-y-3">
        {filteredStages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            expanded={expandedStage === stage.id}
            onToggle={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
            expandedStep={expandedStep}
            onToggleStep={(stepId) => setExpandedStep(expandedStep === stepId ? null : stepId)}
            roleSystemName={roleSystemName}
          />
        ))}
      </div>

      {filteredStages.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">Нет действий для вашей роли</p>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground border border-border'
      }`}
    >
      {children}
    </button>
  );
}

function StageCard({
  stage, expanded, onToggle, expandedStep, onToggleStep, roleSystemName,
}: {
  stage: WorkflowStage; expanded: boolean; onToggle: () => void;
  expandedStep: string | null; onToggleStep: (stepId: string) => void; roleSystemName: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 active:opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${stage.color}20` }}>
            {stage.icon}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">{stage.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {stage.steps.length} {stage.steps.length === 1 ? 'шаг' : stage.steps.length < 5 ? 'шага' : 'шагов'}
            </div>
          </div>
        </div>
        <span className="text-muted-foreground text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 pb-3">
          {stage.steps.map((step, idx) => {
            const canExecute = canUserExecuteStep(roleSystemName, step);
            const isExpanded = expandedStep === step.id;
            return (
              <div key={step.id} className="mt-2">
                <button
                  onClick={() => onToggleStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    canExecute ? 'bg-background active:opacity-80' : 'bg-background opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: `${stage.color}30`, color: stage.color }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{step.substep}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.initiator} → {step.receiver}</div>
                    </div>
                    {canExecute && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                        Ваше
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-7 mt-1 p-3 bg-background rounded-lg border border-border">
                    <div className="space-y-2 text-[11px]">
                      <DetailRow label="Действие" value={step.action} />
                      <DetailRow label="Срок" value={step.deadline} />
                      <DetailRow label="Документ" value={step.document} />
                      {step.trigger && <DetailRow label="Триггер" value={step.trigger} highlight />}
                      {step.note && <DetailRow label="Примечание" value={step.note} />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className={highlight ? 'text-primary font-medium' : 'text-foreground'}>{value}</span>
    </div>
  );
}
