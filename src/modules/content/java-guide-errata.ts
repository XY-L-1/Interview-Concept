type GuideErratum = Readonly<{
  question: string;
  answer: string;
  source: Readonly<{ title: string; url: string }>;
}>;

// Preserve the imported paragraphs; show these separately as documented corrections.
export const javaGuideErrata: Readonly<Record<string, GuideErratum>> = {
  "006": {
    question: "原文校对：equals 对 null 的契约是什么？",
    answer:
      "本题中文“对非空对象返回假”缺少比较对象，不能按字面使用。Java 21 Object.equals 的契约是：对任意非空引用 x，x.equals(null) 应返回 false；x.equals(x) 则应返回 true。原英文对此表述正确。下方官方文档提供完整契约；原文保留以便对照。",
    source: {
      title: "Java 21 Object.equals: equality contract",
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)",
    },
  },
  "011": {
    question: "原文校对：接口能声明普通实例字段吗？",
    answer:
      "本题中文“实例字段仍隐含为 public static final”应改读为“接口字段隐含为 public static final”。JLS 21 明确接口没有实例变量；这些字段属于接口本身，而非每个实现对象。原英文没有“实例字段”这一误称。",
    source: {
      title: "Java Language Specification 21, 9.3: Interface fields",
      url: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-9.html#jls-9.3",
    },
  },
  "035": {
    question: "原文校对：limit 是中间操作还是终止操作？",
    answer:
      "本题中文把 limit 与 findFirst、anyMatch 一起列作“短路终止”不准确。Java 21 Stream.limit 返回一个新的 Stream，是短路的有状态中间操作；findFirst 和 anyMatch 才是终止操作。英文只称这些操作具有短路性质，没有将 limit 列为终止操作。",
    source: {
      title: "Java 21 Stream.limit: short-circuiting stateful intermediate operation",
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html#limit(long)",
    },
  },
  "077": {
    question: "原文校对：join 只传播受检异常吗？",
    answer:
      "本题中文“只是把受检异常包装成 CompletionException”限定过窄。CompletableFuture.join 返回完成结果；异常完成时通常通过非受检的 CompletionException 传播失败，所封装的原因不限于受检异常；取消还可抛 CancellationException。它不会替调用方处理业务失败。原英文的“exposes failure”更准确。",
    source: {
      title: "Java 21 CompletableFuture.join: result and exceptional completion",
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html#join()",
    },
  },
  "080": {
    question: "原文校对：Semaphore 直接限制每秒请求数吗？",
    answer:
      "本题展开把连接数量、下游 QPS 与连接池或 Semaphore 合在一起，需分开理解。Semaphore 通过 acquire/release 管理同时可用的许可证，常用于约束同时访问资源的数量；它本身没有每秒重置的速率规则。例如同样只有一个许可，调用耗时 1 毫秒与 1 秒时，每秒完成数可以完全不同。每秒速率还需时间维度的限流机制。本题关于虚拟线程的讨论保留 Java 21 版本背景。",
    source: {
      title: "Java 21 Semaphore: permits and concurrent resource access",
      url: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Semaphore.html",
    },
  },
};
