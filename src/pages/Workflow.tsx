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
    <div className="p-3 pb-24">
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-condensed text-xl font-extrabold uppercase tracking-wide text-[hsl(var(--white))]">
          ⚙ Бизнес-процесс
        </h1>
        <div className="font-mono text-[8px] text-[hsl(var(--ash))] uppercase tracking-widest mt-1">
          {workflowStages.length} этапов · {totalSteps} шагов
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        <BrutalFilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>Все этапы</BrutalFilterBtn>
        <BrutalFilterBtn active={filter === 'my'} onClick={() => setFilter('my')}>Мои действия</BrutalFilterBtn>
      </div>

      {/* Stages */}
      <div className="flex flex-col gap-1.5">
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
        <div className="text-center py-12">
          <div className="font-condensed text-lg font-bold uppercase text-[hsl(var(--ash))] mb-2">🔍</div>
          <div className="font-mono text-[10px] text-[hsl(var(--ash))]">Нет действий для вашей роли</div>
        </div>
      )}
    </div>
  );
}

function BrutalFilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-md px-3 py-2 font-condensed text-[11px] font-bold uppercase tracking-wide transition-transform active:translate-y-px ${
        active
          ? 'bg-[#0a1f14] border-go/40 text-go shadow-[0_0_20px_rgba(16,185,129,.12),inset_0_0_20px_rgba(16,185,129,.05)]'
          : 'bg-[hsl(var(--rail))] border-[hsl(var(--wire))] text-[hsl(var(--ash))]'
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
    <div className="bg-[hsl(var(--rail))] border border-[hsl(var(--seam))] rounded-md overflow-hidden border-l-[3px]"
      style={{ borderLeftColor: stage.color }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-3 active:opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center text-base font-bold"
            style={{ backgroundColor: `${stage.color}15`, color: stage.color }}>
            {stage.icon}
          </div>
          <div className="text-left">
            <div className="font-condensed text-xs font-bold uppercase tracking-tight text-[hsl(var(--white))]">{stage.name}</div>
            <div className="font-mono text-[7px] text-[hsl(var(--ash))] uppercase tracking-wider">
              {stage.steps.length} {stage.steps.length === 1 ? 'шаг' : stage.steps.length < 5 ? 'шага' : 'шагов'}
            </div>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[hsl(var(--ash))]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="border-t border-[hsl(var(--wire))] px-2 pb-2">
          {stage.steps.map((step, idx) => {
            const canExecute = canUserExecuteStep(roleSystemName, step);
            const isExpanded = expandedStep === step.id;
            return (
              <div key={step.id} className="mt-1.5">
                <button
                  onClick={() => onToggleStep(step.id)}
                  className={`w-full text-left p-2.5 rounded-md transition-colors ${
                    canExecute ? 'bg-[hsl(var(--plate))] active:opacity-80' : 'bg-[hsl(var(--plate))] opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-sm flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-condensed text-[11px] font-bold uppercase tracking-tight text-[hsl(var(--white))] truncate">{step.substep}</div>
                      <div className="font-mono text-[7px] text-[hsl(var(--ash))] mt-0.5 truncate">{step.initiator} → {step.receiver}</div>
                    </div>
                    {canExecute && (
                      <span className="font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex-shrink-0"
                        style={{ backgroundColor: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}40` }}>
                        Ваше
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="ml-7 mt-1 p-2.5 bg-[hsl(var(--plate))] rounded-md border border-[hsl(var(--wire))]">
                    <div className="space-y-1.5">
                      <DetailRow label="Действие" value={step.action} />
                      <DetailRow label="Срок" value={step.deadline} />
                      <DetailRow label="Документ" value={step.document} />
                      {step.trigger && <DetailRow label="Триггер" value={step.trigger} color={stage.color} />}
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

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="font-mono text-[9px]">
      <span className="text-[hsl(var(--ash))] uppercase tracking-wider">{label}: </span>
      <span style={color ? { color } : undefined} className={color ? 'font-bold' : 'text-[hsl(var(--ghost))]'}>{value}</span>
    </div>
  );
}
