import React, { useState, useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

interface FibNode {
  value: number;
  children: FibNode[];
  order: number;
}

const FibonacciTree: React.FC<{ n: number }> = ({ n }) => {
  const [nodes, setNodes] = useState<d3.HierarchyPointNode<FibNode>[]>([]);
  const [links, setLinks] = useState<d3.HierarchyLink<FibNode>[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions({ width: width, height: Math.max(600, width * 0.75) });
    }
  }, []);

  useEffect(() => {
    // TODO: FIX
    console.log(111);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const generateFibTree = useCallback((n: number): FibNode => {
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

  useEffect(() => {
    const tree = d3
      .tree<FibNode>()
      .size([dimensions.width - 100, dimensions.height - 100]);

    const root = d3.hierarchy<FibNode>(generateFibTree(n));
    const treeData = tree(root);

    setNodes(treeData.descendants());
    setLinks(treeData.links());
  }, [n, dimensions, generateFibTree]);
  const linkGenerator = d3
    .link<d3.HierarchyLink<FibNode>, d3.HierarchyPointNode<FibNode>>(
      d3.curveBumpY
    )
    .x((d) => d.x)
    .y((d) => d.y);
  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: "600px" }}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{ background: "#1e1e1e" }}
      >
        <g transform="translate(50,50)">
          <AnimatePresence>
            {links.map((link) => (
              <motion.path
                key={`link-${link.source.data.order}-${link.target.data.order}`}
                d={linkGenerator(link)}
                fill="none"
                stroke="#4a4a4a"
                strokeWidth={1.5}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  delay:
                    Math.max(link.source.data.order, link.target.data.order) *
                    0.5,
                }}
              />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {nodes.map((node) => (
              <motion.g
                key={`node-${node.data.order}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3, delay: node.data.order * 0.5 }}
              >
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={
                    node.children && node.children.length > 0
                      ? "#4db6ac"
                      : "#7e57c2"
                  }
                  initial={{ r: 0 }}
                  animate={{ r: 18 }}
                  transition={{ duration: 0.3, delay: node.data.order * 0.5 }}
                />
                <motion.text
                  x={node.x}
                  y={node.y}
                  dy=".35em"
                  textAnchor="middle"
                  fill="white"
                  fontSize="12px"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: node.data.order * 0.5 }}
                >
                  {node.data.value}
                </motion.text>
              </motion.g>
            ))}
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
};

export default FibonacciTree;
