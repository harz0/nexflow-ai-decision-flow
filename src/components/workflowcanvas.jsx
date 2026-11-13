
import { useCallback, useMemo, useRef, useState } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "decision",
    position: { x: 180, y: 120 },
    data: {
      label: "AI Decision",
      prompt: "Is the customer request urgent?",
      status: "idle",
    },
  },
];

function DecisionNode({ data, selected }) {
  const status = data?.status || "idle";

  const borderColor =
    status === "YES"
      ? "border-emerald-400"
      : status === "NO"
      ? "border-red-400"
      : status === "running"
      ? "border-blue-400"
      : selected
      ? "border-blue-400"
      : "border-slate-700";

  return (
    <div
      className={`w-64 rounded-xl border-2 ${borderColor} bg-[#132238] p-4 text-white shadow-xl`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable
        className="!h-3 !w-3 !border-2 !border-white !bg-blue-500"
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-lg text-violet-300">
            ✦
          </div>
          <span className="text-sm font-semibold">
            {data?.label || "AI Decision"}
          </span>
        </div>
        <span className="text-[9px] tracking-widest text-slate-500">
          AI NODE
        </span>
      </div>

      <p className="min-h-10 break-words text-xs leading-5 text-slate-300">
        {data?.prompt || "No prompt configured"}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3">
        <span className="text-[10px] text-slate-500">STATUS</span>
        <span
          className={`text-xs font-bold ${
            status === "YES"
              ? "text-emerald-400"
              : status === "NO"
              ? "text-red-400"
              : status === "running"
              ? "text-blue-400"
              : "text-slate-400"
          }`}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div className="mt-4 flex justify-between px-2 text-[10px] font-bold">
        <span className="text-emerald-400">YES</span>
        <span className="text-red-400">NO</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        isConnectable
        style={{
          left: "25%",
          width: 12,
          height: 12,
          background: "#10b981",
          border: "2px solid white",
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        isConnectable
        style={{
          left: "75%",
          width: 12,
          height: 12,
          background: "#ef4444",
          border: "2px solid white",
        }}
      />
    </div>
  );
}

const nodeTypes = { decision: DecisionNode };

function PanelTitle({ title, subtitle }) {
  return (
    <div className="mb-4 border-b border-slate-800 pb-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-[10px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

function ActionButton({ children, onClick, disabled, color = "blue" }) {
  const styles = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
    red: "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    gray: "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[color]}`}
    >
      {children}
    </button>
  );
}

function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);

  const handleNodesChange = useCallback(
    (changes) => {
      const validChanges = changes.filter(
        (change) => change && typeof change.type === "string"
      );
      onNodesChange(validChanges);
    },
    [onNodesChange]
  );

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState("1");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState([]);
  const [saveStatus, setSaveStatus] = useState("Not saved yet");

  const wrapperRef = useRef(null);
  const importInputRef = useRef(null);
  const idCounter = useRef(2);

  const safeNodes = useMemo(
    () => nodes.filter((node) => node && node.id && node.data),
    [nodes]
  );

  const safeEdges = useMemo(
    () =>
      edges.filter(
        (edge) => edge && edge.source && edge.target
      ),
    [edges]
  );

  const selectedNodeData = safeNodes.find(
    (node) => node.id === selectedNode
  );

  const yesCount = safeNodes.filter(
    (node) => node.data.status === "YES"
  ).length;

  const noCount = safeNodes.filter(
    (node) => node.data.status === "NO"
  ).length;

  const addDecisionNode = useCallback(
    (position) => {
      if (isExecuting) return;

      const newId = `node-${Date.now()}-${idCounter.current++}`;

      const newNode = {
        id: newId,
        type: "decision",
        position: position || {
          x: 180 + safeNodes.length * 40,
          y: 180 + safeNodes.length * 40,
        },
        data: {
          label: "AI Decision",
          prompt: "Enter your decision question...",
          status: "idle",
        },
      };

      setNodes((current) => [
        ...current.filter(Boolean),
        newNode,
      ]);

      setSelectedNode(newId);
    },
    [isExecuting, safeNodes.length, setNodes]
  );

  const onConnect = useCallback(
    (params) => {
      if (!params.sourceHandle || !params.source || !params.target) {
        return;
      }

      if (params.source === params.target) return;

      setEdges((currentEdges) => {
        const existing = currentEdges.filter(Boolean);

        const duplicate = existing.some(
          (edge) =>
            edge.source === params.source &&
            edge.sourceHandle === params.sourceHandle
        );

        if (duplicate) return existing;

        return addEdge(
          {
            ...params,
            label: params.sourceHandle.toUpperCase(),
            animated: true,
            style: {
              stroke:
                params.sourceHandle === "yes"
                  ? "#10b981"
                  : "#ef4444",
              strokeWidth: 2,
            },
          },
          existing
        );
      });
    },
    [setEdges]
  );

  const deleteSelectedNode = () => {
    if (isExecuting || !selectedNode) return;

    const remaining = safeNodes.filter(
      (node) => node.id !== selectedNode
    );

    setNodes(remaining);

    setEdges((current) =>
      current.filter(
        (edge) =>
          edge &&
          edge.source !== selectedNode &&
          edge.target !== selectedNode
      )
    );

    setSelectedNode(remaining[0]?.id || "");
    setExecutionLog([]);
  };

  const updateSelectedPrompt = (prompt) => {
    if (!selectedNode) return;

    setNodes((current) =>
      current.filter(Boolean).map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              data: { ...node.data, prompt },
            }
          : node
      )
    );
  };

  const updateSelectedLabel = (label) => {
    if (!selectedNode) return;

    setNodes((current) =>
      current.filter(Boolean).map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              data: { ...node.data, label },
            }
          : node
      )
    );
  };

  const saveWorkflow = () => {
    if (isExecuting) return;

    try {
      const workflow = {
        version: 1,
        nodes: safeNodes.map((node) => ({
          ...node,
          data: { ...node.data, status: "idle" },
        })),
        edges: safeEdges,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem("nexflow-workflow", JSON.stringify(workflow));
      setSaveStatus("Saved in this browser");
      setExecutionLog(["Workflow saved successfully."]);
    } catch (error) {
      console.error("Workflow save error:", error);
      setSaveStatus("Save failed");
      setExecutionLog([`Save error: ${error.message}`]);
    }
  };

  const loadWorkflow = () => {
    if (isExecuting) return;

    try {
      const saved = localStorage.getItem("nexflow-workflow");

      if (!saved) {
        setSaveStatus("No saved workflow found");
        setExecutionLog(["No saved workflow was found in this browser."]);
        return;
      }

      const workflow = JSON.parse(saved);

      if (
        !workflow ||
        !Array.isArray(workflow.nodes) ||
        !Array.isArray(workflow.edges)
      ) {
        throw new Error("Saved workflow has an invalid format.");
      }

      const restoredNodes = workflow.nodes
        .filter((node) => node && node.id && node.position && node.data)
        .map((node) => ({
          ...node,
          data: { ...node.data, status: "idle" },
        }));

      const restoredIds = new Set(restoredNodes.map((node) => node.id));
      const restoredEdges = workflow.edges.filter(
        (edge) =>
          edge &&
          edge.id &&
          restoredIds.has(edge.source) &&
          restoredIds.has(edge.target)
      );

      if (restoredNodes.length === 0) {
        throw new Error("The saved workflow contains no valid nodes.");
      }

      setNodes(restoredNodes);
      setEdges(restoredEdges);
      setSelectedNode(restoredNodes[0].id);
      setExecutionLog(["Workflow loaded successfully."]);
      setSaveStatus("Loaded from this browser");
    } catch (error) {
      console.error("Workflow load error:", error);
      setSaveStatus("Load failed");
      setExecutionLog([`Load error: ${error.message}`]);
    }
  };

  const exportWorkflow = () => {
    if (isExecuting) return;

    try {
      const workflow = {
        format: "nexflow-workflow",
        version: 1,
        nodes: safeNodes.map((node) => ({
          ...node,
          data: { ...node.data, status: "idle" },
        })),
        edges: safeEdges,
        exportedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(workflow, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "nexflow-workflow.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setExecutionLog(["Workflow exported as JSON successfully."]);
    } catch (error) {
      console.error("Workflow export error:", error);
      setExecutionLog([`Export error: ${error.message}`]);
    }
  };

  const importWorkflow = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (isExecuting) {
        throw new Error("Wait for the current execution to finish.");
      }

      if (!file.name.toLowerCase().endsWith(".json")) {
        throw new Error("Please select a .json workflow file.");
      }

      const text = await file.text();
      const workflow = JSON.parse(text);

      if (
        !workflow ||
        !Array.isArray(workflow.nodes) ||
        !Array.isArray(workflow.edges)
      ) {
        throw new Error("Invalid workflow file. Nodes and edges are required.");
      }

      const importedNodes = workflow.nodes
        .filter(
          (node) =>
            node &&
            typeof node.id === "string" &&
            node.id.trim() &&
            node.type === "decision" &&
            node.position &&
            Number.isFinite(node.position.x) &&
            Number.isFinite(node.position.y) &&
            node.data &&
            typeof node.data === "object"
        )
        .map((node) => ({
          ...node,
          data: {
            ...node.data,
            label: String(node.data.label || "AI Decision"),
            prompt: String(node.data.prompt || ""),
            status: "idle",
          },
        }));

      if (importedNodes.length === 0) {
        throw new Error("The JSON file contains no valid decision nodes.");
      }

      const importedIds = new Set(importedNodes.map((node) => node.id));
      const importedEdges = workflow.edges.filter(
        (edge) =>
          edge &&
          typeof edge.id === "string" &&
          importedIds.has(edge.source) &&
          importedIds.has(edge.target) &&
          (edge.sourceHandle === "yes" || edge.sourceHandle === "no")
      );

      setNodes(importedNodes);
      setEdges(importedEdges);
      setSelectedNode(importedNodes[0].id);
      setExecutionLog([
        `Imported ${importedNodes.length} node(s) and ${importedEdges.length} connection(s).`,
      ]);
      setSaveStatus(`Imported ${file.name}`);
    } catch (error) {
      console.error("Workflow import error:", error);
      setExecutionLog([`Import error: ${error.message}`]);
      setSaveStatus("Import failed");
    } finally {
      event.target.value = "";
    }
  };

  const resetExecution = () => {
    if (isExecuting) return;

    setNodes((current) =>
      current.filter(Boolean).map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" },
      }))
    );

    setExecutionLog([]);
  };

  const executeWorkflow = async () => {
    if (isExecuting) return;

    if (safeNodes.length === 0) {
      setExecutionLog(["No decision nodes found. Add a node first."]);
      return;
    }

    const startNode = safeNodes.find(
      (node) =>
        !safeEdges.some((edge) => edge.target === node.id)
    );

    if (!startNode) {
      setExecutionLog([
        "No starting node found. Check your connections.",
      ]);
      return;
    }

    setIsExecuting(true);
    setExecutionLog([]);

    setNodes((current) =>
      current.filter(Boolean).map((node) => ({
        ...node,
        data: { ...node.data, status: "idle" },
      }))
    );

    const visited = new Set();
    const logs = [];
    let currentNode = startNode;

    try {
      while (currentNode) {
        if (visited.has(currentNode.id)) {
          logs.push("Cycle detected. Workflow stopped.");
          break;
        }

        visited.add(currentNode.id);

        const executingNodeId = currentNode.id;

        setNodes((current) =>
          current.filter((node) => node && node.id && node.data).map((node) =>
            node.id === executingNodeId
              ? {
                  ...node,
                  data: { ...node.data, status: "running" },
                }
              : node
          )
        );

        logs.push(
          `Running ${currentNode.data.label}: ${currentNode.data.prompt}`
        );
        setExecutionLog([...logs]);

        const response = await fetch(
          "http://localhost:3001/api/decision",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: currentNode.data.prompt,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "AI decision request failed"
          );
        }

        const answer = String(result.answer || "")
          .trim()
          .toUpperCase();

        if (answer !== "YES" && answer !== "NO") {
          throw new Error("AI returned an invalid decision");
        }

        const completedNodeId = currentNode.id;

        setNodes((current) =>
          current.filter((node) => node && node.id && node.data).map((node) =>
            node.id === completedNodeId
              ? {
                  ...node,
                  data: { ...node.data, status: answer },
                }
              : node
          )
        );

        logs.push(`${currentNode.data.label} result: ${answer}`);
        setExecutionLog([...logs]);

        const nextEdge = safeEdges.find(
          (edge) =>
            edge.source === currentNode.id &&
            edge.sourceHandle === answer.toLowerCase()
        );

        if (!nextEdge) {
          logs.push("Workflow completed.");
          currentNode = null;
          break;
        }

        const nextNode = safeNodes.find(
          (node) => node.id === nextEdge.target
        );

        if (!nextNode) {
          throw new Error("The connected node no longer exists.");
        }

        currentNode = nextNode;
      }
    } catch (error) {
      logs.push(`Error: ${error.message}`);
    } finally {
      setExecutionLog([...logs]);
      setIsExecuting(false);
    }
  };

  const onDragStart = (event) => {
    event.dataTransfer.setData("application/nexflow-node", "decision");
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();

    if (!wrapperRef.current || isExecuting) return;

    const type = event.dataTransfer.getData(
      "application/nexflow-node"
    );

    if (type !== "decision") return;

    const bounds = wrapperRef.current.getBoundingClientRect();

    const position = {
      x: event.clientX - bounds.left - 100,
      y: event.clientY - bounds.top - 40,
    };

    addDecisionNode(position);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1726] shadow-2xl">

      {/* Workspace header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-200">
            Lead qualification workflow
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Visual AI decision pipeline
          </p>
          <p className="mt-1 text-[10px] text-teal-400">{saveStatus}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ActionButton color="green" onClick={saveWorkflow} disabled={isExecuting}>
            Save workflow
          </ActionButton>

          <ActionButton color="gray" onClick={loadWorkflow} disabled={isExecuting}>
            Load workflow
          </ActionButton>

          <ActionButton color="blue" onClick={exportWorkflow} disabled={isExecuting}>
            Export JSON
          </ActionButton>

          <ActionButton
            color="gray"
            onClick={() => importInputRef.current?.click()}
            disabled={isExecuting}
          >
            Import JSON
          </ActionButton>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={importWorkflow}
            className="hidden"
          />

          <ActionButton color="gray" onClick={resetExecution} disabled={isExecuting}>
            Reset
          </ActionButton>

          <ActionButton color="red" onClick={deleteSelectedNode} disabled={isExecuting || !selectedNode}>
            Delete node
          </ActionButton>

          <ActionButton color="blue" onClick={() => addDecisionNode()} disabled={isExecuting}>
            + Add node
          </ActionButton>

          <button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:brightness-110 disabled:opacity-50"
          >
            {isExecuting ? "Running..." : "▶ Test Run"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 border-b border-slate-800">
        {[
          ["NODES", safeNodes.length],
          ["YES RESULTS", yesCount],
          ["NO RESULTS", noCount],
        ].map(([label, value]) => (
          <div key={label} className="border-r border-slate-800 px-4 py-3 last:border-r-0">
            <p className="text-[9px] tracking-widest text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-100">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Three-panel editor */}
      <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)_260px]">

        {/* Left sidebar */}
        <aside className="border-b border-slate-800 bg-[#0d1929] p-4 lg:border-b-0 lg:border-r">
          <PanelTitle
            title="Node library"
            subtitle="Drag a node into the canvas"
          />

          <div
            draggable={!isExecuting}
            onDragStart={onDragStart}
            onClick={() => addDecisionNode()}
            className="cursor-grab rounded-xl border border-violet-500/30 bg-violet-500/10 p-3 transition hover:border-violet-400 hover:bg-violet-500/20 active:cursor-grabbing"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                ✦
              </span>
              <span className="text-xs font-semibold text-white">
                AI Decision
              </span>
            </div>
            <p className="text-[10px] leading-4 text-slate-400">
              Ask an AI question and branch based on YES or NO.
            </p>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-widest text-violet-300">
              + Click or drag
            </p>
          </div>

          <div className="mt-6">
            <PanelTitle title="Workflow legend" />
            <div className="space-y-3 text-[11px] text-slate-400">
              <p><span className="mr-2 text-emerald-400">●</span> YES branch</p>
              <p><span className="mr-2 text-red-400">●</span> NO branch</p>
              <p><span className="mr-2 text-blue-400">●</span> Executing</p>
              <p><span className="mr-2 text-slate-500">●</span> Not executed</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-[#101f32] p-3">
            <p className="text-[10px] font-semibold text-teal-300">
              WORKFLOW TIP
            </p>
            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              Connect the YES and NO handles to different nodes to create conditional paths.
            </p>
          </div>
        </aside>

        {/* Center canvas */}
        <section className="min-w-0 bg-[#081321]">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Workflow canvas
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Drag nodes · Connect handles · Build branches
              </p>
            </div>

            <span className="rounded-md border border-slate-700 px-2 py-1 text-[9px] text-slate-400">
              {safeNodes.length} NODES
            </span>
          </div>

          <div
            ref={wrapperRef}
            className="h-[650px] w-full"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <ReactFlow
              nodes={safeNodes}
              edges={safeEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(event, node) => setSelectedNode(node.id)}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              nodesConnectable={!isExecuting}
              nodesDraggable={!isExecuting}
              edgesReconnectable={!isExecuting}
              deleteKeyCode={null}
              colorMode="dark"
            >
              <Background color="#23364b" gap={22} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const status = node?.data?.status;
                  if (status === "YES") return "#10b981";
                  if (status === "NO") return "#ef4444";
                  return "#3b82f6";
                }}
                maskColor="rgba(3, 10, 20, 0.75)"
              />
            </ReactFlow>
          </div>
        </section>

        {/* Right inspector */}
        <aside className="border-t border-slate-800 bg-[#0d1929] p-4 lg:border-l lg:border-t-0">
          <PanelTitle
            title="Node inspector"
            subtitle="Configure selected node"
          />

          {selectedNodeData ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                <p className="text-[9px] font-bold tracking-widest text-blue-300">
                  SELECTED NODE
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {selectedNodeData.data.label}
                </p>
                <p className="mt-1 break-all text-[10px] text-slate-400">
                  ID: {selectedNodeData.id}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Node name
                </label>
                <input
                  value={selectedNodeData.data.label || ""}
                  onChange={(event) =>
                    updateSelectedLabel(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-[#091523] p-3 text-xs text-white outline-none focus:border-blue-500"
                  placeholder="Node name"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  AI system prompt
                </label>
                <textarea
                  value={selectedNodeData.data.prompt || ""}
                  onChange={(event) =>
                    updateSelectedPrompt(event.target.value)
                  }
                  rows={6}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-[#091523] p-3 text-xs leading-5 text-white outline-none focus:border-blue-500"
                  placeholder="Enter your decision question..."
                />
                <p className="mt-2 text-[10px] leading-4 text-slate-500">
                  The AI will evaluate this question and return YES or NO.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#101f32] p-3">
                <p className="text-[9px] font-bold tracking-widest text-slate-500">
                  LAST EXECUTION RESULT
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {selectedNodeData.data.status || "Not executed"}
                </p>
              </div>

              <ActionButton
                color="red"
                onClick={deleteSelectedNode}
                disabled={isExecuting}
              >
                Delete this node
              </ActionButton>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center">
              <p className="text-xs text-slate-300">No node selected</p>
              <p className="mt-2 text-[10px] text-slate-500">
                Add a node or select one from the canvas to edit its settings.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Execution console */}
      <div className="border-t border-slate-800 bg-[#0b1726] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">
              Execution console
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              AI workflow activity and results
            </p>
          </div>

          <span className={`rounded-full px-3 py-1 text-[10px] ${
            isExecuting
              ? "bg-blue-500/10 text-blue-300"
              : "bg-slate-800 text-slate-400"
          }`}>
            {isExecuting ? "RUNNING" : "READY"}
          </span>
        </div>

        <div className="max-h-48 min-h-16 space-y-2 overflow-y-auto rounded-lg bg-[#07111f] p-3">
          {executionLog.length === 0 ? (
            <p className="text-[11px] text-slate-600">
              Waiting for workflow execution...
            </p>
          ) : (
            executionLog.map((log, index) => (
              <p
                key={index}
                className={`break-words text-[11px] leading-5 ${
                  log.includes("result: YES")
                    ? "text-emerald-400"
                    : log.includes("result: NO") || log.includes("Error") || log.includes("Cycle")
                    ? "text-red-400"
                    : "text-slate-300"
                }`}
              >
                <span className="mr-2 text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {log}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowCanvas;
