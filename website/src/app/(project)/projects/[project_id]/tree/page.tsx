"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

import type {
    EdgeType,
    LayoutType,
    ApiNode,
    ApiEdge,
    ApiData,
} from "@/actions/project/getGraph";
import getGraph from "@/actions/project/getGraph";
import projectContext from "@/contexts/project";

interface NodeColors {
    background: string;
    border: string;
}

interface VisNode extends Omit<ApiNode, 'id'> {
    id: string;
    color?: NodeColors;
    font?: {
        color: string;
        size: number;
    };
    shape?: string;
    size?: number;
    title?: string;
}

interface VisEdge extends Omit<ApiEdge, 'id' | 'to' | 'from' | 'properties'> {
    id: string;
    to: string;
    from: string;
    properties?: {
        created_at: string;
        [key: string]: any;
    };
    arrows?: {
        to?: {
            enabled?: boolean;
            scaleFactor?: number;
        };
    };
    color?: {
        color: string;
    };
    font?: {
        size: number;
        align: string;
    };
    label?: string;
}

export default function Tree() {
    const project = useContext(projectContext);
    const [layout, setLayout] = useState<LayoutType>("hierarchical");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const networkRef = useRef<Network | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef<{ nodes: DataSet<VisNode>; edges: DataSet<VisEdge> } | null>(null);

    const getNodeColor = (type: string): NodeColors => {
        const colors: Record<string, NodeColors> = {
            workspace: { background: "#3B82F6", border: "#2563EB" },
            task: { background: "#10B981", border: "#059669" },
            user: { background: "#F59E0B", border: "#D97706" },
            document: { background: "#EF4444", border: "#DC2626" },
            default: { background: "#6B7280", border: "#4B5563" },
        };
        return colors[type] || colors.default;
    };

    const getNodeShape = (type: string): string => {
        const shapes: Record<string, string> = {
            workspace: "diamond",
            task: "square",
            user: "circle",
            document: "triangle",
            default: "dot",
        };
        return shapes[type] || shapes.default;
    };

    const getEdgeColor = (type: EdgeType): { color: string } => {
        const colors: Record<EdgeType | string, string> = {
            HAS_MEMBER: "#6366F1",
            ASSIGNED_TO: "#8B5CF6",
            DEPENDS_ON: "#EC4899",
            default: "#9CA3AF",
        };
        return { color: colors[type] || colors.default };
    };

    const generateNodeTooltip = (node: ApiNode): string => {
        const properties = node.properties || {};
        const formattedProperties = Object.entries(properties)
            .filter(([key]) => key !== "name")
            .map(([key, value]) => {
                const formattedKey = key.replace(/_/g, " ");
                return `<span>${formattedKey}: ${value}</span><br/>`;
            })
            .join("");

        const statusLine = node.status ? `Status: ${node.status}<br/>` : "";
        const priorityLine = node.priority ? `Priority: ${node.priority}<br/>` : "";
        const assigneeLine = node.assignee ? `Assignee: ${node.assignee}<br/>` : "";

        return `
            <div style="padding: 10px; background-color: #ffffff; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <strong style="color: #111827; font-size: 14px;">
                    ${properties.name || node.label || "Unnamed"}
                </strong>
                <div style="margin-top: 4px; color: #4B5563; font-size: 12px;">
                    ${formattedProperties}
                    ${statusLine}
                    ${priorityLine}
                    ${assigneeLine}
                </div>
            </div>
        `;
    };

    const transformData = (apiData: ApiData) => {
        try {
            // Clear existing data if any
            if (dataRef.current) {
                dataRef.current.nodes.clear();
                dataRef.current.edges.clear();
            }

            // Transform nodes
            const nodes = new DataSet<VisNode>(
                apiData.nodes.map((node) => ({
                    ...node,
                    id: String(node.id),
                    color: getNodeColor(node.type),
                    font: {
                        color: "#ffffff",
                        size: 14,
                    },
                    shape: getNodeShape(node.type),
                    size: 30,
                    title: generateNodeTooltip(node),
                }))
            );

            // Transform edges
            const edges = new DataSet<VisEdge>(
                apiData.edges.map((edge) => ({
                    ...edge,
                    id: String(edge.id),
                    from: String(edge.from),
                    to: String(edge.to),
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 0.5,
                        },
                    },
                    color: getEdgeColor(edge.type),
                    label: edge.type.toLowerCase().replace(/_/g, " "),
                    font: {
                        size: 10,
                        align: "middle",
                    },
                }))
            );

            dataRef.current = { nodes, edges };
            return { nodes, edges };
        } catch (error) {
            console.error('Error transforming data:', error);
            throw new Error('Failed to transform graph data');
        }
    };

    const createNetwork = (data: ReturnType<typeof transformData>) => {
        if (!containerRef.current) return;

        try {
            // Destroy existing network if it exists
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }

            const options = {
                nodes: {
                    borderWidth: 2,
                    shadow: true,
                    font: {
                        color: "#ffffff",
                        size: 14,
                        face: "Arial",
                    },
                },
                edges: {
                    width: 2,
                    shadow: true,
                    smooth: {
                        type: layout === "force" ? "dynamic" : "cubicBezier",
                        forceDirection: "none",
                        roundness: 0.5,
                    },
                },
                physics: {
                    enabled: layout === "force",
                    barnesHut: {
                        gravitationalConstant: -2000,
                        centralGravity: 0.3,
                        springLength: 200,
                        springConstant: 0.04,
                        damping: 0.09,
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 1000,
                        updateInterval: 50,
                    },
                },
                layout: {
                    hierarchical: {
                        enabled: layout === "hierarchical",
                        direction: "UD",
                        sortMethod: "directed",
                        nodeSpacing: 150,
                        levelSeparation: 150,
                        treeSpacing: 200,
                    },
                },
                interaction: {
                    dragNodes: true,
                    dragView: true,
                    zoomView: true,
                    hover: true,
                    tooltipDelay: 200,
                    keyboard: {
                        enabled: true,
                        speed: { x: 10, y: 10, zoom: 0.1 },
                        bindToWindow: true,
                    },
                },
            };

            networkRef.current = new Network(
                containerRef.current,
                { 
                    nodes: data.nodes,
                    edges: data.edges 
                },
                options as any
            );

            // Add event listeners
            networkRef.current.on("selectNode", (params: { nodes: string[] }) => {
                const selectedNode = data.nodes.get(params.nodes[0]);
                console.log("Selected node:", selectedNode);
            });

            networkRef.current.on("stabilizationProgress", (params: { iterations: number; total: number }) => {
                const progress = Math.round((params.iterations / params.total) * 100);
                console.log("Layout stabilization:", progress + "%");
            });

            networkRef.current.on("stabilizationIterationsDone", () => {
                console.log("Layout stabilization finished");
                networkRef.current?.fit();
            });

        } catch (error) {
            console.error('Error creating network:', error);
            setError('Failed to create network visualization');
            throw error;
        }
    };

    const refreshGraph = async () => {
        setError(null);
        setIsLoading(true);
        
        try {
            // Clean up existing network and data
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
            
            if (dataRef.current) {
                dataRef.current.nodes.clear();
                dataRef.current.edges.clear();
            }

            const data = await getGraph({
                aiServiceId: project.aiServiceId,
            });

            const transformedData = transformData(data);
            createNetwork(transformedData);
        } catch (error) {
            console.error("Error refreshing graph:", error);
            setError('Failed to load graph data');
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
            if (dataRef.current) {
                dataRef.current.nodes.clear();
                dataRef.current.edges.clear();
                dataRef.current = null;
            }
        };
    }, []);

    // Initialize and handle layout changes
    useEffect(() => {
        refreshGraph();
    }, [layout, project.aiServiceId]);

    return (
        <div className="w-full border-2 bg-myslate-900 rounded-2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Graph Visualization</h2>
                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}
                    <div className="flex space-x-4 items-center">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`flex gap-2 items-center px-4 py-2 font-semibold text-sm ${
                                    layout === "hierarchical"
                                        ? "bg-white text-myslate-950"
                                        : "bg-myslate-800 text-white"
                                } rounded-lg`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setLayout("hierarchical");
                                }}
                                disabled={isLoading}
                            >
                                Force Directed Layout
                            </button>
                            <button
                                type="button"
                                className={`flex gap-2 items-center px-4 py-2 font-semibold text-sm ${
                                    layout === "force"
                                        ? "bg-white text-myslate-950"
                                        : "bg-myslate-800 text-white"
                                } rounded-lg`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setLayout("force");
                                }}
                                disabled={isLoading}
                            >
                                Hierarchical Layout
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className={`w-full h-[600px] border border-gray-200 rounded-xl bg-myslate-800 ${
                        isLoading ? "opacity-50" : ""
                    }`}
                />
            </div>
        </div>
    );
}