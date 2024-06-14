---
hero:
  title: LiteFlow Editor
  description: LiteFlow逻辑可视化编辑器
  actions:
    - text: 立即上手
      link: /guide
    - text: 编辑器前端
      link: https://gitee.com/imwangshijiang/flow-editor-quickstart/
    - text: 编辑器后端
      link: https://gitee.com/dogsong99/liteflow-editor-server/
features:
  - title: 开源免费
    emoji: 💎
    description: MIT、Apache 2.0协议
  - title: 逻辑可视化
    emoji: 🌈
    description: 对LiteFlow逻辑编排进行了可视化设计
  - title: 可扩展模型
    emoji: 🚀
    description: 对EL表达式进行了可扩展建模
---

```jsx
import { LiteFlowEditor } from 'liteflow-editor-client';

export default () => (
  <div style={{height: '100vh'}}>
    <LiteFlowEditor />
  </div>
)
```
