import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSetupTypes, SetupType } from '@/hooks/useSetupTypes';

interface SetupTypeSelectorProps {
  value: string | null; // setup_type_id
  onChange: (setupTypeId: string, setupCode: string) => void;
  disabled?: boolean;
}

export function SetupTypeSelector({ value, onChange, disabled }: SetupTypeSelectorProps) {
  const { activeSetupTypes, loading, createSetupType, getSetupById } = useSetupTypes();
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const selectedSetup = value ? getSetupById(value) : null;

  const handleSelect = (setup: SetupType) => {
    onChange(setup.id, setup.code);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) return;

    setCreating(true);
    const created = await createSetupType({
      code: newCode,
      name: newName,
      description: newDescription || undefined,
    });
    setCreating(false);

    if (created) {
      onChange(created.id, created.code);
      setCreateDialogOpen(false);
      setNewCode('');
      setNewName('');
      setNewDescription('');
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {selectedSetup ? (
              <span className="font-mono">
                {selectedSetup.code} — {selectedSetup.name}
              </span>
            ) : (
              <span className="text-muted-foreground">Select setup type...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search setup types..." />
            <CommandList>
              <CommandEmpty>No setup type found.</CommandEmpty>
              <CommandGroup>
                {activeSetupTypes.map((setup) => (
                  <CommandItem
                    key={setup.id}
                    value={`${setup.code} ${setup.name}`}
                    onSelect={() => handleSelect(setup)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === setup.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="font-mono text-sm">{setup.code}</span>
                    <span className="ml-2 text-muted-foreground">— {setup.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setCreateDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add Setup Type</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Setup Type</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                placeholder="e.g. OBC"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                2-6 uppercase letters/numbers. Cannot be changed once created.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Orderblock Continuation"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe when to use this setup..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newCode.trim() || !newName.trim() || creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
