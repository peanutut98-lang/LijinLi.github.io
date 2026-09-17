---
permalink: /
title: "Lijin Li 的学习小岛"
show_title: false
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

<section class="island-hero" aria-labelledby="island-welcome-title">
  <span class="island-eyebrow">AI · Agent · Engineering</span>
  <h1 id="island-welcome-title" class="island-hero__title">你好，我是 Lijin Li</h1>
  <p class="island-hero__lead">我目前正在学习 LLM、AI Agent 和软件工程。这里记录我的每日技术阅读，也记录我怎样把一个模糊的问题逐步理解、验证并真正做出来。</p>
  <div class="island-hero__actions">
    <a class="island-button island-button--primary" href="{{ '/year-archive/' | relative_url }}">阅读学习笔记</a>
    <a class="island-button" href="mailto:{{ site.author.email }}">联系我</a>
  </div>
</section>

这个博客用来记录我的每日技术阅读。我计划每天阅读两篇文章，并写下它们解决了什么问题、彼此有什么联系，以及我真正理解了什么。

<div class="island-section-heading">
  <h2>最近关注</h2>
  <p>这些主题正在组成我当前的学习地图。</p>
</div>

<ul class="island-tag-list" aria-label="最近关注的主题">
  <li>LLM 与 AI Agent</li>
  <li>Agentic Workflow</li>
  <li>前端与后端工程</li>
  <li>算法与计算机基础</li>
</ul>

<div class="island-section-heading">
  <h2>最近记录</h2>
  <p>从最新一篇开始，继续沿着问题向下探索。</p>
</div>

<div class="island-post-grid">
  {% for post in site.posts limit: 4 %}
    <article class="island-post-card">
      <time class="island-post-card__date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y · %m · %d" }}</time>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    </article>
  {% endfor %}
</div>
