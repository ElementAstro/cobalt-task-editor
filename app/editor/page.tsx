import { SequenceEditor } from "@/components/nina";

export const metadata = {
  title: "NINA Sequence Editor",
  description:
    "Visual editor for NINA (Nighttime Imaging N Astronomy) sequences",
};

export default function EditorPage() {
  return <SequenceEditor />;
}
