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

    // 禁止浏览器 / 密码管理器「替你把密码输进去」
    // 输入框本身没有任何 autocomplete 属性，而 id="hbePass" 里的 "pass" 会让浏览器
    // 认定这是密码字段，于是把为本站保存过的密码自动回填 —— 表现就是「一打开就已经有密码了」。
    function blockAutofill() {
        var input = document.querySelector('.hbe-input-field');
        if (!input) return;

        if (!input.__hbeAutofillGuarded) {
            input.__hbeAutofillGuarded = true;

            // new-password 明确声明「这是新密码字段，别填已保存的凭据」
            input.setAttribute('autocomplete', 'new-password');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('spellcheck', 'false');
            // 各主流密码管理器的忽略标记
            input.setAttribute('data-lpignore', 'true');    // LastPass
            input.setAttribute('data-1p-ignore', 'true');   // 1Password
            input.setAttribute('data-bwignore', 'true');    // Bitwarden
            input.setAttribute('data-form-type', 'other');  // Dashlane

            var form = input.form;
            if (form) form.setAttribute('autocomplete', 'off');

            // 用户真自己敲过（含粘贴）就不再动他的输入
            ['input', 'keydown', 'paste'].forEach(function (evt) {
                input.addEventListener(evt, function () {
                    input.__hbeTyped = true;
                });
            });
        }

        // 框里已有的内容不是用户打的，一律清掉
        if (!input.__hbeTyped) input.value = '';
    }

    function boot() {
        applyHbeStyles();
        blockAutofill();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    // 自动填充常发生在 load 之后（甚至晚于 DOMContentLoaded），补一次
    window.addEventListener('load', blockAutofill);

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes[i];
                    if (node.classList && (node.classList.contains('hbe-container') ||
                        node.querySelector && node.querySelector('.hbe-container'))) {
                        boot();
                        return;
                    }
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
