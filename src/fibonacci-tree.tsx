import React, { useCallback } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

interface FibNode {
  value: number;
  children: FibNode[];
  order: number;
}

const FibonacciTree: React.FC<{ n: number }> = ({ n }) => {
  const [dimensions, setDimensions] = React.useState({
    width: 1200,
    height: 800,
  });
  const [treeData, setTreeData] = React.useState<{
    links: Array<d3.HierarchyPointLink<FibNode>>;
    nodes: Array<d3.HierarchyPointNode<FibNode>>;
  }>({ links: [], nodes: [] });

  const generateFibTree = useCallback((n: number) => {
    let order = 0;
    const generate = (n: number): FibNode => {
      if (n <= 1) return { value: n, children: [], order: order++ };
      const node: FibNode = { value: n, children: [], order: order++ };
      node.children.push(generate(n - 1));
      node.children.push(generate(n - 2));
      return node;
    };
    return generate(n);
  }, []);

  React.useEffect(() => {
    const root = d3.hierarchy<FibNode>(generateFibTree(n));
    const tree = d3
      .tree<FibNode>()
      .size([dimensions.width - 100, dimensions.height - 100]);
    const treeData = tree(root);
    setTreeData({
      links: treeData.links(),
      nodes: treeData.descendants(),
    });
  }, []);
  const generateLink = d3
    .link<d3.HierarchyPointLink<FibNode>, d3.HierarchyPointNode<FibNode>>(
      d3.curveBumpY
    )
    .x((d) => d.x)
    .y((d) => d.y);
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 600 }}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0, 0, ${dimensions.width}, ${dimensions.height}`}
      >
        <g>
          {treeData.links.map((link) => (
            <motion.path
              d={generateLink(link) || ""}
              fill="none"
              stroke="#4a4a4a"
              strokeWidth={1.5}
              key={`${link.source.data.order}-${link.target.data.order}`}
            ></motion.path>
          ))}
          {treeData.nodes.map((node) => (
            <g key={`node-${node.data.order}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={18}
                fill={
                  node.children && node.children.length > 0
                    ? "#4db6ac"
                    : "#7e57c2"
                }
              ></circle>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default FibonacciTree;
