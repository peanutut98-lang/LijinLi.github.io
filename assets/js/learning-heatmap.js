(function () {
  "use strict";

  var root = document.getElementById("learning-heatmap");
  var dataNode = document.getElementById("learning-heatmap-data");

  if (!root || !dataNode) {
    return;
  }

  var posts;
  try {
    posts = JSON.parse(dataNode.textContent);
  } catch (error) {
    return;
  }

  var grid = root.querySelector("[data-heatmap-grid]");
  var months = root.querySelector("[data-heatmap-months]");
  var summary = root.querySelector("[data-heatmap-summary]");
  var tooltip = root.querySelector("[data-heatmap-tooltip]");
  var tooltipText = root.querySelector("[data-heatmap-tooltip-text]");
  var counts = new Map();

  posts.forEach(function (post) {
    counts.set(post.date, (counts.get(post.date) || 0) + 1);
  });

  var today = startOfDay(new Date());
  var start = startOfWeek(today);
  start.setDate(start.getDate() - 52 * 7);

  var postsInRange = posts.filter(function (post) {
    var date = fromDateKey(post.date);
    return date >= start && date <= today;
  }).length;

  summary.textContent = "过去一年发布了 " + postsInRange + " 篇学习笔记";

  renderMonths();
  renderCells();

  window.addEventListener("scroll", hideTooltip, { passive: true });
  window.addEventListener("resize", hideTooltip);

  function renderMonths() {
    var previousMonth = -1;

    for (var week = 0; week < 53; week += 1) {
      var weekDate = addDays(start, week * 7);
      var month = weekDate.getMonth();
      var label = document.createElement("span");
      label.className = "island-heatmap__month";
      label.style.gridColumn = String(week + 1);

      if (month !== previousMonth) {
        label.textContent = new Intl.DateTimeFormat("zh-CN", { month: "short" }).format(weekDate);
        previousMonth = month;
      }

      months.appendChild(label);
    }
  }

  function renderCells() {
    for (var week = 0; week < 53; week += 1) {
      for (var day = 0; day < 7; day += 1) {
        var date = addDays(start, week * 7 + day);
        var key = toDateKey(date);
        var count = counts.get(key) || 0;
        var cell = document.createElement("span");
        var label = formatCellLabel(date, count);

        cell.className = "island-heatmap__cell";
        cell.dataset.level = String(Math.min(count, 4));
        cell.dataset.date = key;
        cell.dataset.count = String(count);
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", label);

        if (date > today) {
          cell.classList.add("is-future");
          cell.setAttribute("aria-hidden", "true");
        } else {
          cell.tabIndex = count > 0 ? 0 : -1;
          cell.addEventListener("mouseenter", showTooltip);
          cell.addEventListener("mouseleave", hideTooltip);
          cell.addEventListener("focus", showTooltip);
          cell.addEventListener("blur", hideTooltip);
          cell.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
              hideTooltip();
              event.currentTarget.blur();
            }
          });
        }

        grid.appendChild(cell);
      }
    }
  }

  function showTooltip(event) {
    var cell = event.currentTarget;
    var rect = cell.getBoundingClientRect();
    var count = Number(cell.dataset.count);
    var date = fromDateKey(cell.dataset.date);

    tooltipText.textContent = formatCellLabel(date, count);
    tooltip.hidden = false;
    tooltip.style.left = clamp(rect.left + rect.width / 2, 78, window.innerWidth - 78) + "px";
    tooltip.style.top = rect.top + "px";
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function formatCellLabel(date, count) {
    var formatted = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }).format(date);

    return formatted + "，" + (count ? count + " 篇学习笔记" : "没有发布学习笔记");
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function startOfWeek(date) {
    var result = new Date(date);
    var day = result.getDay();
    var offset = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + offset);
    return result;
  }

  function addDays(date, amount) {
    var result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function toDateKey(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function fromDateKey(key) {
    var parts = key.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
