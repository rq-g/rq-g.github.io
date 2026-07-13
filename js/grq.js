// grq theme

// 根据背景色调整标签文字颜色
document.addEventListener('DOMContentLoaded', function() {
  var tags = document.querySelectorAll('.tag-item');
  
  tags.forEach(function(tag) {
    var isLight = tag.getAttribute('data-light') === 'true';
    if (isLight) {
      tag.style.color = '#333';
      var count = tag.querySelector('.tag-count');
      if (count) {
        count.style.background = 'rgba(0, 0, 0, 0.12)';
      }
    }
  });

  // 标签动态效果初始化
  initTagEffects();
});

// 标签动态效果
function initTagEffects() {
  const tagsCloud = document.getElementById('tagsCloud');
  if (!tagsCloud) return;

  const tags = tagsCloud.querySelectorAll('.tag-item');
  
  // 获取当前页面的标签名称
  const currentTag = getCurrentTagFromUrl();
  
  tags.forEach(function(tag) {
    const tagName = tag.getAttribute('data-tag');
    
    // 高亮当前选中的标签
    if (tagName === currentTag) {
      tag.classList.add('tag-active');
    }
  });
}

// 从URL获取当前标签名
function getCurrentTagFromUrl() {
  const path = window.location.pathname;
  // 匹配 /tags/xxx/ 格式
  const match = path.match(/\/tags\/([^\/]+)\/?/);
  return match ? decodeURIComponent(match[1]) : null;
}
