import { LiteNodeData } from '../constant/Comp';

export const ThenDemo: LiteNodeData = {
  type: 'root',
  children: [
    { type: 'common', props: { node: 'a' } },
    { type: 'common', props: { node: 'b' } },
    { type: 'common', props: { node: 'c' } },
  ],
};

export const WhenDemo: LiteNodeData = {
  type: 'root',
  children: [
    { type: 'common', props: { node: 'a' } },
    {
      type: 'when',
      multiple: [
        {
          children: [
            { type: 'common', props: { node: 'b1' } },
            { type: 'common', props: { node: 'b2' } },
          ],
        },
        {
          children: [{ type: 'common', props: { node: 'c' } }],
        },
        {
          children: [{ type: 'common', props: { node: 'd' } }],
        },
      ],
    },
    { type: 'common', props: { node: 'e' } },
  ],
};

export const SwitchDemo: LiteNodeData = {
  type: 'root',
  children: [
    {
      type: 'switch',
      props: { node: 'x' },
      multiple: [
        {
          children: [
            { type: 'common', props: { node: 'a1' } },
            { type: 'common', props: { node: 'a2' } },
          ],
        },
        {
          children: [{ type: 'common', props: { node: 'b' } }],
        },
        {
          children: [{ type: 'common', props: { node: 'c' } }],
        },
      ],
    },
  ],
};

export const IfDemo: LiteNodeData = {
  type: 'root',
  children: [
    {
      type: 'if',
      props: { node: 'x' },
      multiple: [
        {
          name: 'yes',
          children: [
            { type: 'common', props: { node: 'a1' } },
            { type: 'common', props: { node: 'a2' } },
          ],
        },
        {
          name: 'no',
          children: [{ type: 'common', props: { node: 'b' } }],
        },
      ],
    },
  ],
};

export const ForDemo: LiteNodeData = {
  type: 'root',
  children: [
    {
      type: 'for',
      props: { node: 'x' },
      children: [
        { type: 'common', props: { node: 'a' } },
        { type: 'common', props: { node: 'b' } },
      ],
    },
  ],
};

export const WhileDemo: LiteNodeData = {
  type: 'root',
  children: [
    {
      type: 'while',
      props: { node: 'x' },
      children: [
        { type: 'common', props: { node: 'a' } },
        { type: 'common', props: { node: 'b' } },
      ],
    },
  ],
};

export default {
  THEN: ThenDemo,
  WHEN: WhenDemo,
  SWITCH: SwitchDemo,
  IF: IfDemo,
  FOR: ForDemo,
  WHILE: WhileDemo,
};
