import { EdgeView, NodeView, Point, Registry } from '@antv/x6';
import anchor from './anchor';
import { NODE_WIDTH } from '../constant';

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
  const pointX = targetCorner.x - (NODE_WIDTH / 2 + 30);
  if (
    // 第四象限
    (sourceCorner.x < targetCorner.x && sourceCorner.y < targetCorner.y) || // 第一象限
    (sourceCorner.x < targetCorner.x && sourceCorner.y > targetCorner.y)
  ) {
    points.push(
      Point.create(pointX, sourceCorner.y),
      Point.create(pointX, targetCorner.y),
    );
  }
  // @ts-ignore
  return normalRouter.call(this, points, args, view);
}
