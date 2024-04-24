import { EdgeView, NodeView, Point, Registry } from '@antv/x6';
import anchor from './anchor';

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
  const sourceCorner = anchor(view.sourceView as NodeView);
  const targetCorner = anchor(view.targetView as NodeView);
  if (sourceCorner.x < targetCorner.x && sourceCorner.y < targetCorner.y) {
    // 第一象限
    points.push(Point.create(sourceCorner.x, targetCorner.y));
  } else if (
    sourceCorner.x > targetCorner.x &&
    sourceCorner.y < targetCorner.y
  ) {
    // 第二象限
    points.push(Point.create(targetCorner.x, sourceCorner.y));
  } else if (
    sourceCorner.x > targetCorner.x &&
    sourceCorner.y > targetCorner.y
  ) {
    // 第三象限
    points.push(Point.create(targetCorner.x, sourceCorner.y));
  } else if (
    sourceCorner.x < targetCorner.x &&
    sourceCorner.y > targetCorner.y
  ) {
    // 第四象限
    points.push(Point.create(sourceCorner.x, targetCorner.y));
  }
  // @ts-ignore
  return normalRouter.call(this, points, args, view);
}
