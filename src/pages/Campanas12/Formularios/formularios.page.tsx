import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Handle,
  Edge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

const boxStyle: React.CSSProperties = {
  padding: 10,
  border: '1px solid #222',
  borderRadius: 5,
  background: '#fff',
  width: 200,
  textAlign: 'center'
};

interface CustomNodeData {
  label: string;
}

// Facebook node
const CustomNode = ({ data }: { data: CustomNodeData }) => (
  <div style={boxStyle}>
    <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
    <div>{data.label}</div>
  </div>
);

// CRM node
const TargetNode = ({ data }: { data: CustomNodeData }) => (
  <div style={boxStyle}>
    <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
    <div>{data.label}</div>
  </div>
);

// Header node
const HeaderNode = ({ data }: { data: CustomNodeData }) => (
  <div style={{
    ...boxStyle,
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    border: '2px solid #888'
  }}>
    {data.label}
  </div>
);

const nodeTypes = {
  sourceNode: CustomNode,
  targetNode: TargetNode,
  headerNode: HeaderNode,
};

export const FormulariosPage = () => {
  const initialNodes = [
    {
        id: 'label-fb',
        position: { x: 100, y: 40 },
        data: { label: 'FORMULARIO FACEBOOK' },
        type: 'headerNode',
        draggable: false
      },
      {
        id: 'label-crm',
        position: { x: 500, y: 40 },
        data: { label: 'FORMULARIO CRM' },
        type: 'headerNode',
        draggable: false
      },
    {
      id: 'fb-nombre',
      position: { x: 100, y: 140 },
      data: { label: 'nombre_y_apellidos' },
      type: 'sourceNode',
      draggable: false
    },
    {
      id: 'fb-telefono',
      position: { x: 100, y: 240 },
      data: { label: 'número_de_teléfono' },
      type: 'sourceNode',
      draggable: false
    },
    {
      id: 'fb-city',
      position: { x: 100, y: 340 },
      data: { label: 'ciudad' },
      type: 'sourceNode',
      draggable: false
    },
    {
      id: 'crm-nombres',
      position: { x: 500, y: 140 },
      data: { label: 'full_name' },
      type: 'targetNode',
      draggable: false
    },
    {
      id: 'crm-phone',
      position: { x: 500, y: 240 },
      data: { label: 'cellphone' },
      type: 'targetNode',
      draggable: false
    },
    {
      id: 'crm-ciudad',
      position: { x: 500, y: 340 },
      data: { label: 'ciudad' },
      type: 'targetNode',
      draggable: false
    },
    {
      id: 'crm-fecha',
      position: { x: 500, y: 440 },
      data: { label: 'fecha nacimiento' },
      type: 'targetNode',
      draggable: false
    }
  ];

  const initialEdges: Edge<any>[] = [
    { id: 'e1', source: 'fb-nombre', target: 'crm-full_name', animated: true },
    { id: 'e2', source: 'fb-telefono', target: 'crm-phone', animated: true },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  );

  return (
    <div
      className="main-content app-content main-content--page"
      style={{ paddingLeft: '0rem', paddingRight: '0rem' }}
    >
      <div className="container-fluid">
        <div style={{ width: '100%', height: 'calc(100vh - 5rem)', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <MiniMap />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default FormulariosPage;
