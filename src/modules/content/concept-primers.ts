export type ConceptNode = { title: string; en: string; detail: string; explanationEn: string; chips?: string[] };
export type ConceptPrimer = {
  zh: string; en: string; caption: string; boundary: string;
  columns: { label: string; nodes: ConceptNode[] }[]; connections: string[];
};
const n = (title: string, en: string, detail: string, explanationEn: string, chips?: string[]): ConceptNode => ({ title, en, detail, explanationEn, chips });
const flow = (zh: string, en: string, caption: string, nodes: ConceptNode[], connections: string[], boundary: string): ConceptPrimer => ({ zh, en, caption, columns: nodes.map((node, index) => ({ label: `0${index + 1}`, nodes: [node] })), connections, boundary });

// Teaching companions to the published lessons; no personal project claims.
export const conceptPrimers: Record<string, ConceptPrimer> = {
  "request-and-async-translation": flow(
    "提交成功，只代表系统接下了任务；翻译完成是之后的另一件事。",
    "Accepting a request and completing the work are two different events.",
    "假设的翻译流程：用户先拿到任务 ID，后台稍后完成工作。",
    [n("收到请求", "Accept the request", "后端校验请求并可靠记录任务，再返回任务 ID；此时尚未完成翻译。", "The backend validates and durably accepts the task, then returns its ID.", ["POST", "taskId", "202 Accepted"]), n("后台处理", "Process asynchronously", "worker 取得任务，调用翻译服务；入口不必一直保持原 HTTP 请求。", "A worker performs the translation after the original request has returned.", ["queued → running"]), n("完成与取结果", "Complete and retrieve", "结果经约定的流程回传，系统更新状态并生成输出。客户端可查询状态。", "The workflow records the result and makes the output available.", ["completed", "output / PR"])],
    ["任务排队", "结果写回"], "202 不是翻译成功；图示不规定结果必须通过 Kafka 返回。"),
  "why-and-when-kafka": flow(
    "Kafka 把消息保存下来，让不同程序按自己的进度读取和处理。",
    "Kafka stores messages so different applications can read and process them at their own pace.",
    "一个写入流可以供不同 consumer groups 独立读取；这是能力示例，不是固定业务架构。",
    [n("发布消息", "Publish", "producer 写入任务或事件，不必等待消费方完成业务处理。", "The producer publishes a record without waiting for consumers to finish their work."), n("保留记录", "Retain a log", "Kafka 按配置保留记录。消费后不立即删掉，允许不同读取位置。", "Kafka retains records according to its configuration, independently of a consumer reading them.", ["append", "retain"]), n("独立读取", "Read independently", "翻译、审计等不同消费组可以各自推进；在保留范围内可以重放。", "Separate groups maintain their own progress and can replay retained records.", ["translation group", "audit group"])],
    ["写入", "按各组进度读取"], "立即需要返回计算结果时可直接调用；简单任务队列也可能足够。Kafka 增加运维与一致性设计成本。"),
  "kafka-topics-partitions-groups-offsets": {
    zh: "Producer 向 topic 发送消息，consumer 从这个 topic 读取消息。",
    en: "Producers send messages to a topic, and consumers read messages from that topic.",
    caption: "先沿箭头看消息流向，再点各个框。中间是同一个 topic；右边示例为一个普通 consumer group 的两名成员。",
    columns: [
      { label: "发送方 · Client", nodes: [n("Producer", "Writes messages", "发送消息的程序角色。比如接到翻译请求的后端，可以把任务写入指定 topic。", "A producer is an application role that writes messages to a topic.", ["key + value"])] },
      { label: "Kafka · 保存消息", nodes: [
        n("Topic", "A named stream", "topic 是消息流的名字，例如 translation-requested。写进 topic 的一条消息，实际追加到某一个 partition。", "A topic is a named stream. Each record is appended to one of its partitions.", ["translation-requested"]),
        n("Partition 0", "An ordered log", "一个 partition 是一份按追加顺序排列的记录。这里的 0、1、2 是此分区自己的 offset；本例由 C1 读取。", "A partition is an ordered log. These offsets belong only to partition 0; C1 reads this partition.", ["offset 0", "offset 1", "offset 2"]),
        n("Partition 1", "A separate ordered log", "这是另一份独立记录。它也可以有 offset 0 和 1；本例由 C2 读取。不能用相同 offset 判断跨分区是同一条消息。", "Partition 1 has its own offsets. C2 reads it; offset 1 here is not offset 1 in partition 0.", ["offset 0", "offset 1"]),
        n("Broker", "Stores partition replicas", "broker 是 Kafka 服务节点，存储并提供分区副本。它不是 producer 与 topic 之间额外的一种消息；图中未展开副本和 leader。", "A broker is a Kafka server that stores and serves partition replicas. Replication and leaders are omitted here.")
      ] },
      { label: "读取方 · 一个 group", nodes: [
        n("Consumer group", "A team of consumers", "同一普通消费组分担分区。本例 C1 读 P0、C2 读 P1；另一个组可以独立读两份分区。", "Members of one ordinary consumer group share partitions. Another group can read the same topic independently.", ["group: translators"]),
        n("Consumer C1", "Reads partition 0", "consumer 主动从 broker 获取消息。本例只分配 P0；提交 offset 记录组的恢复位置，不是外部业务成功的证明。", "C1 fetches records from its assigned partition. Committed offsets track restart position, not proof of external business success.", ["P0 → C1"]),
        n("Consumer C2", "Reads partition 1", "C2 处理 P1，可与 C1 并行。消费组的分配会随成员变化而调整。", "C2 processes partition 1 in parallel with C1. Assignments can change as group membership changes.", ["P1 → C2"])
      ] }
    ], connections: ["写入某个分区", "consumer 拉取"],
    boundary: "箭头表示消息流向，不表示 Kafka 主动推送。offset 仅在各自分区内有意义；分区之间没有整体顺序保证。"
  },
  "duplicate-delivery-and-idempotency": flow(
    "同一条消息可能再来一次；幂等让同一业务动作不会因此重复生效。",
    "A message may arrive again; idempotency prevents the same operation from taking effect twice.",
    "假设消费者已经完成数据库变更，但还没提交消费进度就退出。",
    [n("业务已完成", "Effect committed", "数据库已记录任务 T 的结果；但提交 offset 尚未发生。", "The database effect for task T has committed, but the consumer offset has not.", ["task T = done"]), n("重启后再读", "Read again", "恢复位置仍在这条记录之前，因此同一任务可能再次被处理。", "The consumer resumes from an earlier committed position and sees the task again.", ["task T, again"]), n("查同一操作身份", "Deduplicate atomically", "用稳定业务 ID 与原子数据库约束，把去重记录和业务变更放进正确的事务边界。", "Use stable operation identity and atomic storage so deduplication and the effect agree.", ["same T → no second effect"])],
    ["退出 / 重启", "检查已完成动作"], "Kafka 的 exactly-once 不会自动覆盖外部支付接口；外部副作用需配合提供方幂等规则。"),
  "kafka-ordering-and-parallelism": flow(
    "同一分区有顺序，不同分区可并行；先决定哪些消息必须排在一起。",
    "A partition provides order; multiple partitions allow parallel work.",
    "固定分区规则和分区数量下，使用相同 key 将有关联的消息放到同一分区。",
    [n("选择业务 key", "Choose the key", "同一业务实体的事件需要顺序时，用稳定实体 key；不要把整个流量都放到一个热 key。", "Use a stable entity key when related events need order.", ["order-A", "order-B"]), n("分区内排序", "Order within a partition", "A 的事件落同一分区，按追加顺序读取；B 可以在另一个分区。", "Related records share partition order; other keys may use another partition.", ["P0: A1 → A2", "P1: B1 → B2"]), n("分区之间并行", "Parallel across partitions", "同组成员分担分区。若读取后又并发处理，业务完成顺序仍需要应用保证。", "Consumers share partitions, but concurrent processing can still reorder completion.", ["C1: P0", "C2: P1"])],
    ["按 key 分区", "分配给组成员"], "没有跨分区全局顺序；改变分区数或分区策略可能改变 key 的映射。"),
  "concurrency-throughput-latency": flow(
    "并发是在忙多少个，吞吐是每秒做完多少个，延迟是一个要等多久。",
    "Concurrency is work in progress, throughput is completions per second, and latency is time per request.",
    "教学假设：稳定系统每秒完成 100 个请求，平均每个在系统中停留 0.2 秒。",
    [n("吞吐", "Throughput", "这里看成功完成的速率，不只是入口接收的速率。", "Measure completed work per second, not just accepted requests.", ["100 requests / second"]), n("平均停留时间", "Average latency", "从选定边界进入到离开，平均耗时 0.2 秒；排队等待也要算。", "Use average time inside the same system boundary, including queueing.", ["0.2 seconds / request"]), n("平均在途请求", "Average concurrency", "稳态下 Little's Law 给出 100 × 0.2 = 20 个平均在途请求。", "In steady state, Little's Law gives 100 × 0.2 = 20 requests in progress.", ["100 × 0.2 = 20"])],
    ["× 平均时间", "= 平均在途数"], "这是平均值的稳态关系；不能把 p99 代入，也不能套到一直增长的积压上。"),
  "backlog-and-bottlenecks": flow(
    "任务进来得比处理得快，积压就会增长；队列只是把等待保存下来。",
    "A queue grows when work arrives faster than it can be completed.",
    "教学假设：每秒进来 100 个任务，每秒只能完成 80 个，持续一分钟。",
    [n("流入", "Arrivals", "入口每秒接受 100 个任务。", "The system accepts 100 tasks per second.", ["100 / s"]), n("等待", "Backlog", "每秒多出 20 个任务，一分钟新增约 1,200 个。", "The queue adds 20 tasks per second, or about 1,200 in a minute.", ["+20 / s", "+1,200 / min"]), n("完成", "Completions", "处理能力由最窄瓶颈限制；加 worker 不一定能提高下游配额。", "Completion capacity is limited by the bottleneck, which may be downstream.", ["80 / s"])],
    ["进入队列", "worker 取走"], "短时突发可稍后消化；长期流入高于容量，需要降流量、减少工作量或提高真实处理能力。"),
  "payment-timeouts-and-unknown-results": flow(
    "没收到扣款响应，不等于没有扣款。",
    "A missing payment response does not mean the payment failed.",
    "响应在网络中丢失时，客户端与支付方看到的状态可能暂时不同。",
    [n("发起操作 P", "Send operation P", "为这次逻辑支付保留稳定身份，参数与幂等键遵循提供方规则。", "Keep a stable identity for this logical payment operation.", ["operation P"]), n("响应丢失", "Response lost", "提供方可能已经完成，客户端却超时；现在是未知结果。", "The provider may have completed the payment even though the client timed out.", ["client: UNKNOWN", "provider: possibly SUCCESS"]), n("核实原操作", "Resolve the outcome", "查询状态、接收回调或按规则重试同一操作，最终通过核实与对账收敛。", "Resolve the original operation through status checks, events, or a safe retry.", ["same P", "status / event / reconciliation"])],
    ["网络中断", "保留同一身份"], "不要因为超时就使用新身份再次扣款；本图是设计教学，不代表已有支付生产经验。"),
  "java-objects-and-contracts": flow(
    "复制引用不会复制对象；两个变量仍可能改到同一份数据。",
    "Copying a reference does not copy the object.",
    "假设 child = original，两者都引用同一个可变 FileDetail。",
    [n("两个变量", "Two references", "赋值复制引用值，并没有创建第二个 FileDetail。", "Assignment copies the reference, not the FileDetail object.", ["original", "child = original"]), n("同一个对象", "One shared object", "child.path 改成 vendorPath，original.path 也会读到新值。", "Changing child.path changes the object that original also refers to.", ["path = vendorPath"]), n("明确隔离", "Separate ownership", "独立构建输出对象，或者使用不可变数据；注意嵌套集合是否仍共享。", "Create a separate output object or use immutable values, including nested state.", ["input object", "separate output"])],
    ["指向同一处", "需要隔离时"], "这个错误不需要多线程；final 也不会冻结对象内部字段。"),
  "collections-and-complexity": flow(
    "根据怎么访问数据来选集合，再比较时间和内存成本。",
    "Choose a collection based on how you access the data.",
    "例子：把任务和结果按 ID 配对，从反复扫描改为先建索引。",
    [n("反复找", "Repeated scans", "n 个结果分别扫描 n 个任务，最坏比较次数是 O(n²)。", "Scanning all tasks for every result can take O(n²) comparisons.", ["result → scan tasks"]), n("先建 Map", "Build a lookup", "按稳定 ID 建 HashMap，要用额外内存保存引用和索引结构。", "Build a HashMap by stable ID, using extra memory.", ["ID → task"]), n("按键查", "Look up by key", "合理散列下逐个查找通常使整体工作接近 O(n)。", "With suitable hashing, the overall join is typically linear.", ["n lookups"])],
    ["换访问方式", "一次查询一个 key"], "HashMap 不保证顺序且不是线程安全的；key 的 equals 和 hashCode 必须遵守契约。"),
  "java-memory-and-locks": flow(
    "看得见新值，不代表多个步骤不会互相覆盖。",
    "Visibility does not make a multi-step update atomic.",
    "两个线程都执行 count++；图中是一种丢失更新的交错方式。",
    [n("都读到 0", "Both read 0", "线程 A 和 B 分别读取相同旧值，volatile 也不把后续计算和写回合成一步。", "Both threads can read the same old value, even with a volatile counter.", ["A reads 0", "B reads 0"]), n("都写回 1", "Both write 1", "两次递增最终只有 1，因为第二次写入覆盖了第一次的结果。", "Both write 1, so one increment is lost.", ["A writes 1", "B writes 1"]), n("原子更新或锁", "Atomic update or lock", "单计数可用原子递增；多个字段组成的不变量通常需要更完整的保护。", "Use an atomic increment for a counter or a lock for a larger invariant.", ["incrementAndGet", "critical section"])],
    ["分别计算 +1", "保护完整动作"], "Java 锁只协调同一进程内使用同一锁的线程，不会自动锁住其他 Pod。"),
  "thread-pools-and-futures": flow(
    "线程池管理执行任务的线程；Future 表示任务的结果。",
    "A thread pool manages worker threads; a future represents a task’s result.",
    "ThreadPoolExecutor 的简化决策顺序；后面的分支只在前面的接收方式不可用时发生。",
    [n("先用核心线程", "Use core workers", "当前线程数少于 corePoolSize 时，优先新增线程执行任务。", "If there are fewer than corePoolSize threads, start a worker.", ["workers < core"]), n("再尝试排队", "Try the queue", "达到 core 后通常先入队；无界队列可能让任务一直等，而不扩到 max。", "Once core workers exist, try queueing. An unbounded queue can prevent growth toward max.", ["queue.offer(task)"]), n("扩到 max 或拒绝", "Grow or reject", "只有队列无法接收时才继续增加到 max；仍无法接收就执行拒绝策略。", "If the queue cannot accept the task, grow toward max or reject when saturated.", ["queue full → grow", "at max → reject"])],
    ["core 已满", "仅队列无法接收时"], "更多线程不等于更高吞吐。CompletableFuture 负责组合结果，不增加下游容量。"),
  "jvm-and-performance": flow(
    "服务变慢时，先区分是在计算、等待，还是回收内存。",
    "When a service is slow, first distinguish computation, waiting, and garbage collection.",
    "这是调查路线，不是预先认定 GC 或内存泄漏就是根因。",
    [n("观察症状", "Observe", "对齐延迟、错误、CPU、堆使用和 GC 时间，找出变化时间点。", "Correlate latency, errors, CPU, memory, and GC around the incident.", ["latency", "CPU", "GC"]), n("找区分证据", "Differentiate causes", "线程栈看阻塞与热点，JFR 看运行事件，堆分析看对象保留链。", "Use thread evidence, JFR, and retention analysis to distinguish causes.", ["CPU / wait / lock / GC"]), n("改变并复测", "Change and compare", "针对证据修改，再在可比负载下比较完成量、尾延迟与资源。", "Make a targeted change and compare under equivalent load.", ["same load", "before / after"])],
    ["提出竞争假设", "证据支持后"], "GC 回收不可达对象；仍被引用但业务不再需要的对象不会自动被释放。"),
  "spring-transactions": flow(
    "Spring 连接你的组件；数据库事务让一组本地改动一起成功或失败。",
    "Spring wires components together; a database transaction commits local changes together.",
    "普通代理模式下的一次 Web 请求；事务覆盖数据库操作，不自动覆盖远程服务。",
    [n("Controller", "HTTP boundary", "接收 HTTP 输入、校验并调用业务服务。", "Accept and validate HTTP input, then call the service.", ["request → service"]), n("代理与 Service", "Proxy and business logic", "外部调用经过代理时事务拦截器生效，service 执行业务规则。", "A call through the proxy applies transaction advice around business logic.", ["proxy → @Transactional"]), n("Repository / DB", "Local commit", "参与同一事务的数据库变更一起提交或回滚。", "Participating database changes commit or roll back together.", ["write A + write B", "commit / rollback"])],
    ["调用", "同一本地事务"], "同类内部调用可能绕过代理；本地事务不自动包含 Kafka 发布或外部支付。"),
  "mysql-indexes": flow(
    "索引帮助数据库少找一些行，但也增加写入和存储成本。",
    "An index reduces the rows a query must search, at a cost to writes and storage.",
    "按实际查询设计索引，再用执行计划和运行数据验证。",
    [n("查询条件", "Query pattern", "先看 WHERE、JOIN、排序和返回列，不能只按列名盲目建索引。", "Start with filters, joins, ordering, and selected columns.", ["tenant = ?", "status = ?", "ORDER BY created_at"]), n("联合索引", "Composite index", "列顺序影响能定位的范围；索引会缩小需要检查的记录集合。", "Column order determines which ranges the index can efficiently locate.", ["tenant → status → created_at"]), n("核对执行", "Verify the plan", "看 EXPLAIN、扫描行数和实际耗时，同时排查锁等待与连接排队。", "Check the plan, examined rows, and runtime, including lock and connection waits.", ["rows examined", "latency"])],
    ["决定列顺序", "测量效果"], "图示不是说所有查询都适用这个索引；覆盖索引、范围条件和数据分布会改变效果。"),
  "mysql-isolation-and-locks": flow(
    "事务把改动放在一起；并发时，还要保护业务条件不被同时破坏。",
    "Transactions group changes; concurrency control protects the business invariant.",
    "余额 100，两次各扣 80：让检查和更新在数据库中成为一个受保护动作。",
    [n("两次扣款请求", "Competing updates", "如果两个请求各自先读余额再写回，可能都认为钱足够。", "Separate reads and writes can let both requests believe enough funds remain.", ["balance 100", "A: -80", "B: -80"]), n("条件更新", "Conditional update", "用 UPDATE ... SET balance = balance - 80 WHERE balance >= 80，把条件与变更合在一起。", "Combine the condition and update in one database statement.", ["check + update"]), n("检查影响行数", "Check the outcome", "第一个成功后余额 20，另一个不能满足条件；应用根据结果处理拒绝或后续流程。", "After one update leaves 20, the other cannot satisfy the condition.", ["one succeeds", "other: 0 rows"])],
    ["交给数据库协调", "按结果决定"], "具体锁与 MVCC 行为依隔离级别和语句而异；事务不自动让任意读改写逻辑安全。"),
  "redis-cache-consistency": flow(
    "缓存保存一份便于快速读取的副本；它可能比数据库旧。",
    "A cache is a fast copy of data, and that copy can become stale.",
    "Cache-aside 的读取路径：命中直接返回；未命中才查询数据库并回填。",
    [n("先查 Redis", "Read the cache", "命中时返回副本；未命中再走数据库路径。", "Return a cached value on a hit; read the database on a miss.", ["hit → return", "miss → DB"]), n("查数据库", "Read the source", "数据库提供当前可见的权威值，注意并发写入可能与这次读取交错。", "Read the authoritative value, accounting for concurrent writes.", ["read value"]), n("回填副本", "Populate the cache", "把读到的值写回缓存并设置合适的期限；过期不消除所有竞态。", "Store the value with an appropriate expiry; expiry does not eliminate races.", ["cache value + TTL"])],
    ["仅 miss 时", "写回 Redis"], "读旧值后再回填可能覆盖更新；支付余额等关键正确性不能只依赖缓存。"),
  "distributed-locks": flow(
    "分布式锁协调谁现在可以做；幂等控制同一操作是否重复生效。",
    "A distributed lock coordinates access; idempotency controls repeated effects.",
    "租约会过期，所以持有者不能仅凭自己仍在执行就认定仍拥有锁。",
    [n("A 获得租约", "A acquires a lease", "A 获取有期限的锁后开始工作。释放时必须验证自己的持有标识。", "A acquires a time-limited lease and must verify ownership when releasing it.", ["owner A", "TTL"]), n("A 暂停，租约过期", "Lease expires", "A 长时间暂停时租约可能到期；B 可以获得新租约。", "A may pause long enough for the lease to expire and B to acquire a new one.", ["A paused", "B now owns lease"]), n("旧 A 恢复", "Stale worker resumes", "A 恢复后仍可能写入。需要下游验证 fencing token 等机制，并为操作设计幂等。", "A may still write after resuming; downstream fencing and operation idempotency address different risks.", ["reject stale token"])],
    ["时间流逝", "恢复执行"], "锁的互斥与外部副作用只生效一次是两种不同保证；不能用短 TTL 锁替代账务记录。"),
  "http-rpc-and-timeouts": flow(
    "远程调用跨了网络；调用超时后，你可能不知道对方有没有做完。",
    "A remote call crosses a network, so a timeout can leave the outcome unknown.",
    "一次调用同时涉及发送方、网络和接收方，deadline 是整体等待预算。",
    [n("调用方", "Caller", "带着明确的请求、身份和超时预算发起调用。", "Send a defined request with identity and a time budget.", ["deadline budget"]), n("网络", "Network boundary", "请求或响应可能延迟、丢失；能连通也不保证及时完成。", "Requests or responses can be delayed or lost.", ["request →", "← response"]), n("服务方", "Callee", "可能已开始或完成操作。客户端停止等待，不等于服务方自动撤销副作用。", "The server may have started or completed the operation even if the client stops waiting.", ["received / running / done"])],
    ["发出请求", "可能已经执行"], "gRPC 或 Dubbo 简化调用方式，但不会消除网络失败、兼容性和未知结果。"),
  "retries-and-overload": flow(
    "重试会增加流量；只有值得重试且有预算时，才延后再试。",
    "Retries add load, so retry only suitable failures within a bounded budget.",
    "从一次失败开始，先判断重试是否安全，再决定何时重试。",
    [n("失败或超时", "Failure or timeout", "先区分临时故障、永久错误和结果未知；不是所有失败都适合重试。", "Distinguish transient errors, permanent errors, and unknown outcomes.", ["transient?", "safe operation?"]), n("预算与退避", "Budget and backoff", "限制次数和总时长，增加抖动，避免所有客户端同一时刻重试。", "Bound attempts and total time, with backoff and jitter.", ["attempt limit", "deadline", "jitter"]), n("保护依赖", "Protect capacity", "限流、并发上限、熔断和隔离限制压力；负载过高时及时拒绝或排队。", "Use admission control, concurrency limits, and isolation to contain load.", ["bounded in-flight", "reject / defer"])],
    ["可安全重试才进入", "服从容量限制"], "队列和重试不是免费容量；多层各自重试会把一次请求放大成很多次。"),
  "outbox-and-consistency": flow(
    "先把业务改动和待发事件一起存好，再可靠地把事件发出去。",
    "Commit the business change and an outbox event together, then publish the event.",
    "事务内写两张表；事务外发布，接收方仍要处理重复。",
    [n("同一 DB 事务", "One local transaction", "业务记录和 outbox 行一起提交，避免只写业务却丢失待发送事件。", "Commit the business record and outbox row atomically.", ["business row", "outbox row"]), n("发布器", "Relay", "读取未发事件并发布。发送成功后、标记前退出，可能导致再次发送。", "A relay publishes pending events; a crash before marking completion can cause a repeat.", ["publish → mark"]), n("幂等消费者", "Idempotent consumer", "消费者用稳定身份与事务约束避免重复副作用。", "Consumers use stable identity and atomic constraints to prevent duplicate effects.", ["event ID", "deduplicate + effect"])],
    ["提交后读取", "可能重复投递"], "Outbox 解决本地变更与待发事件的原子记录，不等于全系统 exactly-once。"),
  "system-design-capacity": flow(
    "先弄清负载和正确性，再围绕最窄瓶颈选择架构。",
    "Start with workload and correctness, then design around the bottleneck.",
    "设计是一条可检验的推导链，不是技术名词列表。",
    [n("需求与不变量", "Requirements", "确定读写比例、流量峰值、延迟目标，以及哪些副作用不能重复。", "Define traffic, latency targets, and effects that must not repeat.", ["load", "SLO", "correctness"]), n("找容量瓶颈", "Bottleneck", "比较应用、连接池、数据库锁和下游限额，识别限制完成量的资源。", "Find the resource limiting completions across the application and its dependencies.", ["CPU / DB / quota"]), n("设计并压测", "Design and validate", "用扩容、缓存、异步或限流解决对应问题，再测饱和与恢复。", "Choose targeted scaling or load controls, then test saturation and recovery.", ["measure → adjust"])],
    ["推出容量假设", "针对瓶颈"], "应用加副本不会自动扩大共享数据库或第三方服务的容量。"),
  "availability-and-recovery": flow(
    "高可用不只是多放几个副本，还要避免它们一起坏掉。",
    "High availability requires independent failure handling, not just more replicas.",
    "共享依赖是多个应用副本仍可能一起失效的原因。",
    [n("多个应用副本", "Application replicas", "副本可以分担请求，也可在单个实例故障时接管。", "Replicas can share load and cover an individual instance failure.", ["App A", "App B", "App C"]), n("共同依赖", "Shared dependency", "如果都依赖同一故障点，应用副本数再多也会同时受影响。", "All replicas can fail together if a shared dependency fails.", ["one database / bad config"]), n("隔离与恢复", "Isolation and recovery", "规划故障域、切换、健康检查、备份恢复和发布回滚，并实际演练。", "Design failure domains, failover, health checks, restore, and rollback, then test them.", ["RTO", "RPO", "restore test"])],
    ["共同访问", "识别并消除单点"], "异步复制可能丢最近数据；在线副本也不能替代历史备份。"),
  "large-data-and-sharding": flow(
    "大数据先分批处理；分片则把数据和工作分到不同存储节点。",
    "Process large datasets in bounded batches; sharding distributes data across storage nodes.",
    "先控制一次占用的资源，再判断是否需要跨数据库拆分。",
    [n("限定工作集", "Bound the working set", "不要一次加载所有行；用稳定游标、流式输出和有界并发。", "Use stable pagination, streaming, and bounded concurrency instead of loading everything.", ["batch 1", "batch 2", "..."]), n("保存恢复位置", "Checkpoint safely", "明确批次效果与 checkpoint 的顺序；恢复时可能重做最后一批。", "Define commit and checkpoint ordering; recovery may replay the last batch.", ["last completed range"]), n("必要时分片", "Shard when needed", "按访问模式与分布选择分片键，同时考虑热点、跨分片查询与搬迁。", "Choose a shard key around access patterns, hotspots, cross-shard work, and rebalancing.", ["shard A", "shard B"])],
    ["每批完成后", "单库不足才考虑"], "按租户分片不保证流量均匀；一个大租户仍可能成为热点。"),
  "production-debugging": flow(
    "先控制影响，再用证据区分原因，最后验证完整流程恢复。",
    "Control the impact, test possible causes, and verify end-to-end recovery.",
    "排障可以迭代往返；箭头强调不能停在“没有报错”这一步。",
    [n("影响与假设", "Impact and hypotheses", "先确认谁受影响、何时开始，再列出可被证据区分的解释。", "Identify affected users and timing, then list distinguishable explanations.", ["DB slow?", "pool full?", "bad state?"]), n("证据与止损", "Evidence and mitigation", "用日志、指标、trace 排除解释，采取可控回滚或隔离。", "Use logs, metrics, and traces to test causes while applying a safe mitigation.", ["compare timeline", "one targeted change"]), n("恢复与防复发", "Recovery and prevention", "检查用户结果、积压和数据修复，再补回归测试与告警。", "Verify user outcomes, backlog, and data repair, then add prevention.", ["complete workflow", "regression test"])],
    ["逐个排除", "端到端验证"], "API 返回 200 或重启后暂时没报错，都不足以证明业务恢复。"),
  "testing-and-code-review": flow(
    "评审先看业务是否正确，再看证据是否覆盖真正会失败的地方。",
    "Review correctness first, then ask whether tests cover realistic failure boundaries.",
    "从要保护的行为，推导测试与发布检查。",
    [n("关键不变量", "Invariant", "例如重复回调不能重复履约，失败事务不能留下已完成标记。", "For example, duplicate callbacks must not repeat fulfillment.", ["one logical effect"]), n("真实失败边界", "Failure boundaries", "检查并发、重复、乱序、部分失败和重启；必要时连接真实数据库验证。", "Exercise concurrency, duplicates, ordering, partial failures, and recovery.", ["unit + integration", "concurrent requests"]), n("上线后验证", "Production verification", "CI 通过后仍要核对灰度、回滚与实际业务指标。", "After CI, verify rollout, rollback readiness, and production outcomes.", ["deploy → observe"])],
    ["推出测试场景", "通过后仍需观察"], "Mock 的行为来自测试设定，不能证明真实数据库锁和外部接口兼容。"),
  "payment-lifecycle": flow(
    "支付是有状态的流程；退款是后续操作，不是把成功改成失败。",
    "Payments have a lifecycle; a refund is a new operation, not a failed original payment.",
    "简化示例：请求、确认结果、后续退款；具体状态依支付产品而定。",
    [n("支付尝试", "Payment attempt", "记录金额、币种和操作身份；等待期间可能是 pending 或 unknown。", "Record amount, currency, and operation identity while the outcome is pending or unknown.", ["PENDING / UNKNOWN"]), n("核实支付结果", "Confirm the outcome", "通过提供方状态与验签回调确认结果；重复或旧事件不能随意改写状态。", "Confirm the outcome from provider state and verified events, handling duplicates and stale updates.", ["SUCCESS / FAILED"]), n("退款与对账", "Refund and reconcile", "对已成功支付可发起独立退款操作；对账比较内部、提供方和结算记录。", "A successful payment may have a separate refund operation; reconciliation compares records.", ["refund: pending → result", "reconcile records"])],
    ["查询 / 回调", "成功后可发起退款"], "退款也可能失败。金额需按币种使用明确精度；不要把所有币种都当两位小数。"),
};
