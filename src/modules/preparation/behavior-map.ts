import type { StudioBundle } from "./studio-model";

export type BehaviorQuestion = { id: string; title: string; category?: string; intent?: string; status: "ready" | "needs-details"; answer: string; outline: string[]; storyIds: string[]; missingFacts?: string[]; followUps?: (string | { q: string; guide?: string })[] };
export type Competency = { id: string; title: string; description: string; questionIds: string[]; storyIds: string[]; practiceGoal: string };

export function getBehaviorMap(bundle: StudioBundle) {
  const questions = bundle.behavior.questions as unknown as BehaviorQuestion[];
  const competencies = (Array.isArray(bundle.behavior.competencies) ? bundle.behavior.competencies : []) as Competency[];
  return { questions, competencies, needsDetails: questions.filter((question) => question.status === "needs-details" || /\[[^\]]+\]/.test(question.answer)) };
}

// Role-specific emphasis changes the argument, never the underlying personal facts.
export const behaviorRoleAngles: Record<string, { temu: string; ai: string }> = {
  motivation: { temu: "从 JD 的 Java、分布式系统和正确性解释吸引你的问题；先向 HR 确认 payments 与 SEM Infrastructure 的团队差异。", ai: "说明为什么想把 AI 工具接入实际客户工作流，结合经过核对的公司信息；不要把另一公司的动机直接换名。" },
  ownership: { temu: "强调负责范围、数据正确性、上线后的排障与持续维护。", ai: "强调从需求理解、集成到用户反馈的完整交付。" },
  teamwork: { temu: "强调多系统边界、各方责任与共同决定如何落到代码和验证。", ai: "强调理解用户的业务阻碍、把技术方案说清并完成交付。" },
  "business-impact": { temu: "说明避免重复处理如何影响成本和正确性，核对金额口径和团队归因。", ai: "说明工作流改善对使用者的价值，并区分观察结果与可量化指标。" },
  "ai-integration": { temu: "将 AI 经历连接到后端 API、数据模型、失败处理与可靠性，不偏离 Java 岗位。", ai: "展开工具输入输出、数据关系、客户端使用方式和真实验证。" },
  initiative: { temu: "说明发现了什么可靠性或效率问题，以及为什么选择这项改进。", ai: "说明怎样把模糊业务需求缩小到能验证的工具或工作流。" },
  "client-service": { temu: "说明内部使用者受什么影响、怎样协调恢复和确认结果。", ai: "说明直接沟通与跟进能力；明确内部客户与外部付费客户的经验边界。" },
  challenge: { temu: "优先讲可解释的状态一致性或异步流程问题，突出调查证据、个人改动与验证。", ai: "强调集成中的不确定结果、失败恢复和实际使用者影响。" },
  leadership: { temu: "讲一个真实决策、如何帮助团队解除阻碍及验收结果，不只说团队人数。", ai: "讲如何对齐目标、分配协作并把可用产品交付给使用方。" },
  learning: { temu: "说明原来不懂什么、如何验证新知识并安全应用到服务。", ai: "说明如何快速验证新工具或协议，而不是只列技术名。" },
  planning: { temu: "说明依赖、风险、上线顺序和验收；只讲实际发生的步骤。", ai: "说明如何确定可交付范围、验证关键假设与吸收反馈。" },
  prioritization: { temu: "用真实同时发生的任务说明用户影响、风险与排序沟通。", ai: "说明客户阻碍、交付承诺与长期维护的取舍。" },
  conflict: { temu: "公平呈现双方理由，用约束、证据和最终决定说明分歧如何解决。", ai: "说明怎样对齐需求与工程现实；不要把普通合作编成冲突。" },
  failure: { temu: "明确本人判断或动作哪里错了、怎样补救、之后实际改变了什么。", ai: "说明如何承担交付或判断失误、修正方案并向相关人沟通。" },
  "self-awareness": { temu: "用实际反馈和已采取的行动说明成长点，不用完美主义等空泛套话。", ai: "选择真实、可改进的能力缺口，说明已经怎么练习和验证。" },
  "evidence-boundaries": { temu: "区分理论与生产实践、stage 与 production、个人与团队成果。", ai: "区分工具集成与模型训练、业务查询与排障指标、旧简历与后续新增工作。" },
};
