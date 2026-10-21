import type { Focus } from "./model";

export const roleTemplates: Record<Focus, {
  label: string;
  emphasis: string;
  transition: string;
  tags: readonly string[];
  questions: readonly string[];
}> = {
  "payments-java": {
    label: "Payments · Java backend",
    emphasis: "突出 Java 服务、异步事件、事务边界和可靠性。支付领域经验与通用后端经验分开说明。",
    transition: "I'm interested in Java backend work where correct state transitions, reliable asynchronous processing, and production stability matter.",
    tags: ["payments", "java", "kafka", "transactions", "reliability", "distributed", "sql", "ownership"],
    questions: [
      "Why use Kafka here instead of a synchronous service call?",
      "What happens if processing succeeds but committing the consumer offset fails?",
      "How would you investigate a payment timeout without assuming the charge failed?",
      "Which parts did you personally implement, and how did you verify the result?",
    ],
  },
  "backend-platform": {
    label: "Backend · Platform",
    emphasis: "突出接口边界、系统容量、瓶颈证据、发布与故障恢复，说明设计取舍及个人负责范围。",
    transition: "I'm looking for backend work where I can take ownership of clear service boundaries and improve reliability through careful measurement.",
    tags: ["platform", "performance", "api", "distributed", "reliability", "kafka", "ownership"],
    questions: [
      "What was the actual bottleneck, and which observation ruled out other explanations?",
      "How do request threads, database connections, and downstream capacity interact?",
      "What would you measure before scaling out this service?",
      "What was your contribution to the rollout or incident recovery?",
    ],
  },
  "applied-ai": {
    label: "Applied AI · Engineering",
    emphasis: "突出模型集成与服务工程、评估、延迟和质量取舍。区分亲自实现、团队方案与模型本身的能力。",
    transition: "I'm interested in applied AI work that connects models and tools to useful workflows, with clear evaluation and reliable service integration.",
    tags: ["ai", "ml", "evaluation", "python", "data", "latency", "api", "ownership"],
    questions: [
      "What did the model do, and what did your application code do?",
      "How did you evaluate output quality and compare it with the baseline?",
      "What trade-off did you make between latency, cost, and quality?",
      "Which integration or migration decisions were personally yours?",
    ],
  },
};
