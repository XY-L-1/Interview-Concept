import type { PublishedContentData } from "./model";
import { backendCourse } from "./backend-course";

const publishedAt = "2026-07-26T00:00:00.000Z";

const reactContent = {
  courses: [
    {
      id: "course_react",
      slug: "react",
      publishedRevisionId: "course_revision_react_1",
    },
  ],
  courseRevisions: [
    {
      id: "course_revision_react_1",
      courseId: "course_react",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      order: 2,
      title: {
        en: "React",
        zhHans: "React",
      },
      description: {
        en: "Build interview-ready explanations of React's rendering model, component data flow, and everyday patterns.",
        zhHans:
          "系统掌握 React 的渲染模型、组件数据流和常用模式，并能够在面试中清晰表达。",
      },
      sectionRevisionIds: [
        "section_revision_react_core_1",
        "section_revision_react_behavior_1",
      ],
    },
  ],
  sections: [
    {
      id: "section_react_core",
      courseId: "course_react",
    },
    {
      id: "section_react_behavior",
      courseId: "course_react",
    },
  ],
  sectionRevisions: [
    {
      id: "section_revision_react_core_1",
      sectionId: "section_react_core",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: {
        en: "Core Concepts",
        zhHans: "核心概念",
      },
      description: {
        en: "The mental model behind components, rendering, props, and state.",
        zhHans: "理解组件、渲染、props 和 state 背后的核心心智模型。",
      },
      questionRevisionIds: [
        "question_revision_what_is_react_1",
        "question_revision_virtual_dom_1",
        "question_revision_props_vs_state_1",
      ],
    },
    {
      id: "section_revision_react_behavior_1",
      sectionId: "section_react_behavior",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      title: {
        en: "Component Behavior",
        zhHans: "组件行为",
      },
      description: {
        en: "Common patterns and rules that keep component behavior predictable.",
        zhHans: "让组件行为保持可预测的常用模式与规则。",
      },
      questionRevisionIds: [
        "question_revision_controlled_components_1",
        "question_revision_rules_of_hooks_1",
      ],
    },
  ],
  questions: [
    {
      id: "question_what_is_react",
      courseId: "course_react",
      slug: "what-is-react",
    },
    {
      id: "question_virtual_dom",
      courseId: "course_react",
      slug: "how-virtual-dom-works",
    },
    {
      id: "question_props_vs_state",
      courseId: "course_react",
      slug: "props-vs-state",
    },
    {
      id: "question_controlled_components",
      courseId: "course_react",
      slug: "controlled-components",
    },
    {
      id: "question_rules_of_hooks",
      courseId: "course_react",
      slug: "rules-of-hooks",
    },
  ],
  questionRevisions: [
    {
      id: "question_revision_what_is_react_1",
      questionId: "question_what_is_react",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "What is React, and why would you use it?",
          zhHans: "什么是 React？为什么要使用它？",
        },
        englishInterviewAnswer: {
          answer:
            "React is a JavaScript library for building user interfaces from reusable components. You describe how the UI should look for the current data, and React updates the DOM when that data changes. I use it when an interface has meaningful state, repeated UI patterns, or many interactions that benefit from predictable one-way data flow.",
          keyPoints: [
            "A library for composing user interfaces from components.",
            "Uses declarative rendering: UI is derived from data and state.",
            "Works best when reuse and interactive state justify its runtime.",
          ],
          codeExample: {
            kind: "code",
            language: "tsx",
            code: `function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}`,
            explanationZhHans:
              "组件接收数据并返回 UI 描述；当 name 改变时，React 会更新对应的界面。",
          },
        },
        chineseDeepDive: {
          definition: [
            "React 是用于构建用户界面的 JavaScript 库。它把界面拆成可组合的组件，并让开发者用声明式方式描述“当前数据对应什么 UI”。",
          ],
          coreMechanism: [
            "组件执行后产生 React 元素树。状态或 props 改变时，React 会再次计算相关组件，并把新旧结果进行比较。",
            "React 负责协调更新，渲染器（例如 react-dom）再把必要变化提交到真实 DOM。数据通常通过 props 向下传递。",
          ],
          examples: [
            {
              kind: "code",
              language: "tsx",
              code: `function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}`,
              explanationZhHans:
                "Greeting 是纯粹的展示组件：相同的 name 会得到相同的界面描述。",
            },
          ],
          useCases: [
            "具有大量交互、局部状态和重复界面模式的 Web 应用。",
            "需要共享组件体系、渐进式接入或跨页面复用 UI 的产品。",
          ],
          commonMistakes: [
            "把 React 说成完整框架。React 主要解决 UI 层；路由、数据层和构建方案通常由周边工具补充。",
            "任何页面都使用 React。内容完全静态时，额外运行时和复杂度未必值得。",
          ],
          followUpQuestions: [
            {
              question: "React 的声明式和命令式有什么区别？",
              answer:
                "声明式代码描述目标 UI，React 决定如何更新；命令式代码则逐步操作 DOM 达到目标。",
            },
            {
              question: "React 为什么强调组件？",
              answer:
                "组件把结构、行为和数据依赖组织在一起，便于组合、复用、测试和局部推理。",
            },
          ],
          interviewSummary:
            "React 的核心价值是组件化、声明式渲染和可预测的数据流。回答时先说明它解决 UI 构建问题，再补充适用场景和边界。",
        },
      },
    },
    {
      id: "question_revision_virtual_dom_1",
      questionId: "question_virtual_dom",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "How does React's virtual DOM work?",
          zhHans: "React 的虚拟 DOM 是如何工作的？",
        },
        englishInterviewAnswer: {
          answer:
            "The virtual DOM is the in-memory representation React creates from components. After an update, React builds the next tree, reconciles it with the previous tree, and schedules only the host changes that are needed. The important benefit is not that every comparison is inherently faster than direct DOM code; it is that React provides a predictable declarative model and can batch and schedule updates.",
          keyPoints: [
            "React elements form an in-memory description of the UI.",
            "Reconciliation compares identities, element types, props, and keys.",
            "The commit phase applies the required host-environment changes.",
          ],
          codeExample: {
            kind: "code",
            language: "tsx",
            code: `setItems((items) =>
  items.map((item) =>
    item.id === updated.id ? updated : item
  )
);`,
            explanationZhHans:
              "更新产生新的元素树；稳定的 key 帮助 React 识别列表中的同一个条目。",
          },
        },
        chineseDeepDive: {
          definition: [
            "虚拟 DOM 不是浏览器 API，而是 React 对界面结构的内存表示。它由普通 JavaScript 对象组成，用来描述元素类型、属性和子节点。",
          ],
          coreMechanism: [
            "更新发生后，React 进入 render 阶段，计算新的元素树并执行 reconciliation。元素类型不同通常会替换子树；类型相同则继续比较属性和子节点。",
            "列表中的 key 用来表达稳定身份。完成计算后，commit 阶段才把必要变更应用到 DOM，并执行布局相关副作用。",
          ],
          examples: [
            {
              kind: "code",
              language: "tsx",
              code: `{items.map((item) => (
  <li key={item.id}>{item.name}</li>
))}`,
              explanationZhHans:
                "使用稳定业务 ID 作为 key，React 才能在重排时保留正确的节点与组件状态。",
            },
          ],
          useCases: [
            "理解组件为什么会重新渲染，以及 DOM 为什么不一定全部重建。",
            "分析列表更新、key、组件状态保留和性能优化问题。",
          ],
          commonMistakes: [
            "把虚拟 DOM 简化为“它一定比真实 DOM 快”。性能取决于工作量、更新方式和具体场景。",
            "使用数组索引作为会重排列表的 key，导致状态与错误条目对应。",
          ],
          followUpQuestions: [
            {
              question: "render 阶段和 commit 阶段有什么区别？",
              answer:
                "render 阶段计算下一棵树且可能被中断；commit 阶段应用 DOM 变化，不能被中途打断。",
            },
            {
              question: "key 会传给组件吗？",
              answer:
                "不会。key 是 React 的协调提示；组件若需要该 ID，必须通过另一个 prop 显式传入。",
            },
          ],
          interviewSummary:
            "虚拟 DOM 是 React 的 UI 描述；reconciliation 计算差异，commit 应用变化。重点应放在身份、类型、key 和分阶段更新，而不是绝对性能口号。",
        },
      },
    },
    {
      id: "question_revision_props_vs_state_1",
      questionId: "question_props_vs_state",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "beginner",
      content: {
        prompt: {
          en: "What is the difference between props and state in React?",
          zhHans: "React 中 props 和 state 有什么区别？",
        },
        englishInterviewAnswer: {
          answer:
            "Props are read-only inputs passed from a parent component, while state is data owned and updated by the component itself. Both can trigger a re-render when they change, but props flow downward and state is managed locally.",
          keyPoints: [
            "Props are external inputs; a component must not mutate them.",
            "State is component-owned memory updated through React.",
            "Both can trigger a render when their observed values change.",
          ],
          codeExample: {
            kind: "code",
            language: "tsx",
            code: `function Counter({ label }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>
    {label}: {count}</button>;
}`,
            explanationZhHans:
              "label 来自 props，由父组件控制；count 是 Counter 自己维护的 state。",
          },
        },
        chineseDeepDive: {
          definition: [
            "Props 是父组件传入的只读数据，用来配置子组件；state 是组件保存的可变记忆，用来描述随交互或异步结果变化的数据。",
          ],
          coreMechanism: [
            "父组件重新渲染时，会为子组件提供新的 props。子组件只能读取 props，不能通过修改对象本身来改变父组件的数据。",
            "调用 state setter 会把更新加入 React 的更新队列。React 可以批处理这些更新，再用新的 state 重新计算组件。",
          ],
          examples: [
            {
              kind: "code",
              language: "tsx",
              code: `function Counter({ label }) {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>
    {label}: {count}</button>;
}`,
              explanationZhHans:
                "父组件负责 label，Counter 负责 count。函数式更新保证每次都基于最新队列值计算。",
            },
          ],
          useCases: [
            "Props 适合配置、回调和由上层拥有的共享数据。",
            "State 适合输入值、展开状态、选择状态和计数器等局部变化。",
          ],
          commonMistakes: [
            "直接修改 props 或 state 对象。应该由拥有者创建新值，并通过 setter 或父组件更新。",
            "把能够从 props 或其他 state 直接计算出的值再存一份 state，导致两份数据不同步。",
          ],
          followUpQuestions: [
            {
              question: "什么时候应该提升 state？",
              answer:
                "当多个组件必须读取或修改同一个变化值时，把 state 放到它们最近的共同父组件。",
            },
            {
              question: "为什么连续更新时推荐函数式 setter？",
              answer:
                "它接收更新队列中的最新值，避免闭包中的旧值让多次更新互相覆盖。",
            },
          ],
          interviewSummary:
            "Props 表达外部输入和单向数据流，state 表达组件拥有的可变记忆。回答时补充只读性、setter 更新和状态提升即可形成完整闭环。",
        },
      },
    },
    {
      id: "question_revision_controlled_components_1",
      questionId: "question_controlled_components",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "What is a controlled component in React?",
          zhHans: "什么是 React 受控组件？",
        },
        englishInterviewAnswer: {
          answer:
            "A controlled form element gets its current value from React state and reports user edits through an event handler. React is the source of truth, so validation, formatting, and dependent UI can use the same value. The trade-off is more state wiring than an uncontrolled input that keeps its value in the DOM.",
          keyPoints: [
            "The value is supplied by React state.",
            "An event handler updates that state.",
            "Useful when application behavior must react to every change.",
          ],
          codeExample: {
            kind: "code",
            language: "tsx",
            code: `const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>`,
            explanationZhHans:
              "input 显示的值来自 email；用户输入通过 onChange 更新同一份 state。",
          },
        },
        chineseDeepDive: {
          definition: [
            "受控组件是由 React state 控制当前值的表单元素。DOM 不再是这份表单值的唯一来源，组件 state 才是 source of truth。",
          ],
          coreMechanism: [
            "渲染时，value 或 checked 由 state 传给表单元素；用户操作触发事件；事件处理器调用 setter；新 state 再驱动下一次渲染。",
            "这个闭环让验证、格式化、禁用按钮和跨字段逻辑都能基于同一份数据执行。",
          ],
          examples: [
            {
              kind: "code",
              language: "tsx",
              code: `const [email, setEmail] = useState("");

<input
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>`,
              explanationZhHans:
                "如果不在 onChange 中更新 email，输入框会保持旧值，看起来无法输入。",
            },
          ],
          useCases: [
            "需要即时校验、格式化、联动字段或实时预览的表单。",
            "提交前需要在 React 中统一读取和转换字段值的流程。",
          ],
          commonMistakes: [
            "传入 value 却没有 onChange，导致输入框成为只读。",
            "在同一个输入生命周期中从 undefined 切换为字符串，引发受控与非受控切换警告。",
          ],
          followUpQuestions: [
            {
              question: "非受控组件什么时候更合适？",
              answer:
                "简单表单、不需要监听每次变化或需要与原生 DOM/第三方库集成时，可以用 defaultValue 和 ref。",
            },
            {
              question: "受控输入一定性能差吗？",
              answer:
                "不一定。通常先保持清晰的数据流，只有测量到大型表单重渲染问题时再拆分或优化。",
            },
          ],
          interviewSummary:
            "受控组件由 state 提供 value，由事件更新 state。优势是单一数据源和可组合逻辑，代价是更多状态连接代码。",
        },
      },
    },
    {
      id: "question_revision_rules_of_hooks_1",
      questionId: "question_rules_of_hooks",
      revisionNumber: 1,
      schemaVersion: 1,
      publishedAt,
      difficulty: "intermediate",
      content: {
        prompt: {
          en: "What are the Rules of Hooks, and why do they exist?",
          zhHans: "Hooks 有哪些规则？这些规则为什么存在？",
        },
        englishInterviewAnswer: {
          answer:
            "Call Hooks only at the top level of a React component or another custom Hook. Do not call them conditionally, inside loops, or from ordinary functions. React associates Hook state with call order, so keeping that order stable lets it match each useState or useEffect call to the correct stored state across renders.",
          keyPoints: [
            "Call Hooks only from React components or custom Hooks.",
            "Keep Hook calls at the top level and in the same order.",
            "Use the Hooks ESLint rules to catch violations.",
          ],
          codeExample: {
            kind: "code",
            language: "tsx",
            code: `function Profile({ userId }: { userId?: string }) {
  const user = useUser(userId);

  if (!userId) return <EmptyState />;
  return <ProfileDetails user={user} />;
}`,
            explanationZhHans:
              "Hook 始终先执行，条件返回发生在 Hook 调用之后，因此每次渲染的调用顺序稳定。",
          },
        },
        chineseDeepDive: {
          definition: [
            "Hooks 规则要求 Hook 只能在 React 函数组件或自定义 Hook 中调用，并且应位于顶层，不能放在条件、循环或嵌套普通函数中。",
          ],
          coreMechanism: [
            "React 在一个组件实例上按调用顺序保存 Hook 状态。第一次调用对应第一个槽位，第二次对应第二个槽位。",
            "如果某次渲染跳过一个 Hook，后续所有槽位都会错位。稳定调用顺序让 React 不需要为每个 Hook 增加显式 ID。",
          ],
          examples: [
            {
              kind: "code",
              language: "tsx",
              code: `function Profile({ userId }: { userId?: string }) {
  const user = useUser(userId);

  if (!userId) return <EmptyState />;
  return <ProfileDetails user={user} />;
}`,
              explanationZhHans:
                "把条件放在 Hook 内部或 Hook 调用之后，而不是决定是否调用 Hook。",
            },
          ],
          useCases: [
            "审查条件渲染、提前返回和循环中的状态逻辑。",
            "把可复用的有状态逻辑提取为名称以 use 开头的自定义 Hook。",
          ],
          commonMistakes: [
            "在 if 语句或事件处理器中调用 useState、useEffect 等 Hook。",
            "为了绕过 lint 关闭 Hooks 规则，而不是调整控制流或抽取自定义 Hook。",
          ],
          followUpQuestions: [
            {
              question: "自定义 Hook 是否共享 state？",
              answer:
                "不会。它共享的是逻辑；每个调用它的组件实例仍然拥有独立的 Hook 状态。",
            },
            {
              question: "条件逻辑应该放在哪里？",
              answer:
                "可以放进 Hook 的回调或 effect 内部，也可以在所有 Hook 调用完成后提前返回。",
            },
          ],
          interviewSummary:
            "Hooks 规则本质上保护调用顺序。回答时说明两条规则，再解释 React 用顺序匹配状态，就能体现机制理解。",
        },
      },
    },
  ],
} satisfies PublishedContentData;

export const publishedContent: PublishedContentData = {
  courses: [...reactContent.courses, ...backendCourse.courses],
  courseRevisions: [...reactContent.courseRevisions, ...backendCourse.courseRevisions],
  sections: [...reactContent.sections, ...backendCourse.sections],
  sectionRevisions: [...reactContent.sectionRevisions, ...backendCourse.sectionRevisions],
  questions: [...reactContent.questions, ...backendCourse.questions],
  questionRevisions: [...reactContent.questionRevisions, ...backendCourse.questionRevisions],
};
