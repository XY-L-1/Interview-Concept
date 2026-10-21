import type { PublishedContentData } from "./model";

const publishedAt = "2026-10-20T00:00:00.000Z";

const kafkaIntroduction = {
  title: "Apache Kafka: Introduction",
  url: "https://kafka.apache.org/intro/",
};

const kafkaConsumer = {
  title: "Apache Kafka 4.1: KafkaConsumer — groups, offsets, and processing",
  url: "https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html",
};

const kafkaDesign = {
  title: "Apache Kafka 4.1: Design — delivery semantics and transactions",
  url: "https://kafka.apache.org/41/design/design/",
};

const handlingOverload = {
  title: "Google SRE: Handling Overload",
  url: "https://sre.google/sre-book/handling-overload/",
};

export const backendCourse: PublishedContentData = {
  courses: [
    {
      id: "course_backend_systems",
      slug: "backend-systems",
      publishedRevisionId: "course_revision_backend_systems_1",
    },
  ],
  courseRevisions: [
    {
      id: "course_revision_backend_systems_1",
      courseId: "course_backend_systems",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      order: 1,
      title: {
        en: "Backend Systems, from the First Request",
        zhHans: "从一次请求理解后端与分布式系统",
      },
      description: {
        en: "Follow a hypothetical translation pipeline to understand asynchronous work, Kafka, failures, capacity, and payment timeouts. Build the reasoning before the terminology.",
        zhHans:
          "沿着一个假设的翻译流水线，从请求与响应开始，逐步理解 Kafka、失败、顺序、系统容量与支付超时。所有数字均为教学假设。",
      },
      sectionRevisionIds: [
        "section_revision_backend_requests_1",
        "section_revision_backend_kafka_reliability_1",
        "section_revision_backend_parallelism_1",
        "section_revision_backend_capacity_failures_1",
      ],
    },
  ],
  sections: [
    { id: "section_backend_requests", courseId: "course_backend_systems" },
    {
      id: "section_backend_kafka_reliability",
      courseId: "course_backend_systems",
    },
    { id: "section_backend_parallelism", courseId: "course_backend_systems" },
    {
      id: "section_backend_capacity_failures",
      courseId: "course_backend_systems",
    },
  ],
  sectionRevisions: [
    {
      id: "section_revision_backend_requests_1",
      sectionId: "section_backend_requests",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: { en: "Requests and Deferred Work", zhHans: "请求与稍后完成的工作" },
      description: {
        en: "Separate accepting a request from completing a job, then decide whether a message platform is useful.",
        zhHans: "先分清接收请求与完成任务，再判断为什么需要消息平台。",
      },
      questionRevisionIds: [
        "question_revision_backend_async_translation_1",
        "question_revision_backend_why_kafka_1",
      ],
    },
    {
      id: "section_revision_backend_kafka_reliability_1",
      sectionId: "section_backend_kafka_reliability",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: { en: "Kafka and Business Correctness", zhHans: "Kafka 与业务正确性" },
      description: {
        en: "Locate records and consumption progress, then reason about failures between business writes and offset commits.",
        zhHans: "看清消息与消费进度，再分析业务写入和进度提交之间的失败窗口。",
      },
      questionRevisionIds: [
        "question_revision_backend_kafka_concepts_1",
        "question_revision_backend_idempotency_1",
      ],
    },
    {
      id: "section_revision_backend_parallelism_1",
      sectionId: "section_backend_parallelism",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: { en: "Order, Parallelism, and Measurement", zhHans: "顺序、并行与测量" },
      description: {
        en: "Choose where work may run in parallel and distinguish concurrency, throughput, and latency.",
        zhHans: "判断哪些工作可以并行，再准确区分并发数、吞吐与延迟。",
      },
      questionRevisionIds: [
        "question_revision_backend_kafka_ordering_1",
        "question_revision_backend_performance_metrics_1",
      ],
    },
    {
      id: "section_revision_backend_capacity_failures_1",
      sectionId: "section_backend_capacity_failures",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: { en: "Backlogs and Uncertain Outcomes", zhHans: "积压与结果不确定" },
      description: {
        en: "Calculate queue growth, identify bottlenecks, and transfer failure reasoning to a hypothetical payment integration.",
        zhHans: "计算积压、定位瓶颈，再把失败推理迁移到假设的支付集成。",
      },
      questionRevisionIds: [
        "question_revision_backend_backlog_1",
        "question_revision_backend_payment_timeout_1",
      ],
    },
  ],
  questions: [
    {
      id: "question_backend_async_translation",
      courseId: "course_backend_systems",
      slug: "request-and-async-translation",
    },
    {
      id: "question_backend_why_kafka",
      courseId: "course_backend_systems",
      slug: "why-and-when-kafka",
    },
    {
      id: "question_backend_kafka_concepts",
      courseId: "course_backend_systems",
      slug: "kafka-topics-partitions-groups-offsets",
    },
    {
      id: "question_backend_idempotency",
      courseId: "course_backend_systems",
      slug: "duplicate-delivery-and-idempotency",
    },
    {
      id: "question_backend_kafka_ordering",
      courseId: "course_backend_systems",
      slug: "kafka-ordering-and-parallelism",
    },
    {
      id: "question_backend_performance_metrics",
      courseId: "course_backend_systems",
      slug: "concurrency-throughput-latency",
    },
    {
      id: "question_backend_backlog",
      courseId: "course_backend_systems",
      slug: "backlog-and-bottlenecks",
    },
    {
      id: "question_backend_payment_timeout",
      courseId: "course_backend_systems",
      slug: "payment-timeouts-and-unknown-results",
    },
  ],
  questionRevisions: [
    {
      id: "question_revision_backend_async_translation_1",
      questionId: "question_backend_async_translation",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "What happens between submitting a translation request and receiving the finished translation?",
          zhHans: "提交翻译请求和拿到翻译结果之间，发生了什么？",
        },
        englishInterviewAnswer: {
          answer:
            "I would first separate the HTTP request from the translation job. In a hypothetical system, a portal sends a POST request containing the source file and target language. The backend validates it, records a job, and arranges for the work to run. It can then return a job ID and a processing status instead of keeping the connection open until translation finishes. A worker picks up the job, performs the translation, and sends the result back through the system's chosen mechanism. The backend updates the job state, and the user can retrieve the result later. If Kafka carries the request, successfully publishing a record still does not mean the translation succeeded. I would trace the same job ID across acceptance, execution, and completion. The trade-off is that asynchronous processing separates the caller's waiting time from the job's execution time, but requires explicit status, failure handling, and a way to obtain the result.",
          keyPoints: [
            "HTTP acceptance and business completion are different events.",
            "A job ID connects the request, worker execution, and result.",
            "Asynchronous processing requires visible status and failure handling.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "先想一个日常动作：在网页选择文件和目标语言，然后点“翻译”。浏览器是调用方，它把一次 HTTP 请求发给后端服务；后端是正在运行、接收并处理请求的程序。POST 是这次请求采用的方法，API 则约定地址、输入格式和响应含义。代码仓库保存程序源码，运行中的服务执行源码构建出的程序，两者职责不同。",
            "一次请求与响应可以很快结束，一项业务任务却可能持续更久。“已收到请求”“已接受任务”“翻译已完成”是三个不同事实。异步业务流程让调用方在任务结束之前先得到受理结果，稍后再取得最终结果；这与某段 Java 代码是否使用异步 API 不是同一个问题。",
          ],
          coreMechanism: [
            "本课使用匿名的假设系统：入口验证文件与语言，创建任务标识 jobId，并安排翻译工作。若响应表示任务已接受，系统就需要定义工作如何可靠保存和调度；仅仅把任务放在一个随进程消失的临时变量里，不能提供重启后的恢复保证。",
            "worker 是执行后台任务的程序角色。它取得任务、调用翻译能力，再把结果传回。具体系统可以通过 HTTP 回调、数据库或另一个消息流传回；本课先把这个箭头称为“结果传回”，不默认存在独立结果 topic。",
            "入口可以返回 jobId 和 processing 状态，调用方通过查询接口等方式了解进度。HTTP 202 的含义是请求已接受但处理尚未完成；这个状态码本身不会替应用实现持久化、排队或可靠恢复。",
            "用同一个 jobId 关联任务记录、消息、日志和结果，才能追踪任务停在哪里。关联 ID 帮助找到同一任务，但只有后续业务规则才能决定重复请求是否应执行一次。",
          ],
          examples: [
            {
              kind: "diagram",
              title: "先把每个箭头的含义说清楚",
              descriptionZhHans:
                "网页 → POST /translation-jobs → 后端受理 → 安排任务 → worker 翻译 → 结果传回 → 更新任务状态。后端可先向网页返回 jobId=T42、status=processing；这个响应与稍后完成翻译是两条不同时间线。安排任务可采用 Kafka，也可采用其他机制。",
            },
            {
              kind: "prose",
              title: "受理成功，执行仍可能失败",
              explanationZhHans:
                "假设文件校验通过，但 worker 后来调用翻译模型时发现不支持该语言。入口曾成功返回受理响应，与最终任务标记 failed 并不矛盾。页面需要显示可理解的失败原因；不能一直把“请求发出去了”展示成“翻译完成”。",
            },
          ],
          useCases: [
            "翻译、文档转换和视频处理等任务耗时不稳定，调用方可以稍后获取结果的场景。",
            "梳理一个陌生系统时，先识别入口、任务、执行者、状态与结果，再调查具体技术。",
          ],
          commonMistakes: [
            "把 HTTP 2xx、Kafka 发布确认或日志中的“已发送”当成整条业务已完成。每一种确认都只覆盖自己的边界。",
            "认为换成消息就会缩短实际翻译耗时。入口响应可能更快，但任务仍要等待排队和执行。",
            "看到一个 jobId 就认定系统已经实现幂等。标识只有被实际的去重或状态规则使用时才产生相应保证。",
          ],
          followUpQuestions: [
            {
              question: "所有翻译任务都需要异步吗？",
              answer:
                "不需要。若工作很短、延迟稳定，而且用户必须立即取得结果，同步响应可能更简单。应比较响应期限、任务耗时、故障恢复和开发运维成本。",
            },
            {
              question: "怎样判断结果到底通过什么方式传回？",
              answer:
                "从 worker 完成后的调用、写入和发布代码追踪，并结合消息配置、接口与运行记录核对。没有这些证据时，流程图应保留“结果传回”，而不是补画一个想象中的 topic。",
            },
          ],
          interviewSummary:
            "先区分请求受理与任务完成，再沿 jobId 解释入口、后台执行、结果传回和状态。明确每个成功信号实际证明了哪一步。",
        },
        practice: [
          {
            question: "页面拿到 202 和 jobId 后，能立刻显示翻译成功吗？下一步应该显示或查询什么？",
            answer:
              "不能。先显示已接受或处理中，并通过该 jobId 查询任务状态或等待约定通知。只有拿到可信的完成状态与结果，才显示翻译成功；失败也需要明确呈现。",
          },
          {
            question: "worker 完成翻译的日志存在，但用户查询不到结果。至少还要检查哪些边界？",
            answer:
              "检查结果是否成功传回、任务状态与结果是否成功保存、查询是否使用同一个 jobId，以及读取路径是否读到了正确版本。worker 的完成日志只证明一个局部动作，不能排除后续写入或查询问题。",
          },
        ],
        sources: [
          {
            title: "RFC 9110: 202 Accepted",
            url: "https://www.rfc-editor.org/rfc/rfc9110.html#section-15.3.3",
          },
          kafkaIntroduction,
        ],
      },
    },
    {
      id: "question_revision_backend_why_kafka_1",
      questionId: "question_backend_why_kafka",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "What is Kafka, and when would you choose it over direct HTTP calls or a simpler job queue?",
          zhHans: "Kafka 是什么？什么时候用它，什么时候直接调用 HTTP 或用简单队列？",
        },
        englishInterviewAnswer: {
          answer:
            "Kafka is a distributed event streaming platform. Producers append records to topics, and consumers read them independently. I think of it as a retained log that applications can react to and, within its retention rules, read again. In a translation pipeline, Kafka can separate accepting work from executing it and buffer a temporary burst. If translation completion also drives notifications and analytics, separate consumer groups can process the same events at their own pace. However, Kafka introduces operational work, delayed completion, and duplicate-handling requirements. I would choose direct HTTP when the caller needs an immediate result and the dependency fits the response budget. A simpler job queue can be enough when one workflow needs workers and acknowledgements without independent replayable streams. These are architectural trade-offs rather than a ranking of technologies. Kafka does not perform the translation, make a slow database faster, or guarantee that every external business action happens exactly once.",
          keyPoints: [
            "A retained distributed log supports independent consumption and replay.",
            "Choose according to waiting, fan-out, replay, and operational needs.",
            "A message platform does not remove business reliability work.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "事件描述已经发生的事实，例如“翻译任务已受理”或“翻译已完成”。消息是程序之间传递的数据，既可以表达事实，也可以表达“请执行翻译”的任务请求。Kafka 保存并分发这些记录；真正执行翻译的是消费消息的业务程序。",
            "可以把 Kafka 的日志想成一组可继续往后写的记录本。分布式表示存储和服务由集群中的多个节点协作承担；副本与配置帮助系统应对部分故障，但不能概括成任何故障都不会丢数据。记录按配置保留，读取过通常不会因此马上删除。",
          ],
          coreMechanism: [
            "若入口直接等待 worker 翻译，worker 变慢会延长入口请求，worker 不可用也会立即影响调用方。把已接受的工作可靠交给消息平台后，入口和执行端可以按各自节奏工作；调用方则需要接受结果稍后完成。",
            "当短时间提交的任务多于 worker 能处理的任务，消息可以暂存。它提供等待空间，任务并没有凭空消失。若长期流入比处理更快，积压仍会增长，最终受存储、保留时间和业务期限限制。",
            "如果同一条“翻译已完成”需要驱动通知与分析，独立消费组可以各自读取和记录进度。通知暂时变慢，不必让分析组停在相同进度。本文若举出 completion 事件流，均是额外的教学设计假设，不代表前一题的结果传回已经采用这种实现。",
            "HTTP、任务队列和 Kafka 可以在同一系统合作。HTTP 解决请求与响应通信，简单队列常用于分配待执行工作，Kafka 的保留日志尤其适合独立消费和重放。其他队列也可能支持广播或重试，选型要比较具体产品能力与需求，不能只比较名称。",
          ],
          examples: [
            {
              kind: "prose",
              title: "先提出需要，再选择组件",
              explanationZhHans:
                "假设只有一个每天运行一次的文件翻译任务，没有重放或多个下游的要求。数据库任务表加 worker，或现成任务队列，可能已足够。再假设后续多个独立系统都要按自己的进度处理大量完成事件，并需要在保留期内重新分析；Kafka 的日志模型就更值得评估。",
            },
            {
              kind: "prose",
              title: "一个适合同步调用的反例",
              explanationZhHans:
                "用户打开任务详情页，后端从存储读取当前状态并立即返回。这条查询通常直接采用请求与响应即可。为每次读取都创建 Kafka 消息，再等待另一条消息回答，会增加关联、等待和超时处理；需要具体收益才能证明这种复杂度合理。",
            },
          ],
          useCases: [
            "多条下游流程独立响应同一批事件，或需要保留记录用于后续重放和新消费者接入。",
            "任务允许异步完成，并确有短时流量缓冲或独立扩展执行端的需求。",
          ],
          commonMistakes: [
            "为了“高并发”三个字直接引入 Kafka，却说不出哪一步需要解耦、等待或重放。",
            "把 Kafka 当成无限容量的保险箱，忽略任务最晚完成时间、保留策略和持续过载。",
            "认为保留消息就已经保留了所有业务状态。日志、任务数据库与外部执行结果有不同职责，需要协调。",
          ],
          followUpQuestions: [
            {
              question: "Kafka 和 HTTP 能同时存在吗？",
              answer:
                "可以。网页通过 HTTP 提交任务，入口把工作发给 Kafka，worker 又可能通过 HTTP 调用翻译服务。应逐段解释通信方式和失败边界，而不是把整个系统只贴上“异步”或“同步”的标签。",
            },
            {
              question: "使用 Kafka 后入口是不是完全不依赖下游？",
              answer:
                "依赖被改变了，并未消失。入口仍依赖必要的校验、任务存储与发布机制；最终业务仍依赖 worker 和翻译服务。消息让它们在时间上更独立，但可靠性和容量仍需共同设计。",
            },
          ],
          interviewSummary:
            "把 Kafka 解释为可保留、可独立读取的分布式事件日志，再用解耦、短时缓冲、多个消费方和重放说明选择理由，同时交代延迟和运维成本。",
        },
        practice: [
          {
            question: "“请求慢，所以加 Kafka 就能让用户更快拿到翻译”这句话哪里不完整？",
            answer:
              "Kafka 可能让提交接口更早返回，但用户拿到最终翻译的时间仍包括排队、执行和结果保存。应分别测量提交响应延迟和任务完成延迟，并确认业务允许稍后完成。",
          },
          {
            question: "一个已可靠运行的简单任务队列没有重放和独立下游需求，是否必须迁移到 Kafka？",
            answer:
              "没有这个结论。先列出目前解决不了的需求，再比较可靠性、吞吐、保留与运维成本。组件更复杂本身不是迁移收益。",
          },
        ],
        sources: [kafkaIntroduction, kafkaDesign],
      },
    },
    {
      id: "question_revision_backend_kafka_concepts_1",
      questionId: "question_backend_kafka_concepts",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "How do producers, topics, partitions, consumer groups, and offsets fit together?",
          zhHans: "producer、topic、partition、consumer group 和 offset 怎么连起来？",
        },
        englishInterviewAnswer: {
          answer:
            "A producer writes records to a topic, which is a named stream divided into partitions. Each partition is an ordered log, and a record's offset identifies its position within that partition. Consumers read records, while a consumer group represents one coordinated consumption of the stream. With ordinary Kafka consumer groups, each assigned partition belongs to one consumer in that group at a time. Several consumers in the same group therefore share the work. Separate groups can read the same records independently and maintain different progress. In a hypothetical completion-event stream, result indexing, notifications, and analytics would use separate groups if each needs every relevant event. Each group tracks committed offsets per partition so it can resume after a restart. A committed offset normally identifies the next record to process, rather than a globally unique message or proof that the business operation succeeded. The application's processing and commit strategy determines what that progress actually means.",
          keyPoints: [
            "A topic contains partitions; an offset is local to a partition.",
            "Instances share work inside one group; groups consume independently.",
            "Committed offsets are progress markers, not business receipts.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "producer 是发送记录的程序角色，consumer 是读取记录的程序角色。同一个服务可以在某条流程里消费、在另一条流程里生产。topic 是有名字的一类记录，例如假设中的 translation-requested；broker 是 Kafka 集群中负责存储和提供记录的服务节点。",
            "一个 topic 可以分成多个 partition。每个 partition 都有自己的追加顺序和 offset。offset 像该分区记录本里的位置编号：partition 0 的 offset 12 与 partition 1 的 offset 12 可以同时存在，它们不是同一条消息。",
          ],
          coreMechanism: [
            "consumer group 表达一份独立的消费进度。本课讨论普通 Kafka consumer group 的分区分配模式：同一组内，一个分区在同一时刻只分给一个 consumer；一个 consumer 可以负责多个分区。进程加入或退出时，分配可能重新调整。",
            "组内共享工作与组间独立读取要分清。若两个翻译 worker 属于同一组，它们分摊任务；若搜索索引、通知与分析都需要看到完成事件，应使用各自的消费组。把三种业务放进同一组，可能让每条消息只到其中一个处理者。",
            "consumer 的当前位置表示已从 Kafka 拉取到哪里，已提交位置表示记录下来的恢复点；拉取到应用内存不等于业务处理已完成。已提交的 offset 通常是下一条应处理的记录位置，需要由应用选择合适的提交时机。",
            "重放是把某组读取位置调整到仍被保留的较早记录，或让新组从所选位置开始。它受保留策略与现存数据限制；重放还会再次运行业务处理，不能把“可以重读”直接理解为“可以无副作用地重做”。",
          ],
          examples: [
            {
              kind: "diagram",
              title: "同一日志，三份独立进度",
              descriptionZhHans:
                "教学假设：系统另行发布 translation-completed 事件到一个有 4 个分区的 topic。索引组有 2 个实例，各负责部分分区；通知组与分析组分别保存自己的进度。通知组可能落后，其他组仍能继续读取。这里的 completion topic 是假设设计，不是对结果传回机制的事实陈述。",
            },
            {
              kind: "prose",
              title: "offset 不能脱离分区与消费组解释",
              explanationZhHans:
                "假设分区 P0 中任务 T42 位于 offset 12。通知组完成相关业务后提交下一位置 13；分析组可能仍停在 10。不能只说“消息 13 已完成”：首先它是哪个分区的位置，其次是哪一组的进度，最后还要知道应用采用怎样的业务处理与提交规则。",
            },
          ],
          useCases: [
            "画出消息拓扑时，标明生产者、topic、分区、消费组与实例，检查共享工作和独立订阅是否符合业务意图。",
            "排查恢复、重放和积压时，以消费组与分区为单位定位进度。",
          ],
          commonMistakes: [
            "以为每新增一个同组 consumer，就会收到一份完整消息副本。普通消费组是在实例间分配分区。",
            "把 offset 当成全系统唯一业务 ID，或把已提交 offset 当成翻译、支付等业务成功证据。",
            "把保留时长当成无限重放承诺，或者忽略重放会再次触发外部副作用。",
          ],
          followUpQuestions: [
            {
              question: "普通消费组有 4 个分区、6 个 consumer，会发生什么？",
              answer:
                "在稳定的分区分配下，至多 4 个 consumer 获得分区，至少 2 个没有分区可消费。这是分区分配的并行边界；不意味着整个业务吞吐就必然等于某个固定数字。",
            },
            {
              question: "通知组重放，会不会把分析组的 offset 一起改掉？",
              answer:
                "不同组有独立提交进度，正常情况下修改通知组的读取位置不会同时修改分析组。但两个业务若共用外部数据库或重复副作用，仍可能在业务资源上相互影响。",
            },
          ],
          interviewSummary:
            "先说明一条记录写到 topic 的某个分区，再说明组内如何分工、组间如何独立读取，最后把 offset 定位成每组每分区的恢复进度。",
        },
        practice: [
          {
            question: "通知和分析都要处理每条完成事件，却使用同一个 group.id。应该先检查什么？",
            answer:
              "检查它们是否被当成同一消费组的实例分摊了分区。若两种业务需要独立消费，应配置不同消费组，并各自确认起始位置、保留数据和副作用处理。",
          },
          {
            question: "消费组提交 P1 的 offset 25，能证明任务 T42 的翻译文件已经保存吗？",
            answer:
              "不能单凭这个值证明。先确认 T42 对应哪个分区与记录，再核对处理顺序、提交规则和结果存储。offset 是恢复进度标记；业务完成需要对应的业务证据。",
          },
        ],
        sources: [kafkaIntroduction, kafkaConsumer],
      },
    },
    {
      id: "question_revision_backend_idempotency_1",
      questionId: "question_backend_idempotency",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "Why can a Kafka record be processed again, and how does business idempotency help?",
          zhHans: "为什么 Kafka 消息可能再次处理？业务幂等到底保证什么？",
        },
        englishInterviewAnswer: {
          answer:
            "A consumer's business update and its Kafka offset commit are often separate operations. Suppose a worker saves a translation result and then crashes before committing its offset. After recovery, it may receive the record again even though the result already exists. Committing first creates the opposite risk: a crash can skip work that never completed. I would normally design for possible redelivery and make the business operation idempotent. That means repeating the same logical operation has the intended effect once, using a stable business key and an atomic constraint or state transition. For example, one transaction could insert a processed-operation key and save the corresponding result, so neither can commit alone. An in-memory flag or a separate check-then-write is insufficient under crashes or concurrency. External notifications or payment calls need their own coordination. Kafka transactions can coordinate Kafka records and offsets, but do not automatically include an external database or payment provider.",
          keyPoints: [
            "A crash between business success and offset commit can cause redelivery.",
            "Idempotency needs a stable operation identity and atomic enforcement.",
            "Kafka transactional guarantees have a defined system boundary.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "幂等可以先用一个问题理解：同一逻辑操作被调用两次，最终是否仍只有一次应有的业务效果？它不要求函数只执行一次，也不要求两次日志完全一样；关键是重复请求不会多创建一份应当唯一的结果或副作用。",
            "去重需要先定义“同一操作”。翻译任务可能按 jobId 标识，也可能细到任务、文件版本和目标语言。若两种目标语言被错误地当成同一操作，就会漏做合法任务；若每次重试都生成新标识，又无法识别重复。",
          ],
          coreMechanism: [
            "假设消息在 offset 12：先保存结果，再提交下一位置 13。若结果已保存、提交前进程崩溃，恢复后仍可能从旧位置读到它。这种窗口说明“业务先完成再提交”需要配合重复处理规则。",
            "如果改成先提交 13，再执行翻译或保存结果，进程可能在提交后立即崩溃。恢复从 13 继续时，12 对应的工作却没有完成。把 offset 提前不能同时解决丢失与重复。",
            "一种数据库内方案是假设有 operationKey 的唯一约束：在同一事务中插入已处理记录并保存对应结果，重复键走已存在结果路径；事务失败则两者一起回滚。这里既要唯一约束，也要原子业务写入，仅在写入前查一次“不存在”会遇到并发竞态。",
            "如果业务还要发邮件、创建代码评审或调用支付渠道，这些动作并不自动属于数据库事务。可以进一步学习可靠待发送记录、下游幂等接口与状态核实；不要把“数据库写入一次”扩大成“整条流水线所有外部动作恰好一次”。",
            "Kafka 的幂等生产者与 Kafka 事务解决特定 Kafka 边界的问题。事务可把向 Kafka 写出的记录和消费进度协调起来；外部数据库、HTTP 接口或扣款效果仍需对应系统参与设计。消息发布本身与本地任务写入的协调，也需要单独考虑。",
          ],
          examples: [
            {
              kind: "prose",
              title: "重复消息进入同一个业务约束",
              explanationZhHans:
                "假设 T42、文件版本 v3、目标语言 fr 构成同一翻译操作。第一次保存成功后重读消息，消费者发现该操作结果已原子提交，就返回现有结果或安全跳过重复写入。T42-v3-de 是另一项合法任务，应当正常执行。该例只描述假设方案，不代表任意已有系统已经采用它。",
            },
            {
              kind: "prose",
              title: "为什么内存 Set 不够",
              explanationZhHans:
                "consumer A 在自己的 Set 记下 T42，consumer B 的 Set 并不知道；A 重启后 Set 也可能消失。即使两者共用一个持久化“已看见”标记，若标记先写成功、结果后写失败，也会错误跳过工作。因此要协调“记录完成”与“业务真正完成”。",
            },
          ],
          useCases: [
            "消费消息、接收 webhook、重试 HTTP 请求或恢复后台任务时，处理可能重复的逻辑操作。",
            "对每个副作用分别定义业务键、原子边界、失败恢复和可验证的完成状态。",
          ],
          commonMistakes: [
            "说“Kafka 保证 exactly-once，所以数据库或支付调用绝不会重复”，没有说明事务覆盖范围。",
            "先查是否处理过，再无约束地写入；两个并发处理者可能同时通过检查。",
            "忽略毒消息与长期失败，只无限重试同一个外部故障。重复安全与重试次数、退避、告警和人工处置是不同问题。",
          ],
          followUpQuestions: [
            {
              question: "消息 eventId 唯一，是否就足以保证业务只执行一次？",
              answer:
                "不一定。同一业务操作可能因生产端重试或不同入口产生不同事件 ID。需要明确去重的是消息实例还是逻辑业务操作，并在正确的副作用边界执行约束。",
            },
            {
              question: "安全地跳过重复消息后，还要推进消费进度吗？",
              answer:
                "通常需要在确认该操作已完成且重复路径安全后，按既定策略推进进度，否则同一记录可能反复重读。若并行处理一批记录，不能跨过尚未完成的较早记录随意提交。",
            },
          ],
          interviewSummary:
            "用“业务已成功、offset 未提交就崩溃”的窗口解释重复，再说明稳定业务键和原子约束如何限制副作用。明确外部系统仍有自己的可靠性边界。",
        },
        practice: [
          {
            question: "结果已写入，offset 提交失败。重启后同一消息又来了，是 Kafka 没按设计工作吗？",
            answer:
              "不一定。恢复点仍在旧位置，重新读取符合这种处理与提交顺序。应让结果写入的重复路径安全，再按策略推进进度；不能仅因为重读就判断平台发生了数据错误。",
          },
          {
            question: "表中已处理标记先提交，业务结果的下一次写入失败。这个去重设计有什么问题？",
            answer:
              "它把“已完成”与真正业务效果拆成两个可能独立成功的动作。下一次处理可能看到标记就跳过，留下永远缺失的结果。在同一数据库内，应考虑将两者放进同一事务并使用唯一约束；跨系统副作用需另行协调。",
          },
        ],
        sources: [kafkaConsumer, kafkaDesign],
      },
    },
    {
      id: "question_revision_backend_kafka_ordering_1",
      questionId: "question_backend_kafka_ordering",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "How do keys and partitions affect ordering and parallelism?",
          zhHans: "消息的 key 和分区如何影响顺序与并行？",
        },
        englishInterviewAnswer: {
          answer:
            "Kafka orders records within a partition, not across an entire topic. A key can route related records to the same partition under a consistent partitioning strategy, so I would choose it from the business ordering requirement. For translation, an independent unit might be a job, file version, and target language. Different units may run in parallel, while updates for the same unit need a controlled order. However, the log order is not automatically the order in which real-world events happened or processing finished. Several producers can publish in an unexpected sequence, and an asynchronous consumer can finish a later record first. State transitions and versions therefore still matter. With ordinary consumer groups, the number of assigned consumers is bounded by the partition count. More partitions can enable more parallel consumption but also introduce cost and may change key routing. A hot key or a saturated database can remain a bottleneck regardless of how many consumers are added.",
          keyPoints: [
            "Partition order is a log guarantee, not a global business-time order.",
            "Choose keys according to the unit that needs ordered handling.",
            "Partitions enable parallel assignment; downstream capacity still limits work.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "先问“谁需要先后顺序”。一个法语翻译任务与另一个德语任务可能互不依赖，可以同时做；同一个文件版本的“处理中”和“已完成”更新则不能随意互相覆盖。业务需要的顺序范围，决定怎样分组相关工作。",
            "partition 内有记录追加顺序，Kafka 没有为所有分区提供一个统一的全局顺序。key 是分区选择的输入之一；在分区数和分区策略保持一致等条件下，相同 key 通常会被送到同一分区。key 本身不是锁、幂等保证或业务版本检查。",
          ],
          coreMechanism: [
            "假设相关更新用 jobId、文件版本和语言组成 key。把需要按顺序观察的更新送到同一分区，消费者就能按该分区的日志顺序读取；不同分区则可以由同组不同实例并行读取。具体 key 必须由真正的依赖关系决定，而不是看到文件名就直接选择。",
            "分区顺序只表示记录在日志里的顺序。假设生产者 B 较晚观察到的旧状态，反而在生产者 A 的新状态之后写入；日志仍有序，但业务需要通过版本或允许的状态转换拒绝旧状态覆盖新状态。",
            "读取顺序也不等于完成顺序。消费者把两条记录同时交给异步线程执行，第二条可能先结束。若业务要求同一 key 顺序完成，就需要相应的按 key 调度、串行处理或状态校验，并协调进度提交。",
            "在普通消费组中，增加 consumer 只有拿到可分配的分区才增加读取并行度；即使有更多分区，下游连接、数据库和外部翻译服务也可能先达到上限。若大部分流量集中在同一个 key，它仍集中到某个分区，形成热点。",
            "增加分区不是无代价的开关。某些按 key 哈希取模的路由会随分区数改变，使同一 key 的新旧记录分散在不同分区；扩容需要评估顺序迁移、负载和运维成本。",
          ],
          examples: [
            {
              kind: "diagram",
              title: "先决定独立工作单元",
              descriptionZhHans:
                "教学假设：T42-v3-fr 的相关记录进入 P0，T42-v3-de 的记录进入 P1。两个语言任务可并行；P0 内仍需维护同一任务状态。若业务其实要求整份文档所有语言完成后才能发布，就再由聚合状态判断“全部完成”，不能从某个分区的一次完成直接推出整个任务完成。",
            },
            {
              kind: "prose",
              title: "日志有序，业务仍可能倒退",
              explanationZhHans:
                "假设 P0 依次出现 version=3、status=completed 与较晚到达的 version=2、status=processing。按日志读取没问题，但无条件最后写入覆盖会把业务状态改回旧版本。应比较版本或允许的状态转换；“同一分区”不能代替这条规则。",
            },
          ],
          useCases: [
            "需要保持同一订单、账户或任务更新关系，同时允许不同业务对象独立处理的事件流。",
            "排查热点、并行处理引起的乱序，或评估分区与消费者扩展是否真的有收益。",
          ],
          commonMistakes: [
            "把 partition 内顺序说成整个 topic 全局有序，或把日志顺序说成业务事件真实发生顺序。",
            "为了顺序把所有记录设成同一个 key，随后又期望增加 consumer 能分摊这个热点。",
            "认为 consumer 数量、线程数或分区数越多，数据库和外部调用就一定完成得越快。",
          ],
          followUpQuestions: [
            {
              question: "所有消息都进一个分区，是否就是最安全的设计？",
              answer:
                "它提供单分区日志顺序，但会限制普通组内的分区消费并行度，也没有自动解决重复、副作用和业务版本。应只对确实存在顺序依赖的工作保留相应约束。",
            },
            {
              question: "为什么分区平均流量低，仍可能有严重积压？",
              answer:
                "平均值可能掩盖一个热分区或热 key。应按分区查看积压、消费速率与延迟，再检查该分区任务是否更重、某个 key 是否占大部分流量或下游是否存在局部瓶颈。",
            },
          ],
          interviewSummary:
            "先从业务依赖定义顺序范围，再解释 key 路由与分区并行。日志顺序、业务版本和执行完成顺序要分别分析。",
        },
        practice: [
          {
            question: "有 6 个分区，普通消费组已有 6 个 consumer。再加到 12 个，是否一定让处理速度翻倍？",
            answer:
              "不会仅因增加实例就翻倍。稳定分配下至多 6 个实例拥有分区；还要看原有实例是否繁忙、分区负载和下游容量。需要对瓶颈提出可验证假设，而不是从实例数直接推出吞吐。",
          },
          {
            question: "同一分区按 A、B 顺序读出后，消费者异步执行，B 先写入数据库。Kafka 的分区顺序保证被违反了吗？",
            answer:
              "没有。日志读取顺序与应用异步任务完成顺序不同。如果业务要求 A 先完成，应在应用端维护相应的顺序与进度规则，并防止较旧状态覆盖较新状态。",
          },
        ],
        sources: [kafkaIntroduction, kafkaConsumer, kafkaDesign],
      },
    },
    {
      id: "question_revision_backend_performance_metrics_1",
      questionId: "question_backend_performance_metrics",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "What is the difference between concurrency, throughput, and latency?",
          zhHans: "并发数、吞吐和延迟分别是什么？为什么不能混着说？",
        },
        englishInterviewAnswer: {
          answer:
            "Concurrency is how many operations are in progress at a given time. Throughput is how many complete per unit of time, and latency is how long one operation takes across a defined boundary. I would specify whether I am measuring HTTP acceptance or the whole translation job, because those are different timelines. As a hypothetical example, a stable system completing one hundred jobs per second with an average end-to-end time of two tenths of a second has about twenty jobs in the system on average. That relationship uses averages over the same boundary and does not describe a continuously growing backlog. More threads can increase useful concurrency when work spends time waiting, but can also increase contention, memory use, and database pressure. I would evaluate completed throughput together with error rate, average and tail latency, queue age, and resource saturation. A larger number of in-flight requests alone is not evidence of better performance.",
          keyPoints: [
            "Concurrency counts work in progress; throughput counts completions over time.",
            "Latency needs a clear start and end boundary.",
            "More concurrency helps only when capacity and bottlenecks allow it.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "并发数回答“现在有多少项工作尚未结束”。这些工作可能在计算、等待网络、排队或等待数据库，具体包含哪些要先定义统计范围。它不是注册用户数，也不必等于 Java 线程数；一个异步线程或虚拟线程模型下，线程与请求的对应方式可能不同。",
            "吞吐回答“每单位时间完成多少”。例如每秒成功完成多少个翻译任务，单位可写作 jobs/s。延迟回答“一项工作从开始到结束花多久”。请求进入速率、尝试次数与成功完成吞吐不能混为一谈，尤其在重试和错误增多时。",
          ],
          coreMechanism: [
            "先画测量边界：提交接口从收到 HTTP 请求到返回受理响应，是接口响应延迟；任务从创建到结果可用，是任务完成延迟。前者变短，并不能证明后者也变短。排队时间若在边界内，就必须计入相应延迟。",
            "在边界一致、长期平均稳定的条件下，Little 定律可写成平均在系统中的数量 L = 平均完成速率 λ × 平均逗留时间 W。例如 100 个/秒 × 0.2 秒 = 平均 20 个在途任务。这里的 20 是平均数量，不是线程池应当固定设为 20 的配置建议。",
            "这个关系不能拿单次慢请求、瞬时最大并发或不断增长积压随意代入。稳定性、工作单位、平均时间窗口和系统边界必须对应；正在持续过载的队列，应先按流入与流出差分析增长。",
            "增加线程可以让等待型任务重叠，但 CPU、连接池、锁与外部接口仍有容量上限。到达瓶颈后，更多在途工作往往意味着等待更长。应同时观察完成吞吐、错误率、平均延迟与 p95/p99 等尾部延迟。",
            "限制同时在途数量与限制每秒速率是两种控制。Semaphore 可约束同时持有的许可证，例如同时最多调用若干外部请求；若要控制每秒调用数，还需令牌桶等带时间维度的限流机制。",
          ],
          examples: [
            {
              kind: "prose",
              title: "一个数字不足以说明系统变快",
              explanationZhHans:
                "教学假设：改动前后都每秒成功完成 100 个任务，但平均在途从 20 增加到 100。若边界相同且两种状态均稳定，平均逗留时间分别约为 0.2 秒和 1 秒。吞吐没增加，用户反而等待更久；仅展示“并发提升了五倍”会掩盖这个结果。",
            },
            {
              kind: "prose",
              title: "平均值也可能隐藏少数人的长等待",
              explanationZhHans:
                "假设多数短文件很快完成，少数大文件等待很久。平均任务耗时看起来仍可接受，但 p99 可能明显恶化。需要按任务大小与等待阶段拆解，再决定优化哪里，不能凭一个平均数宣布整个系统已经满足延迟目标。",
            },
          ],
          useCases: [
            "描述性能问题或面试项目结果时，把工作单位、环境、时间窗口、吞吐、错误和延迟说清楚。",
            "评估线程池、连接池、异步处理和批处理的改变，检查它们究竟提高了完成能力还是只积累了更多等待。",
          ],
          commonMistakes: [
            "把一万个在线用户、每秒一万个请求与一万个同时在途请求当成同一个规模。",
            "只数收到或尝试的请求，忽略失败与重试，也不报告最终成功完成数。",
            "从教学公式的 20 个平均在途任务直接推出 20 个线程就适合所有负载。容量配置还取决于任务特征和资源预算。",
          ],
          followUpQuestions: [
            {
              question: "并发与并行有什么区别？",
              answer:
                "并发表达多个任务在一段时间里交叠推进，可能交替运行或等待；并行表达它们在同一时刻由多个计算单元执行。等待网络时的并发可以提高利用率，但不会让有限 CPU 同时完成无限计算。",
            },
            {
              question: "为什么低错误率仍可能掩盖问题？",
              answer:
                "如果任务仍在排队而尚未失败，错误率可能很低，但等待年龄持续上升。需要一起看最老任务年龄、排队时间和端到端完成延迟，确认业务期限是否满足。",
            },
          ],
          interviewSummary:
            "把并发数、单位时间完成数和单项耗时分别定义，再给相同边界与稳定条件下的例子。高在途数量不等于高性能。",
        },
        practice: [
          {
            question: "稳定状态下，每秒完成 100 个任务，平均从入系统到完成耗时 0.2 秒，平均在系统中有多少个任务？能直接当线程数吗？",
            answer:
              "100/s × 0.2s = 平均 20 个任务。这个数量包含所选边界内的等待和处理，不直接等于所需线程数，也不是固定配置。需要再看执行模型、CPU、连接与其他约束。",
          },
          {
            question: "加线程后提交接口更快，但最终任务耗时变长。两个测量结果可能同时正确吗？",
            answer:
              "可能。接口可能更快地接受工作，而后续排队、锁竞争或外部服务压力增加。应分别比较受理响应时间、端到端完成时间和成功吞吐，定位新增等待在哪一段。",
          },
        ],
        sources: [handlingOverload],
      },
    },
    {
      id: "question_revision_backend_backlog_1",
      questionId: "question_backend_backlog",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "How do you distinguish a temporary burst from sustained overload, and where should you look for the bottleneck?",
          zhHans: "怎样区分短时削峰和持续过载？积压时先找什么瓶颈？",
        },
        englishInterviewAnswer: {
          answer:
            "A queue absorbs a temporary difference between arrival and processing rates, but it does not create processing capacity. Suppose an empty translation queue receives two hundred jobs per second and completes one hundred twenty per second for ten seconds. With constant rates and no retries or losses, the backlog grows by eight hundred jobs. If arrivals then fall to eighty per second while capacity stays at one hundred twenty, the queue drains at forty per second and needs about twenty seconds. If arrivals remain at two hundred, the backlog keeps growing. I would inspect per-partition lag, the age of the oldest unfinished job, completion rates, errors, worker utilization, database connections and locks, and external-service limits. Adding consumers helps only if useful parallel work and downstream capacity are available. The response may require increasing the actual bottleneck's capacity, reducing work, or applying admission control and backpressure. The queue's storage and retention limits also need monitoring.",
          keyPoints: [
            "Backlog growth follows arrival rate minus completion rate.",
            "Temporary buffering works only if later capacity can catch up.",
            "Scale the measured bottleneck and protect downstream resources.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "把队列想成尚未完成的工作清单：每秒新增任务，worker 每秒从中完成一些任务。当同一工作单位下的新增速度长期高于完成速度，清单就越来越长。Kafka 保存任务可以提供等待空间，但保存空间与处理能力是两件事。",
            "削峰意味着峰值结束后，有足够空闲处理能力把欠下的工作补完。持续过载则意味着欠账一直增加。判断依据既包括任务数量，也包括最老任务已等多久、业务能等多久，以及数据是否会在处理前超过保留期限。",
          ],
          coreMechanism: [
            "先作一个明确假设：初始积压为 0，所有任务同等计数，10 秒内流入恒定 200 个/秒、完成恒定 120 个/秒，没有失败重试与丢弃。净增长是 80 个/秒，10 秒积压 800 个。它是数学示例，不是任何真实系统的测量结果。",
            "若之后流入降到 80 个/秒，处理能力仍为 120 个/秒，每秒净消化 40 个，800 个需约 20 秒清空；若流入仍为 200，则无法靠原容量清空。真实任务大小、重试和变化速率会使估算偏离，应使用实际观测更新。",
            "先沿任务路径区分问题：consumer 是否有分区却空闲；是否在等线程池、数据库连接或锁；翻译服务是否在限流；是否少数超大任务占住资源。消费组总 lag 之外，还要看每个分区和任务年龄；热点与延迟不能只靠平均值判断。",
            "Kafka offset lag 与业务未完成任务量并非天然相等。提前提交进度、应用内缓冲、批处理、日志中的控制记录或保留策略都可能影响对应关系。因此同时观察消费进度与业务完成指标，不能只把 offset 差乘一个单任务时间就当最终等待时间。",
            "如果数据库连接与锁已经饱和，增加 consumer 可能只制造更多争用。可验证的行动应对应原因：优化昂贵查询、减少不必要写入、控制外部并发、增加实际执行容量，或在入口按业务规则限流和拒绝。背压的目的，是让下游压力影响上游接收速度，而不是把无限工作藏进内存。",
          ],
          examples: [
            {
              kind: "prose",
              title: "同样的 800 个任务，两种后续",
              explanationZhHans:
                "在本题教学假设中，峰值后降到 80/s，系统还能用剩余 40/s 逐渐还清积压，属于可恢复的短时缓冲；若一直保持 200/s，即使消息暂时都存得下，用户等待也继续增加。需要改变持续接收速率、单任务成本或有效处理能力。",
            },
            {
              kind: "prose",
              title: "通过证据区分两种扩容假设",
              explanationZhHans:
                "假设 A 是 worker CPU 饱和且尚有可分配分区；假设 B 是所有 worker 都等待同一个已饱和数据库。A 下增加合适执行资源可能增加完成数；B 下加实例可能让等待更严重。分别查看 CPU、调用耗时、连接等待和数据库锁，才能决定试哪一种调整及如何回退。",
            },
          ],
          useCases: [
            "排查消费者积压、批次任务迟迟不结束，以及扩容后吞吐没有增加的问题。",
            "设计峰值预算、最大等待时间、有界队列与限流，让系统在过载时仍有可解释行为。",
          ],
          commonMistakes: [
            "认为“用了 Kafka 就能扛住无限流量”，不计算流入、流出与可恢复时间。",
            "把重试请求当成新的有效业务吞吐，或忽略重试对外部系统的额外压力。",
            "将增加 consumer 当作所有瓶颈的通用方案，或只看总 lag 而忽略热分区和最老任务年龄。",
          ],
          followUpQuestions: [
            {
              question: "为什么要同时看任务数量与年龄？",
              answer:
                "数量说明有多少工作等待，年龄说明等待是否已违反业务期限。少量超大或卡住的任务可能数量不多却等待很久；大量极短任务则可能很快消化。两个指标回答不同问题。",
            },
            {
              question: "如果业务不允许丢任务，是否就不能限流？",
              answer:
                "仍可限制接收速率或明确拒绝尚未接受的请求，让调用方按约定稍后尝试。已接受的任务则应遵守可靠性承诺。不能通过无限接收、静默丢弃或无界重试假装容量问题已经解决。",
            },
          ],
          interviewSummary:
            "先用流入减流出计算积压，再检查峰后能否追平。根据每段资源与完成指标找瓶颈，最后说明限流、背压或扩容为什么能解决该原因。",
        },
        practice: [
          {
            question: "初始无积压，持续 10 秒每秒进 200 个、完成 120 个，没有重试或丢弃。积压多少？接着流入降至 80/s，约多久清空？",
            answer:
              "先增长 (200−120)×10 = 800 个；随后净消化速率是 120−80 = 40 个/秒，约 800÷40 = 20 秒。结果依赖题设的恒定速率和统一任务计数；它不是线上容量证明。",
          },
          {
            question: "新增两个 consumer 后，数据库锁等待升高，成功完成速率不变。接下来还应继续加 consumer 吗？",
            answer:
              "没有证据支持继续加。先验证数据库是否已成为瓶颈，检查热点写入、锁范围与连接预算，再选择减少争用或增加对应能力的方案。也要控制在途工作，避免吞吐不变而延迟继续升高。",
          },
        ],
        sources: [handlingOverload, kafkaConsumer],
      },
    },
    {
      id: "question_revision_backend_payment_timeout_1",
      questionId: "question_backend_payment_timeout",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "If a payment request times out, why is the result unknown, and what can you safely learn from asynchronous systems?",
          zhHans: "扣款请求超时为什么是“结果未知”？如何把异步系统的理解迁移到支付？",
        },
        englishInterviewAnswer: {
          answer:
            "A timeout means the caller did not receive a response within its deadline. It does not prove the payment provider rejected or failed to execute the request. In a hypothetical integration, the provider might complete the charge while its response is lost. Starting another charge with a new operation identity could therefore create a duplicate payment. I would preserve a stable identity for the same logical attempt, follow the provider's idempotency and retry contract, and reconcile an uncertain outcome by retrieving its state or processing verified notifications. The local status should represent uncertainty instead of reporting a definite failure too early. Duplicate callbacks also require safe state transitions and deduplication. Kafka can distribute payment events to downstream services, but cannot independently guarantee that a provider charges once. The transferable skill is identifying acknowledgement boundaries, duplicate windows, and authoritative state. I would also verify callback authenticity and allowed state transitions before triggering downstream effects.",
          keyPoints: [
            "A timeout describes the caller's observation, not the provider's final state.",
            "Retry the same logical attempt according to the provider's contract.",
            "Kafka does not automatically prevent duplicate external charges.",
          ],
        },
        chineseDeepDive: {
          definition: [
            "先回到翻译例子：worker 可能已经保存结果，只是完成通知没到。支付也存在“动作已发生、响应没收到”的窗口。超时只说明调用方在截止时间前没有收到预期响应；不能直接推出支付渠道没有扣款。",
            "结果未知是一种必须被系统表达的事实边界。它与明确拒绝、明确成功不同。金额相关动作重复执行可能造成实际损失，因此需要稳定的逻辑操作标识、渠道提供的幂等约定，以及核实原操作状态的流程。",
          ],
          coreMechanism: [
            "教学假设：服务向支付渠道提交一次扣款，渠道执行成功，但返回路径断开。若服务把超时直接记成最终失败，并立即用全新标识再扣一次，渠道可能把它当成另一笔有效操作。网络恢复本身也不能证明原操作结果。",
            "针对同一次逻辑尝试，重试需要遵守渠道的幂等键、参数一致性、有效期和允许重试的错误类型。不是所有错误都能反复重试，也不能把一个渠道的时限与语义套到所有支付系统。结果仍未知时，应查询原对象、处理可信回调或进入后续核实流程。",
            "本地支付状态应允许表示处理中或待核实，并结合渠道权威状态推进合法转换。webhook 是外部系统主动向我们的 HTTP 端点发送的事件通知；处理前需要按渠道约定验证来源和事件内容，再考虑重复、延迟和乱序。",
            "回调重复到达时，需要在正确的业务键与事务边界内防止重复发货、重复记账等副作用。仅记录 eventId 不一定覆盖同一业务操作产生不同事件的情况；较旧通知也不应无条件覆盖已确认的新状态。",
            "假设支付已被可靠确认且事件被可靠发布，订单、通知和分析可以各自用消费组响应；订单是否允许稍后更新取决于业务一致性要求。Kafka 可以承载事件，却不能独自约束渠道扣款，也不能自动把本地支付状态与消息发布组成一个原子操作。",
          ],
          examples: [
            {
              kind: "diagram",
              title: "调用方超时，渠道可能已成功",
              descriptionZhHans:
                "教学假设：服务 → 提交扣款 A → 支付渠道完成 A → 响应丢失 → 服务超时。此时服务观察到的是“没有响应”，渠道事实可能是“已经成功”。下一步围绕 A 核实与安全重试；不能仅凭超时创造另一次扣款 B。",
            },
            {
              kind: "prose",
              title: "Stripe 只作为公开学习示例",
              explanationZhHans:
                "Stripe 的错误处理文档展示了网络中断后保留同一操作的幂等键与参数，并按对应 API 版本的规则重试或核实结果。其 webhook 文档也要求考虑重复和非按生成顺序交付。这里用于观察真实接口如何定义边界，不代表任何目标雇主使用 Stripe，也不意味着学习者已实现这套支付机制。",
            },
          ],
          useCases: [
            "学习支付、创建订单或调用不可随意重复的外部接口时，把超时、逻辑操作身份与权威结果串起来。",
            "面试介绍可迁移能力时，解释自己理解的失败窗口，并把学习方案与实际做过的工程工作分开。",
          ],
          commonMistakes: [
            "把超时等同于未执行，或每次重试都生成新幂等键。这样可能把一次逻辑操作变成多次操作。",
            "认为 Kafka offset、消息去重或本地 synchronized 就能保证外部渠道不重复扣款。每种机制都有自己的覆盖边界。",
            "把示例渠道的重试细节当成通用协议，或把学到的支付设计表述成自己的生产经验。",
          ],
          followUpQuestions: [
            {
              question: "是否只要复用同一个幂等键，就可以永远重试？",
              answer:
                "不可以。需要遵守渠道与 API 版本定义的有效期、参数要求和错误处理规则。超过适用范围或结果长期未知时，应停止盲目重试并核实原操作，不能无限依赖一个标识。",
            },
            {
              question: "重复回调与重复扣款是一回事吗？",
              answer:
                "不是。重复回调是同一事实可能多次通知，重复扣款是资金副作用发生多次。回调处理需要防重复业务动作，而扣款调用本身也需要渠道侧操作身份与状态核实；两处要分别设计。",
            },
          ],
          interviewSummary:
            "从“超时只证明没收到响应”出发，解释稳定操作标识、渠道幂等契约与结果核实。把异步系统的失败推理迁移过来，避免声称 Kafka 能自动防止重复扣款。",
        },
        practice: [
          {
            question: "扣款接口超时后，产品想立即显示“支付失败”，并让用户发起新扣款。你首先要指出什么？",
            answer:
              "原扣款可能已成功，当前是结果未知。需要按渠道规则核实原操作、保留同一逻辑尝试的身份，并向用户表达处理中或待确认，避免在未知结果上制造重复扣款。具体提示与重试流程由业务和渠道约定决定。",
          },
          {
            question: "支付事件进了 Kafka，消费者提交了 offset。能据此保证渠道只扣一次、订单已正确更新吗？",
            answer:
              "不能。渠道扣款依赖它自己的接口契约与操作状态；订单更新取决于消费方业务处理与提交规则。Kafka 的消息或进度确认不覆盖这些外部效果，要分别检查原始支付结果、幂等和状态更新证据。",
          },
        ],
        sources: [
          {
            title: "Stripe: Advanced error handling — network errors and uncertain outcomes",
            url: "https://docs.stripe.com/error-low-level",
          },
          {
            title: "Stripe: Webhooks — duplicate events and event ordering",
            url: "https://docs.stripe.com/webhooks",
          },
          kafkaDesign,
        ],
      },
    },
  ],
};
