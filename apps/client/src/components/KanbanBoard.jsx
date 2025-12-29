import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * Reusable Kanban Board Component
 * Premium Redesign - Clean, White, Professional
 */
const KanbanBoard = ({ columns, data, onDragEnd, renderCard, loading, layout = 'horizontal' }) => {
    
    // Sort items into columns
    const boardData = columns.reduce((acc, col) => {
        acc[col.id] = data.filter(item => item.status === col.id);
        return acc;
    }, {});

    if (loading) return null;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={`
                ${layout === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-6 p-8 overflow-y-auto flex-1 h-full content-start bg-slate-50/50' 
                    : 'flex flex-1 overflow-x-auto gap-6 p-6 h-full items-start'
                }
            `}>
                {columns.map((column) => (
                    <div 
                        key={column.id} 
                        className={`
                            flex flex-col bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden
                            ${layout === 'grid' ? 'h-full min-h-[350px]' : 'min-w-[320px] w-80 max-h-full'}
                        `}
                    >
                        {/* Premium Header */}
                        <div className="p-5 border-b border-slate-50 bg-white sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                                    {column.title}
                                </h3>
                                <div 
                                    className="px-3 py-1 rounded-full text-xs font-bold border"
                                    style={{ 
                                        backgroundColor: `${column.color}08`, // Very subtle tint
                                        color: column.color,
                                        borderColor: `${column.color}20` 
                                    }}
                                >
                                    {boardData[column.id]?.length || 0}
                                </div>
                            </div>
                            
                            {/* Progress Bar Strip */}
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-500 shadow-sm" 
                                    style={{ 
                                        width: '100%', 
                                        backgroundColor: column.color || '#cbd5e1'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Droppable Area */}
                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 overflow-y-auto p-4 space-y-3 transition-colors duration-200 min-h-[150px] ${
                                        snapshot.isDraggingOver ? 'bg-slate-50' : 'bg-white'
                                    }`}
                                >
                                    {boardData[column.id]?.length === 0 && !snapshot.isDraggingOver && (
                                        <div className="h-40 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300 gap-2 m-2">
                                            <span className="text-sm font-medium">Empty Stage</span>
                                            <span className="text-xs">Drag tickets here</span>
                                        </div>
                                    )}

                                    {boardData[column.id]?.map((item, index) => (
                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                    className={`
                                                        bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all group relative cursor-grab
                                                        hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5
                                                        ${snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 border-blue-400 z-50 ring-4 ring-blue-50' : ''}
                                                    `}
                                                >
                                                    {renderCard(item)}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanBoard;
