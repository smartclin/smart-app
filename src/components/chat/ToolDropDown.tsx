'use client';

import { Settings2 } from 'lucide-react';
import { startTransition } from 'react';

import { saveChatModelAsCookie } from '@/lib/model';
import type { ModelId } from '@/lib/model/model';
import { saveToolAsCookie } from '@/lib/tools';
import { getModelForTool, TOOL_REGISTRY, type Tool } from '@/lib/tools/tool';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';

interface ModelDropDownProps {
  disabledAll: boolean;
  initialModel: ModelId;
  optimisticTool: Tool;
  setOptimisticTool: (toolId: Tool) => void;
}

const ToolDropDown = ({
  disabledAll,
  initialModel,
  optimisticTool,
  setOptimisticTool
}: ModelDropDownProps) => {
  const handleToolChange = (toolId: Tool) => {
    startTransition(async () => {
      setOptimisticTool(toolId);
      await saveToolAsCookie(toolId);

      // set appropriate model for the tool
      if (toolId !== 'none') {
        const toolModel = getModelForTool(toolId, initialModel);
        await saveChatModelAsCookie(toolModel as ModelId);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className='text-sm'
      >
        <Button
          className={'rounded-full max-md:text-xs'}
          disabled={disabledAll}
          size='icon'
          variant='ghost'
        >
          <Settings2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='start'
        className='w-[--radix-dropdown-menu-trigger-width] rounded-lg px-2 pt-2.5'
        side='top'
        sideOffset={4}
      >
        {Object.entries(TOOL_REGISTRY).map(([toolId, config]) => (
          <DropdownMenuItem
            className={`mb-2 cursor-pointer max-md:text-xs ${
              toolId === optimisticTool ? 'bg-muted font-semibold' : ''
            } `}
            key={toolId}
            onClick={() => handleToolChange(toolId as Tool)}
            //disable when the tool rate limit hits
          >
            <div className='flex items-center gap-2'>
              {<config.icon />}
              {config.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToolDropDown;
