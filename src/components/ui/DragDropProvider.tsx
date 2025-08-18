// src/components/ui/DragDropProvider.tsx
'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableFieldProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({ id, children, className = '' }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      type: 'form-field',
      fieldId: id,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} relative group`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Drag to Ask AI"
      >
        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
        </svg>
      </div>
      {children}
    </div>
  );
};

interface DroppableZoneProps {
  id: string;
  children: React.ReactNode;
  onFieldDrop: (fieldId: string) => void;
  className?: string;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({ 
  id, 
  children, 
  onFieldDrop, 
  className = '' 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'ai-assistant-zone',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
    >
      {children}
    </div>
  );
};

interface DragDropProviderProps {
  children: React.ReactNode;
  onFieldDrop: (fieldId: string) => void;
  dropZoneId?: string;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children, onFieldDrop }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Check if we're dropping on the specified drop zone or any droppable area
    if (over && active.data.current?.type === 'form-field') {
      const fieldId = active.data.current.fieldId;
      onFieldDrop(fieldId);
    }
    
    setActiveId(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Dragging field...
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}; 