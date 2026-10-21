const jd = (slug: string) => ({ courseSlug: "java-backend-review", slug });
const backend = (slug: string) => ({ courseSlug: "backend-systems", slug });

export const jdRoadmap = [
  { title: "请求与异步工作", requirement: "系统功能设计 · 服务协作", outcome: "画出入口、后端、消息、worker 和结果的流程；分清接收成功与业务完成。", lessons: [backend("request-and-async-translation")] },
  { title: "Java 与计算机基础", requirement: "Java 熟练 · 编程基础", outcome: "解释引用与可变状态，选择集合，分析时间和空间成本；不会把共享状态错误都归因于多线程。", lessons: [jd("java-objects-and-contracts"), jd("collections-and-complexity")], reference: "java-language" },
  { title: "线程、异步与 JVM", requirement: "并发开发 · 性能调优", outcome: "解释 volatile、锁、CAS、线程池、Future 和 GC，并推理线程更多为何可能更慢。", lessons: [jd("java-memory-and-locks"), jd("thread-pools-and-futures"), jd("jvm-and-performance")], reference: "java-concurrency" },
  { title: "Spring 与事务", requirement: "Java 服务框架 · 业务建模", outcome: "从 controller 到 service 画调用链，指出代理、回滚和跨系统事务的边界。", lessons: [jd("spring-transactions")], reference: "spring-data-transactions-cache" },
  { title: "Kafka / MQ", requirement: "消息队列 · 分布式开发", outcome: "解释为什么用、何时不用，画出 topic、partition、group、offset，并推理重复、顺序与积压。", lessons: [backend("why-and-when-kafka"), backend("kafka-topics-partitions-groups-offsets"), backend("duplicate-delivery-and-idempotency"), backend("kafka-ordering-and-parallelism")] },
  { title: "MySQL", requirement: "MySQL 原理与场景", outcome: "针对查询设计索引，读执行计划，区分隔离与锁；用条件更新保护一个业务不变量。", lessons: [jd("mysql-indexes"), jd("mysql-isolation-and-locks")] },
  { title: "Redis", requirement: "Redis 原理与场景", outcome: "推演缓存回填竞争、热点失效与租约过期；解释为什么缓存和锁不能替代支付幂等。", lessons: [jd("redis-cache-consistency"), jd("distributed-locks")] },
  { title: "RPC 与分布式一致性", requirement: "RPC · 分布式框架", outcome: "解释网络超时的不确定性、端到端 deadline、数据库与消息的失败窗口，以及 outbox 的保证。", lessons: [jd("http-rpc-and-timeouts"), jd("outbox-and-consistency")] },
  { title: "高并发与系统设计", requirement: "高并发 · 架构设计", outcome: "区分并发、吞吐、延迟，算积压和容量；从瓶颈选择扩容、限流、隔离与重试策略。", lessons: [backend("concurrency-throughput-latency"), backend("backlog-and-bottlenecks"), jd("retries-and-overload"), jd("system-design-capacity")] },
  { title: "高可用与海量数据", requirement: "高稳定性 · 海量数据处理", outcome: "指出共享故障域，定义恢复目标；解释批处理、checkpoint、分片键和热点的取舍。", lessons: [jd("availability-and-recovery"), jd("large-data-and-sharding")] },
  { title: "排障、质量与 Code review", requirement: "质量意识 · 线上排障 · 协作", outcome: "用证据排除竞争假设，说明止损、恢复验证与防复发；为并发和失败边界设计有效测试。", lessons: [jd("production-debugging"), jd("testing-and-code-review")], reference: "spring-production" },
  { title: "支付业务与正确性", requirement: "International payments · 复杂业务", outcome: "推演扣款超时、重复或乱序回调、金额精度、退款与对账；清楚标注假设设计和实际经验。", lessons: [backend("payment-timeouts-and-unknown-results"), jd("payment-lifecycle")] },
];
