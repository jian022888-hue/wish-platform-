import type { ResponseType } from "@/types";
import { Badge } from "@/components/ui/badge";

const typeStyles: Record<
  ResponseType,
  { label: string; className: string }
> = {
  Advice: {
    label: "[ 经验建议 ]",
    className: "border-transparent bg-transparent text-[#8B694C] before:bg-[#C7B299] dark:text-[#C9A97A] dark:before:bg-[#8B694C]",
  },
  Resource: {
    label: "[ 资源提供 ]",
    className: "border-transparent bg-transparent text-[#5C6E50] before:bg-[#C5D1BA] dark:text-[#8FAF7E] dark:before:bg-[#5C6E50]",
  },
  Introduction: {
    label: "[ 人脉引荐 ]",
    className: "border-transparent bg-transparent text-[#76597C] before:bg-[#D6C1D8] dark:text-[#B08DB8] dark:before:bg-[#76597C]",
  },
  Opportunity: {
    label: "[ 机会线索 ]",
    className: "border-transparent bg-transparent text-[#577188] before:bg-[#C8D7E5] dark:text-[#8AAFC8] dark:before:bg-[#577188]",
  },
  Support: {
    label: "[ 陪伴支持 ]",
    className: "border-transparent bg-transparent text-[#8C6757] before:bg-[#E2CEC2] dark:text-[#C08E7E] dark:before:bg-[#8C6757]",
  },
  "Similar Experience": {
    label: "[ 相似经历 ]",
    className: "border-transparent bg-transparent text-[#6E6658] before:bg-[#D6D0C5] dark:text-[#A89E8E] dark:before:bg-[#6E6658]",
  },
};

interface ResponseTypeBadgeProps {
  type: ResponseType;
}

export function ResponseTypeBadge({ type }: ResponseTypeBadgeProps) {
  const meta = typeStyles[type];

  return <Badge className={meta.className}>{meta.label}</Badge>;
}
