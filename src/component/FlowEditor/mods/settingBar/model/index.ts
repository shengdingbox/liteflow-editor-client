
export default function render(data: Record<string, any>) {
    const cells: Record<string, any>[]  = [];
    const start: Record<string, any> = {
        id: 'start',
        shape: 'Start',
        view: 'react-shape-view',
        attrs: {
            label: { text: '开始' }
        }
    }
    cells.push(start)
    
    const next: Record<string, any> = parse(data, cells, start);

    const last = {
        id: 'end',
        shape: 'End',
        view: 'react-shape-view',
        attrs: {
            label: { text: '结束' }
        }
    }
    cells.push(last)

    cells.push({
        shape: 'edge',
        source: next.id,
        target: last.id,
    })
    
    return { cells };
}

function parse(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>): Record<string, any> {
    switch(data.type) {
        case 'THEN':
            return parseThen(data, cells, previous);
        case 'WHEN':
            return parseWhen(data, cells, previous);
        case 'SWITCH':
            return parseSwitch(data, cells, previous);
        case 'IF':
            return parseIf(data, cells, previous);
        case 'Common':
        default:
            return parseCommon(data, cells, previous);
    }
}

function parseThen(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>) {
    const { children } = data
    let last: Record<string, any> = {}
    children.forEach((child: Record<string, any>, index: number) => {
        last = parse(child, cells, index === 0 ? previous : last)
    })
    return last;
}

function parseWhen(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>) {
    const { children } = data
    const parallelStart = {
        id: 'parallelStart',
        shape: 'ParallelStart',
        view: 'react-shape-view',
        attrs: {
            label: { text: '' }
        }
    }
    cells.push(parallelStart);
    cells.push({
        shape: 'edge',
        source: previous.id,
        target: parallelStart.id,
    })
    const parallelEnd = {
        id: 'parallelEnd',
        shape: 'ParallelEnd',
        view: 'react-shape-view',
        attrs: {
            label: { text: '' }
        }
    }
    children.forEach((child: Record<string, any>) => {
        const next = parse(child, cells, parallelStart)
        cells.push({
            shape: 'edge',
            source: next.id,
            target: parallelEnd.id,
        })
    })
    cells.push(parallelEnd);
    return parallelEnd
}

function parseSwitch(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>) {
    return {}
}

function parseIf(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>) {
    return {}
}

function parseCommon(data: Record<string, any>, cells: Record<string, any>[], previous: Record<string, any>) {
    const { id, type } = data
    const common = { 
        id, 
        shape: type, 
        view: 'react-shape-view',
        attrs: { 
            label: { text: id } 
        } 
    }
    cells.push(common)
    cells.push({
        shape: 'edge',
        source: previous.id,
        target: common.id,
    })
    return common
}