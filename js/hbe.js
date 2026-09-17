// hexo-blog-encrypt 表单样式运行时补齐
// 仅当文章 front-matter 含 password 时由 post.ejs 引入。
// 原先该脚本内联在 post.ejs 中，会给每个文章页的 body 挂一个 subtree 观察者；
// 抽离后只在加密文章上运行。
(function () {
    function applyHbeStyles() {
        var inputs = document.querySelectorAll('.hbe-input-field');
        inputs.forEach(function (input) {
            input.setAttribute('style', 'width: 100% !important; padding: 10px 14px !important; font-size: 0.9rem !important; border: 1px solid rgba(0, 255, 255, 0.4) !important; border-radius: 6px !important; background: transparent !important; color: #ffffff !important; outline: none !important; float: none !important; display: block !important;');
        });

        var containers = document.querySelectorAll('.hbe-container');
        containers.forEach(function (container) {
            container.setAttribute('style', 'max-width: 280px !important; margin: 80px auto !important; padding: 25px !important; background: transparent !important; border-radius: 12px !important; border: 1px solid rgba(0, 255, 255, 0.2) !important;');
        });

        var buttons = document.querySelectorAll('.hbe-button');
        buttons.forEach(function (button) {
            button.setAttribute('style', 'width: 100% !important; margin-top: 12px !important; padding: 10px 14px !important; font-size: 0.9rem !important; font-weight: 600 !important; color: #0a0a1a !important; background: linear-gradient(135deg, rgba(0, 255, 255, 0.9), rgba(0, 200, 200, 0.9)) !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; text-align: center !important;');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyHbeStyles);
    } else {
        applyHbeStyles();
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.classList && (node.classList.contains('hbe-container') ||
                        node.querySelector && node.querySelector('.hbe-container'))) {
                        applyHbeStyles();
                        return;
                    }
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
