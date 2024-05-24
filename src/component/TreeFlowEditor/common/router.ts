import { EdgeView, NodeView, Point, Registry } from '@antv/x6';
import { NodeCompStore } from '../store/CompStore';

export default function router(
  vertices: Point.PointLike[],
  args: any,
  view: EdgeView,
) {
  const normalRouter = Registry.Router.presets.normal;
  const points = vertices.map((p) => Point.create(p));

  if (
    !(view.sourceView && view.sourceView.cell) ||
    !(view.targetView && view.targetView.cell)
  ) {
    // @ts-ignore
    return normalRouter.call(this, points, args, view);
  }

  const sourceId = view.sourceView.cell.getData();

  const sourceCorner = view.sourceBBox.getCenter();
  const targetCorner = view.targetBBox.getCenter();
  const sourceComp = NodeCompStore.getNode(view.sourceView.cell.shape);
  if (sourceCorner.x < targetCorner.x && sourceCorner.y < targetCorner.y) {
    // 第四象限
    if (sourceComp.metadata.childrenType === 'include') {
      if (targetCorner.x - sourceCorner.x <= 45) {
        // 到 include 的第一个子节点
        points.push(Point.create(sourceCorner.x, targetCorner.y));
      } else {
        points.push(Point.create(targetCorner.x, sourceCorner.y));
      }
    } else if (sourceComp.metadata.childrenType === 'branch') {
      points.push(Point.create(sourceCorner.x, targetCorner.y));
    } else {
      points.push(Point.create(targetCorner.x, sourceCorner.y));
    }
  } else if (
    sourceCorner.x > targetCorner.x &&
    sourceCorner.y < targetCorner.y
  ) {
    // 第三象限
    points.push(Point.create(sourceCorner.x, targetCorner.y));
  } else if (
    sourceCorner.x > targetCorner.x &&
    sourceCorner.y > targetCorner.y
  ) {
    // 第二象限
    points.push(
      Point.create(sourceCorner.x + 30, sourceCorner.y),
      Point.create(sourceCorner.x + 30, targetCorner.y + 30),
      Point.create(targetCorner.x, targetCorner.y + 30),
    );
  } else if (
    sourceCorner.x < targetCorner.x &&
    sourceCorner.y > targetCorner.y
  ) {
    // 第一象限
    // points.push(Point.create(sourceCorner.x, targetCorner.y));
    if (sourceComp.metadata.childrenType === 'branch') {
      points.push(Point.create(sourceCorner.x, targetCorner.y));
    } else {
      points.push(Point.create(targetCorner.x, sourceCorner.y));
    }
  }
  // @ts-ignore
  return normalRouter.call(this, points, args, view);
}
