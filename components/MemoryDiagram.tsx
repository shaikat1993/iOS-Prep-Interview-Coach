
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DiagramNode, DiagramLink } from '../types';

interface MemoryDiagramProps {
  nodes: DiagramNode[];
  links: DiagramLink[];
}

const MemoryDiagram: React.FC<MemoryDiagramProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes || nodes.length === 0) return;

    const width = 600;
    const height = 400;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height] as any)
      .attr('style', 'max-width: 100%; height: auto;');

    svg.selectAll('*').remove();

    // Define marker for arrows
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#94a3b8')
      .style('stroke', 'none');

    const nodeRadius = 35;

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius + 10));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: any) => d.strength === 'strong' ? '#ef4444' : '#10b981')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => d.strength === 'strong' ? 3 : 1.5)
      .attr('stroke-dasharray', (d: any) => d.strength === 'weak' ? '5,5' : '0')
      .attr('marker-end', 'url(#arrowhead)');

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', (d: any) => d.type === 'closure' ? '#fde047' : '#ffffff')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2);

    node.append('text')
      .text((d: any) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('class', 'text-xs font-bold fill-slate-700 pointer-events-none')
      .style('font-size', '10px');

    simulation.on('tick', () => {
      // Bounding box constraints
      nodes.forEach((d: any) => {
        d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
        d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
      });

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, links]);

  return (
    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Interactive Memory Diagram</h4>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-red-500"></div> Strong</span>
          <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-emerald-500 border-dashed border-t border-emerald-500"></div> Weak/Unowned</span>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-[400px]"></svg>
    </div>
  );
};

export default MemoryDiagram;
