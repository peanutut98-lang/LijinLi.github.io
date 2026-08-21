---
title: "Building Effective Agents：Workflow 与 Agent"
date: 2026-08-21
permalink: /posts/2026/08/building-effective-agents/
tags:
  - LLM
  - Agent
  - Workflow
---
<!-- 原文：[Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) -->

<!--\> 来源：Anthropic Engineering-->  

<!--\> 发布时间：2024 年 12 月 19 日-->

## 一、workflow与agent
Anthropic在具体的架构上做了区分：workflow和agent

- workflow是通过预定义好的路径来协调LLM和工具的系统
- agent system是LLM动态的指导自身流程和工具的使用。

二者的区别不在于“是否使用了 LLM”，而在于“谁拥有流程控制权”。Workflow 中的每个步骤都可以调用 LLM，但下一步执行哪个节点、整个流程按照什么顺序运行，通常由代码决定。Agent 则会根据当前目标、工具返回结果和环境反馈，动态决定下一步行动。

例如，一个固定的内容生成流程可能是：

```text
生成提纲 → 检查提纲 → 撰写正文 → 翻译
```

这条执行路线由开发者提前确定，因此它属于 Workflow。不过，“生成提纲”“检查内容”和“翻译”都需要理解自然语言，所以这些步骤仍然可以由 LLM 完成。换句话说，代码负责安排路线，LLM负责完成路线中的智能任务。

但这并不意味着agent system就好于workflow，因为agent系统往往会通过**牺牲时间和成本**的代价换取更好的性能。但并不是，**每个产品都需要这样实现**.


## 二、共同基础：Augmented LLM

文章把 Augmented LLM 视为 Agentic System 的基础构件。它是在普通 LLM 的基础上增加检索、工具和记忆等能力，使模型不仅可以生成文本，还可以主动搜索信息、选择工具，并决定应该保留哪些上下文。

```text
                 ┌── 检索 Retrieval
普通 LLM ────────┼── 工具 Tools
                 └── 记忆 Memory
                        ↓
                 Augmented LLM
```

后面介绍的 Workflow 和 Agent，基本都可以看作对 Augmented LLM 的不同组织方式。它们之间的差异主要体现在调用顺序、任务分工以及流程控制权上。

## 三、五种常见的 Workflow

1. 提示链

提示链将任务分解为一系列步骤，其中每个 LLM 调用都会处理前一个调用的输出。您可以对任何中间步骤添加程序化检查（参见下图中的“gate”），以确保流程仍在按计划进行。

![image-20260821152612821](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821152612821.png)

2. 路由

路由机制对输入进行分类，并将其导向特定的后续任务。

![image-20260821152656008](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821152656008.png)

3. 并行

多层级管理（LLM）有时可以同时处理同一任务，并通过程序自动汇总其输出。这种工作流程（即并行化）主要体现在两个方面：

- **分段**：将一项任务分解成若干个可以并行运行的独立子任务。
- **投票法：**多次运行同一任务以获得不同的输出结果。

![image-20260821152739756](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821152739756.png)

4. Orchestrator-workers

中央 LLM 动态地分解任务，将任务委派给工作者 LLM，并综合它们的结果。

![image-20260821152948604](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821152948604.png)

**这个在我看来和multi-agent的supervisor模式几乎没有任何区别**，但汇总完codex的回答，这两者的区别可能在于：如果中央 Orchestrator 是只负责一次拆解和一次汇总，而multiagent是进入持续循环，性质就发生了变化。例如，多agent系统的流程可能是：理解目标→ 制定计划→ 创建 Worker→ 查看 Worker 结果→ 判断信息是否充分→ 失败时重新委派→ 必要时调用其他工具→ 修改计划→ 决定继续还是结束。

5. Evaluator-optimizer

在评估器-优化器工作流程中，一个 LLM 调用生成响应，而另一个调用则提供评估和反馈，形成一个循环。

![image-20260821153610087](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821153610087.png)

Evaluator 只是判断质量，确认是否需要进一步多轮的分析和搜索，而不是能够自由决定下一步调用什么工具、怎样修改计划、增加哪些步骤（这就是agent）

## 四、agent

智能体可以处理复杂的任务，但它们的实现通常很简单。它们通常只是基于环境反馈循环使用工具的逻辑逻辑模型（LLM）。因此，**清晰周全地设计工具集及其文档至关重要**

![image-20260821154051967](/Users/lijinli/Library/Application Support/typora-user-images/image-20260821154051967.png)

anthropic文档里有一句话，我特别的喜欢，是“工具定义和规范应该与整体提示一样，得到同等的提示工程重视。” 对于工具的定义我们应当设计的足够清晰和明确，以帮助agent对于工具的选择和使用。

- 一个好的工具定义通常包含使用示例、边界情况、输入格式要求以及与其他工具的明确界限。
- 如何修改参数名称或描述，使其更清晰易懂？可以把它想象成为团队中的初级开发人员编写一份优秀的文档字符串。在使用许多类似工具时，这一点尤为重要。
- 测试模型如何使用您的工具：在我们的[工作台中](https://console.anthropic.com/workbench)运行许多示例输入，看看模型会犯什么错误，并进行迭代。
- [对工具进行防错处理](https://en.wikipedia.org/wiki/Poka-yoke)。修改参数，使其更难出错。



下一步准备阅读

https://www.anthropic.com/research/swe-bench-sonnet

https://en.wikipedia.org/wiki/Poka-yoke

https://console.anthropic.com/workbench
