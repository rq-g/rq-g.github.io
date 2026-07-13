document.addEventListener('DOMContentLoaded', function() {
    var currentMonth = '';
    var currentPage = 1;
    var pageSize = 12;

    var monthList = [];
    var yearMonthsData = {};
    document.querySelectorAll('.archive-card').forEach(function(card) {
        var ym = card.getAttribute('data-ym');
        if (!yearMonthsData[ym]) yearMonthsData[ym] = 0;
        yearMonthsData[ym]++;
    });
    Object.keys(yearMonthsData).sort(function(a, b) { return b.localeCompare(a); }).forEach(function(ym) {
        monthList.push(ym);
    });

    initScrollHighlight();

    function initScrollHighlight() {
        var highlightEnabled = true;
        var lastScrollTime = 0;

        window.addEventListener('scroll', function() {
            if (!highlightEnabled) return;

            var now = Date.now();
            if (now - lastScrollTime < 100) return;
            lastScrollTime = now;

            updateScrollHighlight();
        });

        updateScrollHighlight();

        document.querySelectorAll('.timeline-link').forEach(function(link) {
            link.addEventListener('click', function() {
                highlightEnabled = false;
                setTimeout(function() {
                    highlightEnabled = true;
                }, 3000);
            });
        });
    }

    function updateScrollHighlight() {
        var cards = document.querySelectorAll('.archive-card');
        var visibleYm = '';
        var windowHeight = window.innerHeight;
        var threshold = windowHeight * 0.4;

        cards.forEach(function(card) {
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
        document.querySelectorAll('.timeline-year-label').forEach(function(el) {
            el.classList.remove('scroll-highlight');
        });
        document.querySelectorAll('.timeline-link').forEach(function(el) {
            el.classList.remove('scroll-highlight');
        });

        if (!ym) return;

        var year = ym.substring(0, 4);

        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + year + '"]');
        if (yearLabel) {
            yearLabel.classList.add('scroll-highlight');
        }

        var monthLink = document.querySelector('.timeline-item[data-ym="' + ym + '"] .timeline-link');
        if (monthLink) {
            monthLink.classList.add('scroll-highlight');
        }
    }

    window.toggleYear = function(year) {
        var monthsEl = document.querySelector('.timeline-months[data-year="' + year + '"]');
        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + year + '"]');
        var icon = yearLabel.querySelector('.year-toggle-icon');
        if (monthsEl.classList.contains('expanded')) {
            monthsEl.classList.remove('expanded');
            icon.textContent = '▶';
        } else {
            monthsEl.classList.add('expanded');
            icon.textContent = '▼';
        }
    };

    window.filterByMonth = function(ym, linkEl) {
        var allCards = document.querySelectorAll('.archive-card');
        var links = document.querySelectorAll('.timeline-link');
        var emptyMsg = document.getElementById('archive-empty');
        var headerEl = document.getElementById('archive-month-header');

        if (currentMonth === ym) {
            currentMonth = '';
            currentPage = 1;
            allCards.forEach(function(card) { card.style.display = ''; });
            links.forEach(function(link) { link.classList.remove('active'); });
            emptyMsg.style.display = 'none';
            headerEl.style.display = 'none';
            document.getElementById('archive-pagination').innerHTML = '';
            return;
        }

        currentMonth = ym;
        currentPage = 1;

        links.forEach(function(link) { link.classList.remove('active'); });
        if (linkEl) linkEl.classList.add('active');

        var parts = ym.split('-');
        headerEl.textContent = parts[0] + '年' + parseInt(parts[1]) + '月';
        headerEl.style.display = 'block';

        var filteredCards = [];
        allCards.forEach(function(card) {
            if (card.getAttribute('data-ym') === ym) {
                filteredCards.push(card);
            } else {
                card.style.display = 'none';
            }
        });

        if (filteredCards.length === 0) {
            emptyMsg.style.display = 'block';
            document.getElementById('archive-pagination').innerHTML = '';
        } else {
            emptyMsg.style.display = 'none';
            renderPage(filteredCards);
        }
    };

    function renderPage(filteredCards) {
        var total = filteredCards.length;
        var totalPages = Math.ceil(total / pageSize);

        filteredCards.forEach(function(card) { card.style.display = 'none'; });

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, total);
        for (var i = start; i < end; i++) {
            filteredCards[i].style.display = '';
        }

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        var paginationEl = document.getElementById('archive-pagination');
        if (totalPages <= 1 && monthList.length <= 1) {
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

    window.goToPage = function(page) {
        currentPage = page;
        var filteredCards = getFilteredCards();
        renderPage(filteredCards);
        document.querySelector('.archive-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.goToMonthFirstPage = function(ym) {
        currentMonth = ym;
        currentPage = 1;
        selectMonth(ym);
    };

    window.goToMonthLastPage = function(ym) {
        currentMonth = ym;
        var count = yearMonthsData[ym] || 0;
        currentPage = Math.ceil(count / pageSize);
        selectMonth(ym);
    };

    function selectMonth(ym) {
        var links = document.querySelectorAll('.timeline-link');
        var headerEl = document.getElementById('archive-month-header');

        links.forEach(function(link) { link.classList.remove('active'); });
        var targetItem = document.querySelector('.timeline-item[data-ym="' + ym + '"]');
        if (targetItem) {
            var targetLink = targetItem.querySelector('.timeline-link');
            if (targetLink) targetLink.classList.add('active');
        }

        var parts = ym.split('-');
        headerEl.textContent = parts[0] + '年' + parseInt(parts[1]) + '月';
        headerEl.style.display = 'block';

        var year = ym.substring(0, 4);
        var monthsEl = document.querySelector('.timeline-months[data-year="' + year + '"]');
        var yearLabel = document.querySelector('.timeline-year-label[data-year="' + year + '"]');
        if (monthsEl && !monthsEl.classList.contains('expanded')) {
            monthsEl.classList.add('expanded');
            var icon = yearLabel.querySelector('.year-toggle-icon');
            if (icon) icon.textContent = '▼';
        }

        var allCards = document.querySelectorAll('.archive-card');
        var filteredCards = [];
        allCards.forEach(function(card) {
            if (card.getAttribute('data-ym') === ym) {
                filteredCards.push(card);
            } else {
                card.style.display = 'none';
            }
        });

        document.getElementById('archive-empty').style.display = filteredCards.length === 0 ? 'block' : 'none';
        if (filteredCards.length > 0) {
            renderPage(filteredCards);
        }

        document.querySelector('.archive-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getFilteredCards() {
        var filteredCards = [];
        document.querySelectorAll('.archive-card').forEach(function(card) {
            if (card.getAttribute('data-ym') === currentMonth) {
                filteredCards.push(card);
            }
        });
        return filteredCards;
    }

    window.switchLayout = function(layout) {
        var grid = document.getElementById('archive-grid');
        var buttons = document.querySelectorAll('.layout-btn');

        buttons.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-layout') === layout) {
                btn.classList.add('active');
            }
        });

        if (layout === 'list') {
            grid.classList.add('list-mode');
        } else {
            grid.classList.remove('list-mode');
        }

        localStorage.setItem('archive-layout', layout);
    };

    var savedLayout = localStorage.getItem('archive-layout') || 'grid';
    if (savedLayout === 'list') {
        switchLayout('list');
    }
});