import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface FibNode {
  value: number;
  children: FibNode[];
  order: number;
}

const FibonacciTree: React.FC<{ n: number }> = ({ n }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 1200;
    const height = 800;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const generateFibTree = (n: number): FibNode => {
      let order = 0;
      const generate = (n: number): FibNode => {
        if (n <= 1) return { value: n, children: [], order: order++ };
        const node: FibNode = { value: n, children: [], order: order++ };
        node.children.push(generate(n - 1));
        node.children.push(generate(n - 2));
        return node;
      };
      return generate(n);
    };

    const tree = d3
      .tree<FibNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    const root = d3.hierarchy(generateFibTree(n));
    const treeData = tree(root);

    const linkGenerator = d3
      .link<d3.HierarchyLink<FibNode>, d3.HierarchyPointNode<FibNode>>(d3.curveBumpY)
      .x((d) => d.x)
      .y((d) => d.y);

    // Add links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#4a4a4a")
      .attr("stroke-width", 1.5)
      .attr("d", linkGenerator)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d) => Math.max(d.source.data.order, d.target.data.order) * 500)
      .style("opacity", 1)
      .attrTween("stroke-dasharray", function() {
        const length = this.getTotalLength();
        return d3.interpolate(`0,${length}`, `${length},${length}`);
      });

    // Add nodes
    const nodes = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("opacity", 0);

    nodes
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d) => (d.children ? "#4db6ac" : "#7e57c2"))
      .transition()
      .duration(300)
      .delay((d) => d.data.order * 500)
      .attr("r", 18)
      .style("opacity", 1);

    nodes
      .append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "12px")
      .text((d) => d.data.value)
      .style("opacity", 0)
      .transition()
      .duration(300)
      .delay((d) => d.data.order * 500)
      .style("opacity", 1);

    nodes
      .transition()
      .duration(300)
      .delay((d) => d.data.order * 500)
      .style("opacity", 1);

    // Cleanup function
    return () => {
      svg.selectAll("*").remove();
    };
  }, [n]);

  return <svg ref={svgRef} style={{ background: "#1e1e1e" }} />;
};

export default FibonacciTree;
