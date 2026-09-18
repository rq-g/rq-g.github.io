/**
 * 归档页交互
 *   1. 顶层分类筛选（默认分类由主题 _config.yml 的 archive_filter.default 决定）
 *   2. 侧栏年月时间线（计数随当前分类重算）
 *   3. 卡片「网格 / 列表」布局切换
 *
 * 所有可见性都由 render() 统一计算，避免分类筛选与月份筛选互相覆盖。
 */
document.addEventListener('DOMContentLoaded', function () {
    /* 仅在 archive_filter.enable: false（页面上没有筛选按钮）时用作兜底：该值表示「不过滤」 */
    var ALL = '*';

    var filterEl = document.getElementById('archive-cat-filter');
    var catButtons = filterEl ? Array.prototype.slice.call(filterEl.querySelectorAll('.cat-btn')) : [];

    /* 没有筛选栏（archive_filter.enable: false）时退化为「显示全部」 */
    var currentCat = filterEl ? (filterEl.getAttribute('data-default') || ALL) : ALL;
    var currentMonth = '';
    var currentPage = 1;
    var pageSize = 12;

    var monthList = [];
    var yearMonthsData = {};

    var cards = Array.prototype.slice.call(document.querySelectorAll('.archive-card'));
    var gridEl = document.getElementById('archive-grid');
    var emptyEl = document.getElementById('archive-empty');
    var emptyTextEl = emptyEl ? emptyEl.querySelector('p') : null;
    /* 「该分类下暂无文章」/「该月份暂无文章」两套文案，由模板注入 */
    var emptyTextByCat = emptyEl ? emptyEl.getAttribute('data-text-empty-cat') || '' : '';
    var emptyTextByMonth = emptyEl ? emptyEl.getAttribute('data-text-empty-month') || '' : '';
    var headerEl = document.getElementById('archive-month-header');
    var paginationEl = document.getElementById('archive-pagination');
    var mainEl = document.querySelector('.archive-main');
    var countEl = document.getElementById('total-post-count');

    /* ---------------- 数据查询 ---------------- */

    function cardsOfCat(cat) {
        if (cat === ALL) return cards;
        return cards.filter(function (card) {
            return card.getAttribute('data-cat') === cat;
        });
    }

    function rebuildMonthData() {
        yearMonthsData = {};
        cardsOfCat(currentCat).forEach(function (card) {
            var ym = card.getAttribute('data-ym');
            yearMonthsData[ym] = (yearMonthsData[ym] || 0) + 1;
        });
        monthList = Object.keys(yearMonthsData).sort(function (a, b) {
            return b.localeCompare(a);
        });
    }

    function refreshTimeline() {
        document.querySelectorAll('.timeline-item').forEach(function (item) {
            var count = yearMonthsData[item.getAttribute('data-ym')] || 0;
            var isEmpty = count === 0;

            item.classList.toggle('empty', isEmpty);
            var link = item.querySelector('.timeline-link');
            if (link) {
                link.classList.toggle('disabled', isEmpty);
                link.classList.remove('active');
            }
            var countEl2 = item.querySelector('.timeline-count');
            if (countEl2) countEl2.textContent = count;
        });

        document.querySelectorAll('.timeline-year-label').forEach(function (label) {
            var year = label.getAttribute('data-year');
            var monthsEl = document.querySelector('.timeline-months[data-year="' + year + '"]');
            var total = 0;
            for (var m = 1; m <= 12; m++) {
                total += yearMonthsData[year + '-' + (m < 10 ? '0' + m : m)] || 0;
            }

            /* 该分类下没有文章的年份整体隐藏 */
            label.style.display = total === 0 ? 'none' : '';
            if (monthsEl) {
                monthsEl.style.display = total === 0 ? 'none' : '';
                monthsEl.classList.remove('expanded');
            }
            var icon = label.querySelector('.year-toggle-icon');
            if (icon) icon.textContent = '▶';
        });
    }

    /* ---------------- 渲染 ---------------- */

    function render() {
        var pool = cardsOfCat(currentCat);
        var visible = currentMonth
            ? pool.filter(function (card) { return card.getAttribute('data-ym') === currentMonth; })
            : pool;

        var totalPages = currentMonth ? Math.max(1, Math.ceil(visible.length / pageSize)) : 1;
        if (currentPage > totalPages) currentPage = totalPages;

        var pageCards = visible;
        if (currentMonth) {
            var start = (currentPage - 1) * pageSize;
            pageCards = visible.slice(start, start + pageSize);
        }

        var show = [];
        pageCards.forEach(function (card) { show.push(card); });
        cards.forEach(function (card) {
            card.style.display = show.indexOf(card) === -1 ? 'none' : '';
        });

        emptyEl.style.display = visible.length === 0 ? 'block' : 'none';
        if (emptyTextEl) {
            emptyTextEl.textContent = currentMonth ? emptyTextByMonth : emptyTextByCat;
        }

        if (currentMonth) {
            var parts = currentMonth.split('-');
            headerEl.textContent = parts[0] + '年' + parseInt(parts[1], 10) + '月';
            headerEl.style.display = 'block';
        } else {
            headerEl.style.display = 'none';
        }

        if (countEl) countEl.textContent = pool.length;

        renderPagination(currentMonth ? totalPages : 0);
    }

    function renderPagination(totalPages) {
        if (!currentMonth || (totalPages <= 1 && monthList.length <= 1)) {
            paginationEl.innerHTML = '';
            return;
        }

        var currentIdx = monthList.indexOf(currentMonth);
        var hasPrevMonth = currentIdx < monthList.length - 1;
        var hasNextMonth = currentIdx > 0;

        var html = '<div class="pagination-wrapper">';

        if (currentPage > 1) {
            html += '<a class="pagination-btn prev" href="javascript:void(0)" onclick="goToPage(' + (currentPage - 1) + ')">&laquo; 上一页</a>';
        } else if (hasPrevMonth) {
            var prevMonth = monthList[currentIdx + 1];
            html += '<a class="pagination-btn prev" href="javascript:void(0)" onclick="goToMonthLastPage(\'' + prevMonth + '\')">' + prevMonth + ' »</a>';
        } else {
            html += '<span class="pagination-btn disabled">&laquo; 上一页</span>';
        }

        for (var p = 1; p <= totalPages; p++) {
            if (p === currentPage) {
                html += '<span class="pagination-btn current">' + p + '</span>';
            } else {
                html += '<a class="pagination-btn" href="javascript:void(0)" onclick="goToPage(' + p + ')">' + p + '</a>';
            }
        }

        if (currentPage < totalPages) {
            html += '<a class="pagination-btn next" href="javascript:void(0)" onclick="goToPage(' + (currentPage + 1) + ')">下一页 &raquo;</a>';
        } else if (hasNextMonth) {
            var nextMonth = monthList[currentIdx - 1];
            html += '<a class="pagination-btn next" href="javascript:void(0)" onclick="goToMonthFirstPage(\'' + nextMonth + '\')">&laquo; ' + nextMonth + '</a>';
        } else {
            html += '<span class="pagination-btn disabled">下一页 &raquo;</span>';
        }

        html += '</div>';
        paginationEl.innerHTML = html;
    }

    /* ---------------- 滚动高亮 ---------------- */

    function initScrollHighlight() {
        var highlightEnabled = true;
        var lastScrollTime = 0;

        window.addEventListener('scroll', function () {
            if (!highlightEnabled) return;

            var now = Date.now();
            if (now - lastScrollTime < 100) return;
            lastScrollTime = now;

            updateScrollHighlight();
        });

        updateScrollHighlight();

        document.querySelectorAll('.timeline-link').forEach(function (link) {
            link.addEventListener('click', function () {
                highlightEnabled = false;
                setTimeout(function () { highlightEnabled = true; }, 3000);
            });
        });
    }

    function updateScrollHighlight() {
        var visibleYm = '';
        var windowHeight = window.innerHeight;

        cards.forEach(function (card) {
            /* display:none 的卡片 rect 全为 0，会被误判成「在视口顶部」，必须跳过 */
            if (card.style.display === 'none') return;

            var rect = card.getBoundingClientRect();
            var cardCenter = rect.top + rect.height / 2;

            if (cardCenter >= 0 && cardCenter <= windowHeight) {
                var distance = Math.abs(cardCenter - windowHeight / 2);
                if (!visibleYm || distance < 200) {
                    visibleYm = card.getAttribute('data-ym');
                }
            }
        });

        updateTimelineHighlight(visibleYm);
    }

    function updateTimelineHighlight(ym) {
        document.querySelectorAll('.timeline-year-label').forEach(function (el) {
            el.classList.remove('scroll-highlight');
        });
        document.querySelectorAll('.timeline-link').forEach(function (el) {
            el.classList.remove('scroll-highlight');
        });

        if (!ym) return;

        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + ym.substring(0, 4) + '"]');
        if (yearLabel) yearLabel.classList.add('scroll-highlight');

        var monthLink = document.querySelector('.timeline-item[data-ym="' + ym + '"] .timeline-link');
        if (monthLink) monthLink.classList.add('scroll-highlight');
    }

    /* ---------------- 对外交互 ---------------- */

    window.switchCategory = function (cat) {
        if (cat === currentCat) return;

        currentCat = cat;
        currentMonth = '';
        currentPage = 1;

        catButtons.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
        });

        rebuildMonthData();
        refreshTimeline();
        render();
    };

    window.toggleYear = function (year) {
        var monthsEl = document.querySelector('.timeline-months[data-year="' + year + '"]');
        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + year + '"]');
        if (!monthsEl) return;

        var icon = yearLabel ? yearLabel.querySelector('.year-toggle-icon') : null;
        if (monthsEl.classList.contains('expanded')) {
            monthsEl.classList.remove('expanded');
            if (icon) icon.textContent = '▶';
        } else {
            monthsEl.classList.add('expanded');
            if (icon) icon.textContent = '▼';
        }
    };

    window.filterByMonth = function (ym, linkEl) {
        if (!(yearMonthsData[ym] > 0)) return; /* 空月份不响应点击 */

        if (currentMonth === ym) {
            currentMonth = '';
            currentPage = 1;
            document.querySelectorAll('.timeline-link').forEach(function (link) {
                link.classList.remove('active');
            });
            render();
            return;
        }

        selectMonth(ym, 1);
    };

    function selectMonth(ym, page) {
        currentMonth = ym;
        currentPage = page || 1;

        var year = ym.substring(0, 4);
        var monthsEl = document.querySelector('.timeline-months[data-year="' + year + '"]');
        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + year + '"]');
        if (monthsEl && !monthsEl.classList.contains('expanded')) {
            monthsEl.classList.add('expanded');
            var icon = yearLabel ? yearLabel.querySelector('.year-toggle-icon') : null;
            if (icon) icon.textContent = '▼';
        }

        document.querySelectorAll('.timeline-link').forEach(function (link) {
            link.classList.remove('active');
        });
        var activeLink = document.querySelector('.timeline-item[data-ym="' + ym + '"] .timeline-link');
        if (activeLink) activeLink.classList.add('active');

        render();
        if (mainEl) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.goToPage = function (page) {
        currentPage = page;
        render();
        if (mainEl) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.goToMonthFirstPage = function (ym) {
        selectMonth(ym, 1);
    };

    window.goToMonthLastPage = function (ym) {
        selectMonth(ym, Math.ceil((yearMonthsData[ym] || 0) / pageSize));
    };

    window.switchLayout = function (layout) {
        var buttons = document.querySelectorAll('.layout-btn');

        buttons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-layout') === layout) {
                btn.classList.add('active');
            }
        });

        if (layout === 'list') {
            gridEl.classList.add('list-mode');
        } else {
            gridEl.classList.remove('list-mode');
        }

        localStorage.setItem('archive-layout', layout);
    };

    /* ---------------- 首屏 ---------------- */

    catButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            window.switchCategory(btn.getAttribute('data-cat'));
        });
    });

    /* 服务端已按同一默认分类输出，这里重算一遍保证数据与 DOM 完全一致 */
    rebuildMonthData();
    refreshTimeline();
    render();

    initScrollHighlight();

    var savedLayout = localStorage.getItem('archive-layout') || 'grid';
    if (savedLayout === 'list') {
        window.switchLayout('list');
    }
});
