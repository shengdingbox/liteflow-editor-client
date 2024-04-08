export default {
    // 串行编排(THEN)
    THEN: {
        type: 'THEN',
        children: [
            { type: 'Common', id: 'a' },
            { type: 'Common', id: 'b' },
            { type: 'Common', id: 'c' },
            { type: 'Common', id: 'd' },
        ]
    },
    // 并行编排(WHEN)
    WHEN: {
        type: 'THEN',
        children: [
            { type: 'Common', id: 'a' },
            { 
                type: 'WHEN',
                children: [
                    { type: 'Common', id: 'b' },
                    { type: 'Common', id: 'c' },
                    { type: 'Common', id: 'd' },
                ]
            },
            { type: 'Common', id: 'e' },
        ]
    },
    // 选择编排(SWITCH)
    SWITCH: {
        type: 'THEN',
        children: [
            { type: 'Common', id: 'a' },
            { type: 'Common', id: 'b' },
            { type: 'Common', id: 'c' },
            { type: 'Common', id: 'd' },
        ]
    },
    // 条件编排(IF)
    IF: {
        type: 'THEN',
        children: [
            { type: 'Common', id: 'a' },
            { 
                type: 'WHEN',
                children: [
                    { type: 'Common', id: 'b' },
                    { type: 'Common', id: 'c' },
                    { type: 'Common', id: 'd' },
                ]
            },
            { type: 'Common', id: 'e' },
        ]
    }
} as Record<string, any>
