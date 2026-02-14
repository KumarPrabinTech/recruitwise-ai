import { useState } from "react";
import { JD_TEMPLATES, JD_CATEGORIES } from "@/lib/jd-templates";
import { FileText, ChevronDown, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JdTemplateSelectorProps {
  onSelect: (content: string) => void;
}

const JdTemplateSelector = ({ onSelect }: JdTemplateSelectorProps) => {
  const [selectedId, setSelectedId] = useState<string>("");

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const template = JD_TEMPLATES.find((t) => t.id === id);
    if (template) onSelect(template.content);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedId} onValueChange={handleSelect}>
        <SelectTrigger className="w-[220px] h-8 text-xs bg-card">
          <div className="flex items-center gap-1.5">
            <Pencil className="h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Use a template..." />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {JD_CATEGORIES.map((cat) => (
            <SelectGroup key={cat}>
              <SelectLabel className="text-xs font-semibold text-muted-foreground">{cat}</SelectLabel>
              {JD_TEMPLATES.filter((t) => t.category === cat).map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-sm">
                  {t.title}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default JdTemplateSelector;
