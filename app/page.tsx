"use client";

import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

type Point = [number, number];
type Measurement = { id: number; start: Point; end: Point };
type Furniture = { id:number; label:string; x:number; y:number; widthCm:number; depthCm:number; rotation:number };
type Room = { id: string; name: string; points: Point[]; width?: number; depth?: number };
type Plan = {
  id: "a" | "b";
  label: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  pixelsPerMeter: number;
  scaleNote: string;
  rooms: Room[];
};

const plans: Plan[] = [
  {
    id: "a",
    label: "도면 1",
    image: "/plans/plan-1.png",
    imageWidth: 685,
    imageHeight: 514,
    pixelsPerMeter: 34.39,
    scaleNote: "하단 10.44m 기준",
    rooms: [
      { id: "a-kitchen", name: "주방 및 식당", points: [[428,120],[490,120],[490,190],[468,190],[468,265],[514,265],[514,271],[393,271],[393,220],[350,220],[350,151],[428,151]] },
      { id: "a-living", name: "거실", points: [[324,310],[451,310],[451,435],[324,435]], width: 3.77, depth: 3.28 },
      { id: "a-entry", name: "현관", points: [[253,218],[314,218],[314,310],[253,310]] },
      { id: "a-hall", name: "실내 복도", points: [[314,271],[514,271],[514,310],[314,310]] },
      { id: "a-bed1", name: "침실 · 우측 상단", points: [[469,152],[570,152],[570,265],[469,265]], width: 2.94, depth: 3.51 },
      { id: "a-bed2", name: "침실 · 우측 하단", points: [[451,311],[570,311],[570,435],[451,435]], width: 3.50, depth: 3.28 },
      { id: "a-bed3", name: "침실 · 좌측 하단", points: [[214,311],[324,311],[324,414],[214,414]], width: 3.17, depth: 2.68 },
      { id: "a-bath1", name: "욕실 · 중앙", points: [[314,221],[391,221],[391,270],[314,270]] },
      { id: "a-bath2", name: "욕실 · 우측", points: [[514,266],[570,266],[570,310],[514,310]] },
      { id: "a-bal1", name: "발코니 · 상단", points: [[361,102],[426,102],[426,151],[361,151]], width: 2.45, depth: 1.10 },
      { id: "a-bal2", name: "발코니 · 좌측 하단", points: [[214,414],[324,414],[324,445],[214,445]], width: 3.17, depth: .90 },
      { id: "a-bal3", name: "발코니 · 중앙 하단", points: [[324,435],[451,435],[451,454],[324,454]], width: 3.77, depth: .60 },
    ],
  },
  {
    id: "b",
    label: "도면 2",
    image: "/plans/plan-2.jpeg",
    imageWidth: 699,
    imageHeight: 512,
    pixelsPerMeter: 33.92,
    scaleNote: "상단 12.00m 기준",
    rooms: [
      { id: "b-kitchen", name: "주방 및 식당", points: [[349,70],[449,70],[449,275],[414,275],[414,234],[349,234]], width: 3.00, depth: 6.10 },
      { id: "b-living", name: "거실", points: [[249,275],[414,275],[414,404],[249,404]], width: 4.80, depth: 3.90 },
      { id: "b-entry", name: "현관", points: [[249,234],[306,234],[306,275],[249,275]] },
      { id: "b-hall", name: "실내 복도", points: [[306,234],[349,234],[349,275],[306,275]] },
      { id: "b-bed1", name: "침실 · 좌측 상단", points: [[249,133],[349,133],[349,234],[249,234]], width: 3.00, depth: 3.00 },
      { id: "b-bed2", name: "침실 · 우측 상단", points: [[450,113],[559,113],[559,194],[450,194]], width: 3.30, depth: 2.70 },
      { id: "b-bed3", name: "침실 · 우측 하단", points: [[414,275],[559,275],[559,404],[414,404]], width: 4.50, depth: 3.90 },
      { id: "b-bath1", name: "욕실 · 중앙", points: [[450,194],[505,194],[505,275],[450,275]] },
      { id: "b-bath2", name: "욕실 · 우측", points: [[505,194],[559,194],[559,275],[505,275]] },
      { id: "b-bal1", name: "발코니 · 좌측 상단", points: [[249,83],[349,83],[349,133],[249,133]] },
      { id: "b-bal2", name: "발코니 · 우측 상단", points: [[450,70],[559,70],[559,113],[450,113]], width: 3.30, depth: 1.00 },
      { id: "b-bal3", name: "발코니 · 하단", points: [[249,404],[559,404],[559,451],[249,451]], width: 9.30, depth: 1.50 },
    ],
  },
];

const pointsText = (points: Point[]) => points.map(([x,y]) => `${x},${y}`).join(" ");

function pixelBounds(room: Room) {
  const xs = room.points.map(([x]) => x);
  const ys = room.points.map(([,y]) => y);
  return {
    x: Math.min(...xs), y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

function metrics(plan: Plan, room: Room) {
  const b = pixelBounds(room);
  const width = room.width ?? b.w / plan.pixelsPerMeter;
  const depth = room.depth ?? b.h / plan.pixelsPerMeter;
  return {
    ...b,
    width,
    depth,
  };
}

function PlanMeasure({ plan, room }: { plan: Plan; room: Room }) {
  const m = metrics(plan,room);
  const inset = Math.min(10,Math.min(m.w,m.h) * .18);
  return <g className="plan-measure" aria-hidden="true">
    <line x1={m.x+inset} y1={m.y+m.h-inset} x2={m.x+m.w-inset} y2={m.y+m.h-inset}/>
    <path d={`M${m.x+inset},${m.y+m.h-inset} l6,-4 v8 z M${m.x+m.w-inset},${m.y+m.h-inset} l-6,-4 v8 z`}/>
    <text x={m.x+m.w/2} y={m.y+m.h-inset-5}>{m.width.toFixed(2)}m</text>
    <line x1={m.x+inset} y1={m.y+inset} x2={m.x+inset} y2={m.y+m.h-inset}/>
    <path d={`M${m.x+inset},${m.y+inset} l-4,6 h8 z M${m.x+inset},${m.y+m.h-inset} l-4,-6 h8 z`}/>
    <text className="vertical" x={m.x+inset+5} y={m.y+m.h/2}>{m.depth.toFixed(2)}m</text>
  </g>;
}

function PlanPicker({ plan, selected, onSelect }: { plan: Plan; selected: string; onSelect: (id:string)=>void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nextId = useRef(1);
  const [measureMode,setMeasureMode] = useState(false);
  const [measurements,setMeasurements] = useState<Measurement[]>([]);
  const [draft,setDraft] = useState<Point|null>(null);
  const [activeMeasurement,setActiveMeasurement] = useState<number|null>(null);
  const [dragging,setDragging] = useState<{id:number; end:"start"|"end"}|null>(null);
  const [activeEndpoint,setActiveEndpoint] = useState<"start"|"end">("end");
  const [zoom,setZoom] = useState(1);
  const [viewport,setViewport] = useState({x:0,y:0,w:plan.imageWidth,h:plan.imageHeight});
  const [panMode,setPanMode] = useState(false);
  const [panning,setPanning] = useState<{pointerId:number;clientX:number;clientY:number;x:number;y:number}|null>(null);
  const furnitureId = useRef(1);
  const [furnitureMode,setFurnitureMode] = useState(false);
  const [furnitureForm,setFurnitureForm] = useState({label:"침대",widthCm:180,depthCm:210});
  const [furnitures,setFurnitures] = useState<Furniture[]>([]);
  const [activeFurniture,setActiveFurniture] = useState<number|null>(null);
  const [draggingFurniture,setDraggingFurniture] = useState<number|null>(null);

  const currentFurniture=furnitures.find(item=>item.id===activeFurniture) ?? null;

  const clampViewport = (x:number,y:number,w:number,h:number) => ({
    x: Math.max(0,Math.min(plan.imageWidth-w,x)),
    y: Math.max(0,Math.min(plan.imageHeight-h,y)),
    w,
    h,
  });

  const changeZoom = (next:number) => {
    const value=Math.max(1,Math.min(5,next));
    const centerX=viewport.x+viewport.w/2;
    const centerY=viewport.y+viewport.h/2;
    const w=plan.imageWidth/value;
    const h=plan.imageHeight/value;
    setZoom(value);
    setViewport(clampViewport(centerX-w/2,centerY-h/2,w,h));
    if (value === 1) setPanMode(false);
  };

  const resetView = () => {
    setZoom(1);
    setViewport({x:0,y:0,w:plan.imageWidth,h:plan.imageHeight});
    setPanMode(false);
  };

  const updateFurniture = (id:number, patch:Partial<Furniture>) => {
    setFurnitures(items=>items.map(item=>item.id===id ? {...item,...patch} : item));
  };

  const addFurniture = () => {
    const room=plan.rooms.find(item=>item.id===selected)!;
    const bounds=pixelBounds(room);
    const id=furnitureId.current++;
    const item:Furniture={
      id,
      label:furnitureForm.label.trim() || "가구",
      x:bounds.x+bounds.w/2,
      y:bounds.y+bounds.h/2,
      widthCm:Math.max(20,Math.min(600,furnitureForm.widthCm || 20)),
      depthCm:Math.max(20,Math.min(600,furnitureForm.depthCm || 20)),
      rotation:0,
    };
    setFurnitures(items=>[...items,item]);
    setActiveFurniture(id);
  };

  const selectFurniture = (item:Furniture) => {
    setActiveFurniture(item.id);
    setFurnitureForm({label:item.label,widthCm:item.widthCm,depthCm:item.depthCm});
  };

  const changeFurnitureField = (field:"label"|"widthCm"|"depthCm", value:string) => {
    if (field === "label") {
      setFurnitureForm(form=>({...form,label:value}));
      if (activeFurniture !== null) updateFurniture(activeFurniture,{label:value || "가구"});
      return;
    }
    const parsed=Math.max(20,Math.min(600,Number(value) || 20));
    setFurnitureForm(form=>({...form,[field]:parsed}));
    if (activeFurniture !== null) updateFurniture(activeFurniture,{[field]:parsed});
  };

  const svgPoint = (event: {clientX:number;clientY:number}): Point => {
    const svg = svgRef.current;
    if (!svg) return [0,0];
    const matrix = svg.getScreenCTM();
    if (!matrix) return [0,0];
    const point = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
    return [Math.max(0,Math.min(plan.imageWidth,point.x)),Math.max(0,Math.min(plan.imageHeight,point.y))];
  };

  const addPoint = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!measureMode || dragging || panMode || panning) return;
    const target = event.target as Element;
    if (target.closest(".measure-line,.measure-handle,.measure-hit,.measure-handle-hit")) return;
    const point = svgPoint(event);
    if (!draft) {
      setDraft(point);
      return;
    }
    const id = nextId.current++;
    setMeasurements(items => [...items,{id,start:draft,end:point}]);
    setActiveMeasurement(id);
    setActiveEndpoint("end");
    setDraft(null);
  };

  const startDrag = (event: ReactPointerEvent<SVGCircleElement>, id:number, end:"start"|"end") => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveMeasurement(id);
    setActiveEndpoint(end);
    setDragging({id,end});
  };

  const startPan = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!panMode || zoom === 1) return;
    const target=event.target as Element;
    if (target.closest(".measure-handle-hit,.measure-handle")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanning({pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,x:viewport.x,y:viewport.y});
  };

  const startFurnitureDrag = (event:ReactPointerEvent<SVGGElement>, item:Furniture) => {
    if (!furnitureMode || panMode) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    selectFurniture(item);
    setDraggingFurniture(item.id);
  };

  const movePointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (panning) {
      const svg=svgRef.current;
      if (!svg) return;
      const dx=(event.clientX-panning.clientX)*(viewport.w/svg.clientWidth);
      const dy=(event.clientY-panning.clientY)*(viewport.h/svg.clientHeight);
      setViewport(clampViewport(panning.x-dx,panning.y-dy,viewport.w,viewport.h));
      return;
    }
    if (draggingFurniture !== null) {
      const [x,y]=svgPoint(event);
      updateFurniture(draggingFurniture,{x,y});
      return;
    }
    if (!dragging) return;
    const point = svgPoint(event);
    setMeasurements(items => items.map(item => item.id === dragging.id ? {...item,[dragging.end]:point} : item));
  };

  const finishPointer = () => {
    setDragging(null);
    setPanning(null);
    setDraggingFurniture(null);
  };

  const nudgeEndpoint = (dxCm:number,dyCm:number) => {
    if (activeMeasurement === null) return;
    const dx=dxCm*plan.pixelsPerMeter/100;
    const dy=dyCm*plan.pixelsPerMeter/100;
    setMeasurements(items => items.map(item => {
      if (item.id !== activeMeasurement) return item;
      const point=item[activeEndpoint];
      const moved:Point=[
        Math.max(0,Math.min(plan.imageWidth,point[0]+dx)),
        Math.max(0,Math.min(plan.imageHeight,point[1]+dy)),
      ];
      return {...item,[activeEndpoint]:moved};
    }));
  };

  const length = (measurement:Measurement) => {
    const dx = measurement.end[0]-measurement.start[0];
    const dy = measurement.end[1]-measurement.start[1];
    return Math.hypot(dx,dy)/plan.pixelsPerMeter;
  };

  const lengthText = (measurement:Measurement) => {
    const meters=length(measurement);
    return meters < 1 ? `${Math.round(meters*100)}cm` : `${meters.toFixed(2)}m`;
  };

  return <article className="plan-card">
    <div className="plan-title"><b>{plan.label}</b><span>{plan.scaleNote}</span></div>
    <div className="measure-toolbar">
      <button className={measureMode ? "active" : ""} onClick={() => {setMeasureMode(value=>!value);setFurnitureMode(false);setPanMode(false);setDraft(null);}}>⌁ 길이 측정</button>
      <button className={furnitureMode ? "active furniture-button" : "furniture-button"} onClick={() => {setFurnitureMode(value=>!value);setMeasureMode(false);setDraft(null);setPanMode(false);}}>▣ 가구 배치</button>
      <div className="zoom-controls" aria-label="평면도 확대 축소">
        <button onClick={() => changeZoom(zoom-.5)} disabled={zoom===1} aria-label="축소">−</button>
        <output>{Math.round(zoom*100)}%</output>
        <button onClick={() => changeZoom(zoom+.5)} disabled={zoom===5} aria-label="확대">＋</button>
        <button className={panMode ? "active" : ""} onClick={() => setPanMode(value=>!value)} disabled={zoom===1} aria-label="확대한 평면도 이동">이동</button>
        <button onClick={resetView} disabled={zoom===1}>맞춤</button>
      </div>
      {measureMode && <><span>{draft ? "끝점을 선택" : "두 점을 선택"}</span><button disabled={activeMeasurement===null} onClick={() => {setMeasurements(items=>items.filter(item=>item.id!==activeMeasurement));setActiveMeasurement(null);}}>삭제</button><button disabled={!measurements.length} onClick={() => {setMeasurements([]);setActiveMeasurement(null);setDraft(null);}}>초기화</button></>}
    </div>
    {measureMode && activeMeasurement !== null && <div className="precision-toolbar" aria-label="측정 끝점 미세 조정">
      <span>끝점</span>
      <button className={activeEndpoint === "start" ? "active" : ""} onClick={() => setActiveEndpoint("start")}>A</button>
      <button className={activeEndpoint === "end" ? "active" : ""} onClick={() => setActiveEndpoint("end")}>B</button>
      <i>1cm씩</i>
      <button onClick={() => nudgeEndpoint(-1,0)} aria-label="왼쪽으로 1cm">←</button>
      <button onClick={() => nudgeEndpoint(0,-1)} aria-label="위로 1cm">↑</button>
      <button onClick={() => nudgeEndpoint(0,1)} aria-label="아래로 1cm">↓</button>
      <button onClick={() => nudgeEndpoint(1,0)} aria-label="오른쪽으로 1cm">→</button>
    </div>}
    {furnitureMode && <div className="furniture-toolbar" aria-label="가구 크기와 방향 설정">
      <label>가구<input aria-label="가구 이름" value={furnitureForm.label} onChange={event=>changeFurnitureField("label",event.target.value)}/></label>
      <label>가로<input aria-label="가구 가로 길이" type="number" min="20" max="600" value={furnitureForm.widthCm} onChange={event=>changeFurnitureField("widthCm",event.target.value)}/><i>cm</i></label>
      <b>×</b>
      <label>세로<input aria-label="가구 세로 길이" type="number" min="20" max="600" value={furnitureForm.depthCm} onChange={event=>changeFurnitureField("depthCm",event.target.value)}/><i>cm</i></label>
      <button className="add-furniture" onClick={addFurniture}>{currentFurniture ? "같은 크기 추가" : "선택한 방에 배치"}</button>
      {currentFurniture && <div className="rotation-controls">
        <span>방향</span>
        <input aria-label="가구 회전 각도" type="range" min="0" max="359" value={currentFurniture.rotation} onChange={event=>updateFurniture(currentFurniture.id,{rotation:Number(event.target.value)})}/>
        <input aria-label="가구 회전 각도 숫자" type="number" min="0" max="359" value={Math.round(currentFurniture.rotation)} onChange={event=>updateFurniture(currentFurniture.id,{rotation:((Number(event.target.value)||0)%360+360)%360})}/>
        <i>°</i>
        <button onClick={()=>updateFurniture(currentFurniture.id,{rotation:(currentFurniture.rotation+90)%360})}>90° 회전</button>
        <button onClick={()=>{setFurnitures(items=>items.filter(item=>item.id!==currentFurniture.id));setActiveFurniture(null);}}>삭제</button>
      </div>}
    </div>}
    <svg ref={svgRef} className={`source-plan ${measureMode ? "measuring" : ""} ${furnitureMode ? "furnishing" : ""} ${panMode ? "panning" : ""}`} viewBox={`${viewport.x} ${viewport.y} ${viewport.w} ${viewport.h}`} role="img" aria-label={`${plan.label} 원본 평면도`} onClick={addPoint} onPointerDown={startPan} onPointerMove={movePointer} onPointerUp={finishPointer} onPointerCancel={finishPointer}>
      <image href={plan.image} width={plan.imageWidth} height={plan.imageHeight}/>
      {plan.rooms.map(room => <polygon
        key={room.id}
        points={pointsText(room.points)}
        className={`pick-region ${selected === room.id ? "active" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${room.name} 선택`}
        onClick={() => onSelect(room.id)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onSelect(room.id); }}
      />)}
      {!measureMode && !furnitureMode && <PlanMeasure plan={plan} room={plan.rooms.find(room => room.id === selected)!}/>} 
      {furnitures.map(item=>{
        const width=item.widthCm/100*plan.pixelsPerMeter;
        const depth=item.depthCm/100*plan.pixelsPerMeter;
        const active=item.id===activeFurniture;
        const isBed=item.label.includes("침대");
        return <g key={item.id} className={`furniture-item ${active ? "active" : ""}`} transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`} role="button" tabIndex={furnitureMode ? 0 : -1} aria-label={`${item.label} ${item.widthCm}×${item.depthCm}cm`} onClick={event=>{event.stopPropagation();selectFurniture(item);}} onPointerDown={event=>startFurnitureDrag(event,item)}>
          <rect className="furniture-hit" x={-width/2-4/zoom} y={-depth/2-4/zoom} width={width+8/zoom} height={depth+8/zoom} rx={4/zoom}/>
          <rect className="furniture-body" x={-width/2} y={-depth/2} width={width} height={depth} rx={Math.min(5,width*.08,depth*.08)}/>
          {isBed && <>
            <rect className="furniture-pillow" x={-width*.39} y={-depth*.39} width={width*.78} height={Math.min(depth*.2,width*.28)} rx={Math.min(4,width*.06)}/>
            <line className="furniture-seam" x1={-width*.42} y1={-depth*.13} x2={width*.42} y2={-depth*.13}/>
          </>}
          <g className="furniture-caption" transform={`scale(${1/zoom})`}>
            <text y="-1">{item.label}</text>
            <text y="9">{item.widthCm}×{item.depthCm}cm</text>
          </g>
        </g>;
      })}
      {measurements.map(measurement => {
        const midX=(measurement.start[0]+measurement.end[0])/2;
        const midY=(measurement.start[1]+measurement.end[1])/2;
        const active=measurement.id===activeMeasurement;
        return <g key={measurement.id} className={`free-measure ${active ? "active" : ""}`} onClick={event=>{event.stopPropagation();setActiveMeasurement(measurement.id);}}>
          <line className="measure-hit" x1={measurement.start[0]} y1={measurement.start[1]} x2={measurement.end[0]} y2={measurement.end[1]}/>
          <line className="measure-line" x1={measurement.start[0]} y1={measurement.start[1]} x2={measurement.end[0]} y2={measurement.end[1]}/>
          <circle className="measure-handle-hit" cx={measurement.start[0]} cy={measurement.start[1]} r={11/zoom} onClick={event=>event.stopPropagation()} onPointerDown={event=>startDrag(event,measurement.id,"start")}/>
          <circle className="measure-handle-hit" cx={measurement.end[0]} cy={measurement.end[1]} r={11/zoom} onClick={event=>event.stopPropagation()} onPointerDown={event=>startDrag(event,measurement.id,"end")}/>
          <circle className="measure-handle" cx={measurement.start[0]} cy={measurement.start[1]} r={3.2/zoom}/>
          <circle className="measure-handle" cx={measurement.end[0]} cy={measurement.end[1]} r={3.2/zoom}/>
          <g className="measure-label" transform={`translate(${midX} ${midY}) scale(${1/zoom})`}><rect x="-22" y="-17" width="44" height="15" rx="3"/><text y="-6.5">{lengthText(measurement)}</text></g>
        </g>;
      })}
      {draft && <g className="draft-point"><circle cx={draft[0]} cy={draft[1]} r={5/zoom}/><circle cx={draft[0]} cy={draft[1]} r={2/zoom}/></g>}
    </svg>
    <div className="room-list">
      {plan.rooms.map(room => {
        const m = metrics(plan, room);
        return <button key={room.id} className={selected === room.id ? "active" : ""} onClick={() => onSelect(room.id)}>
          <span>{room.name}</span><b>{m.width.toFixed(2)} × {m.depth.toFixed(2)}m</b>
        </button>;
      })}
    </div>
  </article>;
}

function CroppedRoom({ plan, room, id, maxWidth, maxHeight, anchor, overlay=false }: {
  plan: Plan; room: Room; id: string; maxWidth: number; maxHeight: number; anchor: string; overlay?: boolean;
}) {
  const m = metrics(plan,room);
  const dx = .18 + (anchor.includes("r") ? maxWidth - m.width : 0);
  const dy = .18 + (anchor.includes("b") ? maxHeight - m.depth : 0);
  const clipId = `clip-${id}`;
  return <g className={`crop-room ${plan.id} ${overlay ? "is-overlay" : ""}`} transform={`translate(${dx} ${dy}) scale(${m.width/m.w} ${m.depth/m.h}) translate(${-m.x} ${-m.y})`}>
    <defs><clipPath id={clipId} clipPathUnits="userSpaceOnUse"><polygon points={pointsText(room.points)}/></clipPath></defs>
    <image href={plan.image} width={plan.imageWidth} height={plan.imageHeight} clipPath={`url(#${clipId})`}/>
    <polygon className="crop-tint" points={pointsText(room.points)}/>
  </g>;
}

function Dimensions({ plan, room }: { plan:Plan; room:Room }) {
  const m = metrics(plan,room);
  return <div className="dimensions">
    <div><span>가로</span><strong>{m.width.toFixed(2)}m</strong></div>
    <i>×</i>
    <div><span>세로</span><strong>{m.depth.toFixed(2)}m</strong></div>
    <small>{room.width && room.depth ? "도면 표기 치수" : "도면 축척 환산"}</small>
  </div>;
}

function ComparisonGuides({ width, depth, x=.18, y=.18, tone }: { width:number; depth:number; x?:number; y?:number; tone:"a"|"b" }) {
  const pad = Math.min(.16,Math.min(width,depth)*.12);
  return <g className={`comparison-guides ${tone}`} aria-hidden="true">
    <line x1={x+pad} y1={y+depth-pad} x2={x+width-pad} y2={y+depth-pad}/>
    <path d={`M${x+pad},${y+depth-pad} l.10,-.06 v.12 z M${x+width-pad},${y+depth-pad} l-.10,-.06 v.12 z`}/>
    <text x={x+width/2} y={y+depth-pad-.10}>{width.toFixed(2)}m</text>
    <line x1={x+pad} y1={y+pad} x2={x+pad} y2={y+depth-pad}/>
    <path d={`M${x+pad},${y+pad} l-.06,.10 h.12 z M${x+pad},${y+depth-pad} l-.06,-.10 h.12 z`}/>
    <text className="vertical" x={x+pad+.10} y={y+depth/2}>{depth.toFixed(2)}m</text>
  </g>;
}

export default function Home() {
  const [selectedA,setSelectedA] = useState("a-living");
  const [selectedB,setSelectedB] = useState("b-living");
  const [mode,setMode] = useState<"side"|"overlay">("side");
  const [anchor,setAnchor] = useState("tl");
  const roomA = useMemo(() => plans[0].rooms.find(room => room.id === selectedA)!,[selectedA]);
  const roomB = useMemo(() => plans[1].rooms.find(room => room.id === selectedB)!,[selectedB]);
  const a = metrics(plans[0],roomA), b = metrics(plans[1],roomB);
  const maxWidth = Math.max(a.width,b.width), maxHeight = Math.max(a.depth,b.depth);
  const viewBox = `0 0 ${maxWidth + .36} ${maxHeight + .36}`;
  const widthDiff = b.width - a.width;
  const depthDiff = b.depth - a.depth;

  const differenceText = (value:number, axis:"가로"|"세로") => {
    if (Math.abs(value) < .005) return `${axis}는 동일`;
    return `${axis}는 ${value > 0 ? "도면 2가" : "도면 1이"} ${Math.abs(value).toFixed(2)}m 더 ${axis === "가로" ? "넓음" : "깊음"}`;
  };

  return <main>
    <section className="picker-grid">
      <PlanPicker plan={plans[0]} selected={selectedA} onSelect={setSelectedA}/>
      <PlanPicker plan={plans[1]} selected={selectedB} onSelect={setSelectedB}/>
    </section>

    <section className="compare-panel" aria-live="polite">
      <div className="compare-bar">
        <div className="selection-name"><span>{roomA.name}</span><i>↔</i><span>{roomB.name}</span></div>
        <div className="mode-buttons"><button className={mode === "side" ? "active" : ""} onClick={() => setMode("side")}>좌우 비교</button><button className={mode === "overlay" ? "active" : ""} onClick={() => setMode("overlay")}>겹쳐 비교</button></div>
      </div>

      {mode === "overlay" && <div className="anchor-buttons">
        <span>정렬 꼭짓점</span>
        {[["tl","↖"],["tr","↗"],["bl","↙"],["br","↘"]].map(([value,label]) => <button key={value} className={anchor === value ? "active" : ""} onClick={() => setAnchor(value)} aria-label={`${label} 꼭짓점 정렬`}>{label}</button>)}
      </div>}

      <div className={`comparison-view ${mode}`} key={`${selectedA}-${selectedB}-${mode}-${anchor}`}>
        {mode === "side" ? <>
          <div className="isolated-card plan-a">
            <b>도면 1</b>
            <svg viewBox={viewBox}><CroppedRoom plan={plans[0]} room={roomA} id={`a-${roomA.id}`} maxWidth={maxWidth} maxHeight={maxHeight} anchor="tl"/><ComparisonGuides width={a.width} depth={a.depth} tone="a"/></svg>
            <Dimensions plan={plans[0]} room={roomA}/>
          </div>
          <div className="isolated-card plan-b">
            <b>도면 2</b>
            <svg viewBox={viewBox}><CroppedRoom plan={plans[1]} room={roomB} id={`b-${roomB.id}`} maxWidth={maxWidth} maxHeight={maxHeight} anchor="tl"/><ComparisonGuides width={b.width} depth={b.depth} tone="b"/></svg>
            <Dimensions plan={plans[1]} room={roomB}/>
          </div>
        </> : <div className="overlay-card">
          <svg viewBox={viewBox}>
            <CroppedRoom plan={plans[0]} room={roomA} id={`oa-${roomA.id}`} maxWidth={maxWidth} maxHeight={maxHeight} anchor={anchor} overlay/>
            <CroppedRoom plan={plans[1]} room={roomB} id={`ob-${roomB.id}`} maxWidth={maxWidth} maxHeight={maxHeight} anchor={anchor} overlay/>
          </svg>
          <div className="overlay-legend"><span><i/>도면 1 · {a.width.toFixed(2)} × {a.depth.toFixed(2)}m</span><span><i/>도면 2 · {b.width.toFixed(2)} × {b.depth.toFixed(2)}m</span></div>
        </div>}
      </div>

      <div className="difference">
        <div><span>가로 차이</span><strong>{Math.abs(widthDiff).toFixed(2)}m</strong><small>{(Math.abs(widthDiff)*100).toFixed(0)}cm</small></div>
        <p><b>{differenceText(widthDiff,"가로")}</b><br/><strong>{differenceText(depthDiff,"세로")}</strong></p>
        <div><span>세로 차이</span><strong>{Math.abs(depthDiff).toFixed(2)}m</strong><small>{(Math.abs(depthDiff)*100).toFixed(0)}cm</small></div>
      </div>
    </section>
  </main>;
}
