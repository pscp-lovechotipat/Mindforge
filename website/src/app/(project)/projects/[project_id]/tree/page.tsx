"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
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

interface VisNode extends ApiNode {
    color?: {
        background: string;
        border: string;
    };
    font?: {
        color: string;
        size: number;
    };
    shape?: string;
    size?: number;
    title?: string;
}

interface VisEdge extends Omit<ApiEdge, "properties"> {
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
    const networkRef = useRef<Network | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getNodeColor = (type: string) => {
        const colors: Record<string, { background: string; border: string }> = {
            workspace: { background: "#3B82F6", border: "#2563EB" },
            task: { background: "#10B981", border: "#059669" },
            user: { background: "#F59E0B", border: "#D97706" },
            document: { background: "#EF4444", border: "#DC2626" },
            default: { background: "#6B7280", border: "#4B5563" },
        };
        return colors[type] || colors.default;
    };

    const getNodeShape = (type: string) => {
        const shapes: Record<string, string> = {
            workspace: "diamond",
            task: "square",
            user: "circle",
            document: "triangle",
            default: "dot",
        };
        return shapes[type] || shapes.default;
    };

    const getEdgeColor = (type: EdgeType) => {
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
        return `
      <div style="padding: 10px;">
        <strong>${properties.name || node.label || "Unnamed"}</strong><br/>
        ${Object.entries(properties)
            .filter(([key]) => key !== "name")
            .map(
                ([key, value]) => `
            <span>${key.replace(/_/g, " ")}: ${value}</span><br/>
          `
            )
            .join("")}
        ${node.status ? `Status: ${node.status}<br/>` : ""}
        ${node.priority ? `Priority: ${node.priority}<br/>` : ""}
        ${node.assignee ? `Assignee: ${node.assignee}<br/>` : ""}
      </div>
    `;
    };

    const transformData = (apiData: ApiData) => {
        const nodes = new DataSet<VisNode>(
            apiData.nodes.map((node) => ({
                ...node,
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

        const edges = new DataSet<VisEdge>(
            apiData.edges.map((edge) => ({
                ...edge,
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

        return { nodes, edges };
    };

    const createNetwork = (data: ReturnType<typeof transformData>) => {
        if (!containerRef.current) return;

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

        if (networkRef.current) {
            networkRef.current.destroy();
        }

        networkRef.current = new Network(
            containerRef.current,
            data,
            options as any
        );

        networkRef.current.on("selectNode", (params: { nodes: number[] }) => {
            const selectedNode = data.nodes.get(params.nodes[0]);
            console.log("Selected node:", selectedNode);
        });

        networkRef.current.on(
            "stabilizationProgress",
            (params: { iterations: number; total: number }) => {
                const progress = Math.round(
                    (params.iterations / params.total) * 100
                );
                console.log("Layout stabilization:", progress + "%");
            }
        );

        networkRef.current.on("stabilizationIterationsDone", () => {
            console.log("Layout stabilization finished");
            networkRef.current?.fit();
        });
    };

    const refreshGraph = async () => {
        // Sample data - replace with actual API call
        // const sampleData: ApiData = {
        //     nodes: [
        //         {
        //             id: 0,
        //             status: null,
        //             priority: null,
        //             assignee: null,
        //             created_at: "2024-11-07T20:25:33.951991",
        //             label: "jhgdfdhjhkjlghfg",
        //             properties: {
        //                 name: "jhgdfdhjhkjlghfg",
        //                 team_size: 3,
        //                 created_at: "2024-11-07T20:25:33.951991",
        //                 type: "workspace",
        //                 document_count: 1,
        //             },
        //             type: "workspace",
        //         },
        //     ],
        //     edges: [
        //         {
        //             id: 71,
        //             to: 69,
        //             from: 0,
        //             properties: {
        //                 created_at: "2024-11-07T20:25:35.452522",
        //             },
        //             type: "HAS_MEMBER",
        //         },
        //     ],
        // };

        const data = await getGraph({
            aiServiceId: project.aiServiceId,
        });

        const transformedData = transformData(data);
        createNetwork(transformedData);
    };

    useEffect(() => {
        refreshGraph();
    }, [layout]);

    return (
        <div className="w-full border-2 bg-myslate-900 rounded-2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        Graph Visualization
                    </h2>

                    <div className="flex space-x-4 items-center">
                        {/* <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={refreshGraph}
                        >
                            
                        </Button> */}
                        <button
                            type="button"
                            className="flex gap-2 items-center px-4 py-2 font-semibold text-sm bg-white text-myslate-950 rounded-lg"
                        >
                            <RefreshCw className="h-4 w-4" strokeWidth={3} />

                            <p>Refresh</p>
                        </button>

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
                            >
                                Hierarchical Layout
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="w-full h-[600px] border border-gray-200 rounded-xl bg-myslate-800"
                />
            </div>
        </div>
    );
}
