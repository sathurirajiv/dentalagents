import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Crosshair,
  GitBranch,
  Info,
  ListTodo,
  Maximize2,
  Pencil,
  Play,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkflowNode {
  id: string;
  type: "agent" | "trigger" | "task" | "branch";
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface BranchPath {
  id: string;
  name: string;
  nodes: WorkflowNode[];
}

type AppointmentAgentType = "recall" | "treatment-plan" | "revenue";

// ---------------------------------------------------------------------------
// Data builders
// ---------------------------------------------------------------------------

function buildRecallNodes(agentName: string, locationCount: number): WorkflowNode[] {
  return [
    {
      id: "node-agent",
      type: "agent",
      title: agentName,
      description: `${locationCount} locations`,
      enabled: true,
      order: 0,
      config: {
        name: agentName,
        description: `${locationCount} locations`,
        goals:
          "Autonomously identify patients overdue for recall visits and dispatch personalized outreach to bring them back in for preventive care appointments.",
        outcomes:
          "Increase recall booking rate, reduce manual outreach effort, and maintain consistent preventive care schedules across all locations.",
      },
    },
    {
      id: "node-1",
      type: "trigger",
      title: "When a patient is overdue for a recall visit",
      description:
        "Agent triggers when a patient's last completed appointment date plus their assigned recall interval (e.g. 6 months) has passed and no future appointment exists.",
      enabled: true,
      order: 1,
      config: {
        triggerName: "When a patient is overdue for a recall visit",
        description:
          "Agent triggers when a patient's last completed appointment date plus their assigned recall interval (e.g. 6 months) has passed and no future appointment exists.",
      },
    },
    {
      id: "node-2",
      type: "task",
      title: "Identify recall candidates",
      description:
        "Checks patient records for recall eligibility: valid contact info, no appointment in the future, no outreach in last 14 days, and patient not opted out of communications.",
      enabled: true,
      order: 2,
      config: {
        taskName: "Identify recall candidates",
        llmModel: "fast",
        systemPrompt:
          "You are a patient eligibility checker. Evaluate each patient to determine if they qualify for recall outreach.",
        userPrompt:
          "Check patient {x} Patient.id: verify last appointment date against recall interval, confirm no upcoming appointment, confirm no communication within 14 days, and confirm patient communication opt-in.",
        inputFieldChips: [
          "{x} Patient.lastAppointmentDate",
          "{x} Patient.recallInterval",
          "{x} Patient.nextAppointmentDate",
          "{x} Patient.communicationOptIn",
        ],
        outputFieldChips: ["{x} Patient.isEligibleForRecall", "{x} Patient.recallType"],
      },
    },
    {
      id: "node-branch",
      type: "branch",
      title: "Based on recall type",
      description: "Route patients to the appropriate recall message based on their recall classification.",
      enabled: true,
      order: 3,
      config: {
        paths: [
          {
            id: "path-preventive",
            name: "Preventive recall",
            nodes: [
              {
                id: "node-send-preventive",
                type: "task",
                title: "Send preventive care reminder",
                description:
                  "Dispatches a personalized reminder encouraging the patient to book their routine checkup or cleaning.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Send preventive care reminder",
                  toolOnlyTask: true,
                  toolNames: ["Send SMS", "Send email"],
                },
              },
              {
                id: "node-track-preventive",
                type: "task",
                title: "Track response",
                description:
                  "Monitors for appointment booking or patient reply within 72 hours and updates patient outreach log.",
                enabled: true,
                order: 1,
                config: {
                  taskName: "Track response",
                  toolOnlyTask: true,
                  toolNames: ["Log outreach activity", "Update appointment record"],
                },
              },
            ],
          },
          {
            id: "path-posttreatment",
            name: "Post-treatment recall",
            nodes: [
              {
                id: "node-send-posttreatment",
                type: "task",
                title: "Send post-treatment follow-up",
                description:
                  "Sends a follow-up message to patients who completed a treatment and need a progress check or follow-up appointment.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Send post-treatment follow-up",
                  toolOnlyTask: true,
                  toolNames: ["Send SMS", "Send email"],
                },
              },
            ],
          },
        ] satisfies BranchPath[],
      },
    },
  ];
}

function buildTreatmentPlanNodes(agentName: string, locationCount: number): WorkflowNode[] {
  return [
    {
      id: "node-agent",
      type: "agent",
      title: agentName,
      description: `${locationCount} locations`,
      enabled: true,
      order: 0,
      config: {
        name: agentName,
        description: `${locationCount} locations`,
        goals:
          "Identify patients with open or unaccepted treatment plans and drive follow-up outreach to increase treatment acceptance and appointment conversion.",
        outcomes:
          "Improve treatment plan acceptance rate, recover untapped revenue from open plans, and ensure patients receive clinically necessary care.",
      },
    },
    {
      id: "node-1",
      type: "trigger",
      title: "When a treatment plan has unaccepted items",
      description:
        "Agent triggers when a treatment plan is created or updated and contains procedures not yet accepted or scheduled by the patient.",
      enabled: true,
      order: 1,
      config: {
        triggerName: "When a treatment plan has unaccepted items",
        description:
          "Agent triggers when a treatment plan is created or updated and contains procedures not yet accepted or scheduled by the patient.",
      },
    },
    {
      id: "node-2",
      type: "task",
      title: "Assess treatment urgency",
      description:
        "Classifies each treatment plan by clinical urgency and financial value, checks for recent patient contact, and ensures the patient is reachable.",
      enabled: true,
      order: 2,
      config: {
        taskName: "Assess treatment urgency",
        llmModel: "balanced",
        systemPrompt:
          "You are a treatment plan prioritization assistant. Evaluate treatment plans and assign urgency classifications based on clinical and financial criteria.",
        userPrompt:
          "Evaluate treatment plan {x} TreatmentPlan.id. Assess total outstanding procedure value, classify urgency (urgent / routine / elective), and verify no outreach has occurred in the last 21 days.",
        inputFieldChips: [
          "{x} TreatmentPlan.procedures",
          "{x} TreatmentPlan.totalValue",
          "{x} TreatmentPlan.createdDate",
          "{x} Patient.lastContactDate",
        ],
        outputFieldChips: [
          "{x} TreatmentPlan.urgency",
          "{x} TreatmentPlan.priorityScore",
          "{x} Patient.isEligibleForOutreach",
        ],
      },
    },
    {
      id: "node-branch",
      type: "branch",
      title: "Based on treatment urgency",
      description: "Routes patients to priority or standard outreach based on urgency classification.",
      enabled: true,
      order: 3,
      config: {
        paths: [
          {
            id: "path-urgent",
            name: "Urgent treatment",
            nodes: [
              {
                id: "node-urgent-outreach",
                type: "task",
                title: "Send priority outreach",
                description:
                  "Dispatches immediate outreach via SMS and email emphasizing the clinical urgency and offering direct booking links.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Send priority outreach",
                  toolOnlyTask: true,
                  toolNames: ["Send SMS", "Send email", "Book appointment link"],
                },
              },
              {
                id: "node-track-acceptance",
                type: "task",
                title: "Track acceptance",
                description:
                  "Monitors for treatment acceptance, appointment booking, or patient reply within 48 hours.",
                enabled: true,
                order: 1,
                config: {
                  taskName: "Track acceptance",
                  toolOnlyTask: true,
                  toolNames: ["Update treatment plan status", "Log outreach activity"],
                },
              },
            ],
          },
          {
            id: "path-routine",
            name: "Routine treatment",
            nodes: [
              {
                id: "node-routine-reminder",
                type: "task",
                title: "Schedule follow-up reminder",
                description:
                  "Queues a standard follow-up reminder for 7 days out to give the patient time to respond at their own pace.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Schedule follow-up reminder",
                  toolOnlyTask: true,
                  toolNames: ["Schedule reminder", "Send email"],
                },
              },
            ],
          },
        ] satisfies BranchPath[],
      },
    },
  ];
}

function buildRevenueNodes(agentName: string, locationCount: number): WorkflowNode[] {
  return [
    {
      id: "node-agent",
      type: "agent",
      title: agentName,
      description: `${locationCount} locations`,
      enabled: true,
      order: 0,
      config: {
        name: agentName,
        description: `${locationCount} locations`,
        goals:
          "Identify untapped revenue opportunities from lapsed patients, open treatment plans, and unfilled schedule gaps, then execute targeted reactivation outreach.",
        outcomes:
          "Recover lost revenue by converting open opportunities into booked appointments, reducing schedule gaps, and re-engaging lapsed patients.",
      },
    },
    {
      id: "node-1",
      type: "trigger",
      title: "When a revenue gap is identified",
      description:
        "Agent triggers on a daily schedule to identify patients with open treatment plans and no future appointment, late cancellations creating schedule gaps, or patients lapsed 12+ months.",
      enabled: true,
      order: 1,
      config: {
        triggerName: "When a revenue gap is identified",
        description:
          "Agent triggers on a daily schedule to identify patients with open treatment plans and no future appointment, late cancellations creating schedule gaps, or patients lapsed 12+ months.",
      },
    },
    {
      id: "node-2",
      type: "task",
      title: "Categorize revenue opportunity",
      description:
        "Segments each opportunity by type — open treatment plan, late cancellation gap, or lapsed patient — and calculates estimated recoverable revenue.",
      enabled: true,
      order: 2,
      config: {
        taskName: "Categorize revenue opportunity",
        llmModel: "fast",
        systemPrompt:
          "You are a revenue opportunity analyst. Classify patient opportunities into revenue recovery categories and estimate the potential value of each.",
        userPrompt:
          "Evaluate patient {x} Patient.id. Check for: (1) open unaccepted treatment plans and their combined value, (2) late cancellations within last 30 days creating unfilled schedule gaps, (3) patient last visit date. Output opportunity category and estimated revenue.",
        inputFieldChips: [
          "{x} Patient.openTreatmentPlanValue",
          "{x} Patient.lastCancellationDate",
          "{x} Patient.lastVisitDate",
          "{x} Patient.nextAppointmentDate",
        ],
        outputFieldChips: [
          "{x} Patient.opportunityType",
          "{x} Patient.estimatedRevenue",
          "{x} Patient.outreachPriority",
        ],
      },
    },
    {
      id: "node-branch",
      type: "branch",
      title: "Based on opportunity type",
      description: "Routes each revenue opportunity to the appropriate reactivation or recovery flow.",
      enabled: true,
      order: 3,
      config: {
        paths: [
          {
            id: "path-treatment",
            name: "Open treatment plans",
            nodes: [
              {
                id: "node-plan-followup",
                type: "task",
                title: "Send treatment plan follow-up",
                description:
                  "Sends targeted outreach referencing the patient's specific open procedures and estimated cost, with a direct booking link.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Send treatment plan follow-up",
                  toolOnlyTask: true,
                  toolNames: ["Send SMS", "Send email", "Book appointment link"],
                },
              },
              {
                id: "node-log-revenue",
                type: "task",
                title: "Log revenue opportunity",
                description:
                  "Records the outreach attempt and estimated opportunity value for reporting and outcome tracking.",
                enabled: true,
                order: 1,
                config: {
                  taskName: "Log revenue opportunity",
                  toolOnlyTask: true,
                  toolNames: ["Update opportunity record", "Log outreach activity"],
                },
              },
            ],
          },
          {
            id: "path-lapsed",
            name: "Lapsed patients",
            nodes: [
              {
                id: "node-reactivation",
                type: "task",
                title: "Send reactivation message",
                description:
                  "Dispatches a personalized reactivation offer to patients who haven't visited in 12+ months, highlighting new services or seasonal promotions.",
                enabled: true,
                order: 0,
                config: {
                  taskName: "Send reactivation message",
                  toolOnlyTask: true,
                  toolNames: ["Send SMS", "Send email"],
                },
              },
            ],
          },
        ] satisfies BranchPath[],
      },
    },
  ];
}

function buildNodes(
  agentType: AppointmentAgentType,
  agentName: string,
  locationCount: number,
): WorkflowNode[] {
  if (agentType === "recall") return buildRecallNodes(agentName, locationCount);
  if (agentType === "treatment-plan") return buildTreatmentPlanNodes(agentName, locationCount);
  return buildRevenueNodes(agentName, locationCount);
}

// ---------------------------------------------------------------------------
// Display order computation
// ---------------------------------------------------------------------------

function computePathStartOrders(branchOrder: number, paths: BranchPath[]): number[] {
  const base = branchOrder;
  return paths.reduce<number[]>((acc, p, i) => {
    const prevEnd = i === 0 ? 0 : acc[i - 1]! + paths[i - 1]!.nodes.length;
    return [...acc, base + 1 + prevEnd];
  }, []);
}

// ---------------------------------------------------------------------------
// Canvas visual tokens
// ---------------------------------------------------------------------------

const CARD_W = 340;
const BRANCH_GAP = 200;
const BRANCH_TRUNK_H = 64;
const BRANCH_ARM_H = 56;
const CARD_SHADOW = "shadow-[0_2px_6px_rgba(33,33,33,0.06)]";

// ---------------------------------------------------------------------------
// Read-only chip display
// ---------------------------------------------------------------------------

function ROChips({ chips, moreCount }: { chips: string[]; moreCount?: number }) {
  return (
    <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
      {chips.map((t, i) => (
        <span
          key={`${i}-${t}`}
          className={cn(
            "max-w-full break-all rounded-md border border-primary/25 bg-primary/5 px-2 py-1 text-[13px] leading-snug text-primary",
            (t.startsWith("http") || t.startsWith("www.")) &&
              "border-border bg-muted/30 text-foreground",
          )}
        >
          {t}
        </span>
      ))}
      {moreCount != null && moreCount > 0 && (
        <span className="text-[13px] text-muted-foreground">+ {moreCount} more</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel field helpers
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

function FieldValue({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <p
      className={cn(
        "min-h-[36px] rounded-md border border-border bg-muted/30 px-3 py-2 text-[13px] leading-relaxed text-foreground",
        mono && "whitespace-pre-wrap font-mono text-[12px]",
      )}
    >
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// LLM model display
// ---------------------------------------------------------------------------

const LLM_LABELS: Record<string, string> = {
  fast: "Fast",
  balanced: "Balanced",
  thinking: "Thinking",
  powerful: "Powerful",
};

// ---------------------------------------------------------------------------
// Right panel — read-only node detail
// ---------------------------------------------------------------------------

function NodeDetailPanel({
  node,
  onClose,
}: {
  node: WorkflowNode;
  onClose: () => void;
}) {
  const typeLabel =
    node.type === "agent" ? "Agent details"
    : node.type === "trigger" ? "Trigger"
    : node.type === "branch" ? "Branch"
    : "Task";

  const toolOnly = node.config.toolOnlyTask === true;
  const toolNames = (node.config.toolNames as string[] | undefined) ?? [];
  const contextChips = (node.config.contextChips as string[] | undefined) ?? [];
  const contextMoreCount = node.config.contextMoreCount as number | undefined;
  const inputFieldChips = (node.config.inputFieldChips as string[] | undefined) ?? [];
  const outputFieldChips = (node.config.outputFieldChips as string[] | undefined) ?? [];
  const llmModel = node.config.llmModel as string | undefined;
  const systemPrompt = node.config.systemPrompt as string | undefined;
  const userPrompt = node.config.userPrompt as string | undefined;
  const goals = node.config.goals as string | undefined;
  const outcomes = node.config.outcomes as string | undefined;
  const paths = (node.config.paths as BranchPath[] | undefined) ?? [];

  return (
    <div className="flex w-[300px] shrink-0 flex-col overflow-hidden border-l border-border bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <span className="text-[14px] font-medium text-foreground">{typeLabel}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          aria-label="Close panel"
        >
          <X className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">

          {/* ── Agent ─────────────────────────── */}
          {node.type === "agent" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Agent name</FieldLabel>
                <FieldValue>{(node.config.name as string) ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{(node.config.description as string) ?? node.description}</FieldValue>
              </div>
              {goals && (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Goals</FieldLabel>
                  <FieldValue>{goals}</FieldValue>
                </div>
              )}
              {outcomes && (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Outcomes</FieldLabel>
                  <FieldValue>{outcomes}</FieldValue>
                </div>
              )}
            </>
          )}

          {/* ── Trigger ───────────────────────── */}
          {node.type === "trigger" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Trigger name</FieldLabel>
                <FieldValue>{(node.config.triggerName as string) ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{(node.config.description as string) ?? node.description}</FieldValue>
              </div>
            </>
          )}

          {/* ── Task ──────────────────────────── */}
          {node.type === "task" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Task name</FieldLabel>
                <FieldValue>{(node.config.taskName as string) ?? node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Description</FieldLabel>
                <FieldValue>{node.description}</FieldValue>
              </div>
              {toolOnly ? (
                <div className="flex flex-col gap-1">
                  <FieldLabel>Tools</FieldLabel>
                  <div className="flex flex-col gap-1">
                    {toolNames.map((tn) => (
                      <div
                        key={tn}
                        className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/30 px-3"
                      >
                        <Wrench
                          className="size-4 shrink-0 text-muted-foreground"
                          strokeWidth={1.6}
                          absoluteStrokeWidth
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                          {tn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {llmModel && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <FieldLabel>LLM model</FieldLabel>
                        <Info className="size-3.5 text-muted-foreground" strokeWidth={1.6} absoluteStrokeWidth />
                      </div>
                      <FieldValue>{LLM_LABELS[llmModel] ?? llmModel}</FieldValue>
                    </div>
                  )}
                  {contextChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Context</FieldLabel>
                      <ROChips chips={contextChips} moreCount={contextMoreCount} />
                    </div>
                  )}
                  {inputFieldChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Input fields</FieldLabel>
                      <ROChips chips={inputFieldChips} />
                    </div>
                  )}
                  {systemPrompt && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>System prompt</FieldLabel>
                      <FieldValue mono>{systemPrompt}</FieldValue>
                    </div>
                  )}
                  {userPrompt && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>User prompt</FieldLabel>
                      <FieldValue mono>{userPrompt}</FieldValue>
                    </div>
                  )}
                  {outputFieldChips.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <FieldLabel>Output fields</FieldLabel>
                      <ROChips chips={outputFieldChips} />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Branch ────────────────────────── */}
          {node.type === "branch" && (
            <>
              <div className="flex flex-col gap-1">
                <FieldLabel>Branch name</FieldLabel>
                <FieldValue>{node.title}</FieldValue>
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Paths</FieldLabel>
                <div className="flex flex-col gap-1.5">
                  {paths.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-md border border-border bg-muted/30 px-3 py-2 text-[13px] text-foreground"
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Node card helpers
// ---------------------------------------------------------------------------

function nodeTypeIcon(type: WorkflowNode["type"]) {
  if (type === "trigger")
    return <Zap className="size-[14px] text-[#F57C00]" strokeWidth={1.6} absoluteStrokeWidth />;
  if (type === "branch")
    return (
      <GitBranch className="size-[14px] text-[#5C6BC0]" strokeWidth={1.6} absoluteStrokeWidth />
    );
  return (
    <ListTodo className="size-[14px] text-[#00897B]" strokeWidth={1.6} absoluteStrokeWidth />
  );
}

function nodeTypeLabel(type: WorkflowNode["type"]) {
  if (type === "trigger") return "Trigger";
  if (type === "branch") return "Branch";
  return "Task";
}

function CanvasNodeCard({
  node,
  displayOrder,
  isSelected,
  onSelect,
}: {
  node: WorkflowNode;
  displayOrder?: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const showToggle = node.type !== "trigger";

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ width: CARD_W }}
      className={cn(
        "rounded-lg bg-white p-4 text-left transition-[border-color]",
        CARD_SHADOW,
        isSelected ? "border-2 border-[#1976d2]" : "border-2 border-transparent",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          <span className="flex w-5 shrink-0 justify-center">{nodeTypeIcon(node.type)}</span>
          <span className="text-[11px] leading-[18px] tracking-[-0.22px] text-[#8f8f8f]">
            {nodeTypeLabel(node.type)}
          </span>
        </div>
        {showToggle && (
          <span
            className="relative h-4 w-8 shrink-0 overflow-hidden rounded-full bg-[#BBBFC4]"
            aria-hidden
          >
            <span className="absolute left-[18px] top-[2px] size-3 rounded-full bg-white" />
          </span>
        )}
      </div>

      <div className="mt-2 flex w-full items-baseline gap-0.5">
        <span className="flex w-5 shrink-0 justify-center font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121] tabular-nums">
          {displayOrder ?? node.order}.
        </span>
        <div className="min-w-0 flex-1">
          <span className="block min-w-0 font-sans text-[14px] font-normal leading-[20px] tracking-[-0.28px] text-[#212121]">
            {node.title}
          </span>
          <p className="m-0 mt-1.5 line-clamp-2 max-w-full break-words p-0 text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f]">
            {node.description}
          </p>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Connectors
// ---------------------------------------------------------------------------

function VerticalConnector() {
  return <div className="h-8 w-px bg-[#C5CAD3]" />;
}

function BranchSplitSVG({ pathCount }: { pathCount: number }) {
  const W = CARD_W;
  const G = BRANCH_GAP;
  const totalW = pathCount * W + (pathCount - 1) * G;
  const H = BRANCH_ARM_H;
  const R = 4;
  const COLOR = "#C5CAD3";

  if (pathCount <= 1) {
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLOR} strokeWidth="1" />
      </svg>
    );
  }

  const cx = (i: number) => i * (W + G) + W / 2;
  const leftX = cx(0);
  const rightX = cx(pathCount - 1);
  const hBar = `M ${leftX + R} 0 L ${rightX - R} 0`;
  const arms = Array.from({ length: pathCount }, (_, i) => {
    const x = cx(i);
    if (i === 0) return `M ${x + R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    if (i === pathCount - 1) return `M ${x - R} 0 Q ${x} 0 ${x} ${R} L ${x} ${H}`;
    return `M ${x} 0 L ${x} ${H}`;
  });

  return (
    <svg width={totalW} height={H} style={{ display: "block", overflow: "visible" }}>
      <path d={[hBar, ...arms].join(" ")} stroke={COLOR} strokeWidth="1" fill="none" />
    </svg>
  );
}

function BranchMergeSVG({ pathCount }: { pathCount: number }) {
  const W = CARD_W;
  const G = BRANCH_GAP;
  const totalW = pathCount * W + (pathCount - 1) * G;
  const H = BRANCH_ARM_H;
  const R = 4;
  const COLOR = "#C5CAD3";

  if (pathCount <= 1) {
    return (
      <svg width={W} height={H} style={{ display: "block", overflow: "visible" }}>
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke={COLOR} strokeWidth="1" />
      </svg>
    );
  }

  const cx = (i: number) => i * (W + G) + W / 2;
  const leftX = cx(0);
  const rightX = cx(pathCount - 1);
  const hBar = `M ${leftX + R} ${H} L ${rightX - R} ${H}`;
  const arms = Array.from({ length: pathCount }, (_, i) => {
    const x = cx(i);
    if (i === 0) return `M ${x} 0 L ${x} ${H - R} Q ${x} ${H} ${x + R} ${H}`;
    if (i === pathCount - 1) return `M ${x} 0 L ${x} ${H - R} Q ${x} ${H} ${x - R} ${H}`;
    return `M ${x} 0 L ${x} ${H}`;
  });

  return (
    <svg width={totalW} height={H} style={{ display: "block", overflow: "visible" }}>
      <path d={[hBar, ...arms].join(" ")} stroke={COLOR} strokeWidth="1" fill="none" />
    </svg>
  );
}

function EndChip() {
  return (
    <div className="flex h-7 min-w-[52px] items-center justify-center rounded-full bg-[#1976d2] px-4 text-[12px] font-medium leading-none text-white">
      End
    </div>
  );
}

function PathHeaderChip({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[12px] text-foreground shadow-sm">
      <svg className="size-3.5 shrink-0 text-muted-foreground" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {name}
    </div>
  );
}

function BranchColumnConnector() {
  return <div className="h-10 w-px bg-[#C5CAD3]" />;
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function CanvasToolbar({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="flex items-center divide-x divide-[#e0e3e8] rounded-[14px] bg-white shadow-[0_2px_10px_rgba(33,33,33,0.10)]">
      <div className="flex items-center gap-0.5 px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#f0f2f5]">
          <ArrowDown className="size-3.5 text-[#444]" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <ArrowRight className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      <div className="flex items-center px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <Maximize2 className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      <div className="flex items-center px-2 py-1.5">
        <span className="flex items-center gap-1 text-[13px] leading-5 text-[#444]">
          100%
          <ChevronDown className="size-3.5 text-[#bbbfc4]" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
      <div className="flex items-center gap-0.5 px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#bbbfc4]">
          <Crosshair className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
        <button
          type="button"
          onClick={onEdit}
          title="Edit workflow"
          className="flex size-8 items-center justify-center rounded-lg text-[#555] transition-colors hover:bg-[#f0f2f5] hover:text-[#1976d2]"
        >
          <Pencil className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>
      <div className="flex items-center px-1.5 py-1.5">
        <span className="flex size-8 items-center justify-center rounded-lg text-[#555]">
          <Play className="size-3.5" strokeWidth={1.6} absoluteStrokeWidth />
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main canvas component
// ---------------------------------------------------------------------------

export function AppointmentWorkflowCanvas({
  agentType,
  agentName,
  locationCount = 500,
}: {
  agentType: "recall" | "treatment-plan" | "revenue";
  agentName: string;
  locationCount?: number;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const allNodes = buildNodes(agentType, agentName, locationCount);
  const agentNode = allNodes.find((n) => n.type === "agent")!;
  const mainNodes = allNodes.filter((n) => n.type !== "agent");
  const branchNode = allNodes.find((n) => n.type === "branch");
  const branchPaths: BranchPath[] = branchNode
    ? ((branchNode.config.paths as BranchPath[]) ?? [])
    : [];

  const branchOrder = branchNode?.order ?? 3;
  const pathStartOrders = computePathStartOrders(branchOrder, branchPaths);

  function findNode(id: string | null): WorkflowNode | null {
    if (!id) return null;
    for (const n of allNodes) {
      if (n.id === id) return n;
    }
    for (const path of branchPaths) {
      for (const n of path.nodes) {
        if (n.id === id) return n;
      }
    }
    return null;
  }

  const selectedNode = findNode(selectedNodeId);

  function toggle(id: string) {
    setSelectedNodeId((prev) => (prev === id ? null : id));
  }

  const totalBranchW = branchPaths.length * CARD_W + (branchPaths.length - 1) * BRANCH_GAP;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
      {/* Canvas */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-auto"
        style={{
          backgroundColor: "#f0f2f5",
          backgroundImage: "radial-gradient(circle, #c5cad3 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Toolbar */}
        <div className="pointer-events-none sticky top-0 z-10 flex justify-center px-4 pt-4">
          <div className="pointer-events-auto">
            <CanvasToolbar onEdit={() => {}} />
          </div>
        </div>

        {/* Workflow */}
        <div className="flex flex-1 items-center justify-center px-12 py-8">
          <div className="flex flex-col items-center">

            {/* Agent pill */}
            <button
              type="button"
              onClick={() => toggle(agentNode.id)}
              className={cn(
                "flex items-center gap-2 rounded-[200px] bg-white px-8 py-4 text-left transition-[border-color]",
                CARD_SHADOW,
                selectedNodeId === agentNode.id
                  ? "border-2 border-[#1976d2]"
                  : "border-2 border-transparent",
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden>
                <Sparkles className="size-5 text-[#5C35CE]" strokeWidth={1.6} absoluteStrokeWidth />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="whitespace-nowrap text-[14px] leading-5 tracking-[-0.28px] text-[#212121]">
                  {agentNode.title}
                </span>
                <span className="block text-left text-[12px] leading-[18px] tracking-[-0.24px] text-[#8f8f8f]">
                  {agentNode.description}
                </span>
              </span>
            </button>

            {/* Main chain nodes */}
            {mainNodes.map((node) => (
              <div key={node.id} className="flex flex-col items-center">
                <VerticalConnector />
                <CanvasNodeCard
                  node={node}
                  displayOrder={node.order}
                  isSelected={selectedNodeId === node.id}
                  onSelect={() => toggle(node.id)}
                />
              </div>
            ))}

            {/* Branch section */}
            {branchPaths.length > 0 && (
              <div className="flex flex-col items-center">
                <div className="w-px bg-[#C5CAD3]" style={{ height: BRANCH_TRUNK_H }} />
                <BranchSplitSVG pathCount={branchPaths.length} />

                <div className="flex items-start" style={{ gap: BRANCH_GAP, width: totalBranchW }}>
                  {branchPaths.map((path, pIdx) => {
                    const startOrder = pathStartOrders[pIdx]!;
                    return (
                      <div
                        key={path.id}
                        className="flex flex-col items-center"
                        style={{ width: CARD_W }}
                      >
                        <PathHeaderChip name={path.name} />
                        {path.nodes.map((node) => (
                          <div key={node.id} className="flex flex-col items-center">
                            <BranchColumnConnector />
                            <CanvasNodeCard
                              node={node}
                              displayOrder={startOrder + node.order}
                              isSelected={selectedNodeId === node.id}
                              onSelect={() => toggle(node.id)}
                            />
                          </div>
                        ))}
                        <BranchColumnConnector />
                        <EndChip />
                      </div>
                    );
                  })}
                </div>

                <BranchMergeSVG pathCount={branchPaths.length} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right detail panel */}
      {selectedNode && (
        <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNodeId(null)} />
      )}
    </div>
  );
}
