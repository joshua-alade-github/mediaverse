'use client';

import { useState } from 'react';
import { List, Media } from '@/types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ListEditorProps {
  list?: List;
  initialItems?: Media[];
  onSave: (list: Partial<List>, items: string[]) => Promise<void>;
}

export function ListEditor({ list, initialItems = [], onSave }: ListEditorProps) {
  const [title, setTitle] = useState(list?.title || '');
  const [description, setDescription] = useState(list?.description || '');
  const [isPrivate, setIsPrivate] = useState(list?.isPrivate || false);
  const [items, setItems] = useState<Media[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave(
        { title, description, isPrivate },
        items.map(item => item.id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);
    setItems(newItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="ml-2 text-sm text-gray-700">Private list</label>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="list-items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between p-2 bg-white rounded-md shadow"
                      >
                        <span>{item.title}</span>
                        <button
                          type="button"
                          onClick={() => setItems(items.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save List'}
      </button>
    </form>
  );
}