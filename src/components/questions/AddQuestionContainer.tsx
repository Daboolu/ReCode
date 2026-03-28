'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionEditor from '@/components/questions/QuestionEditor';
import { PlatformSelector } from '@/components/questions/PlatformSelector';
import { EditorFormData } from '@/types/editor';

interface AddQuestionContainerProps {
  preferredLang: string;
}

export default function AddQuestionContainer({
  preferredLang,
}: AddQuestionContainerProps) {
  const router = useRouter();
  const [hasSelected, setHasSelected] = useState(false);
  const [fetchedData, setFetchedData] =
    useState<Partial<EditorFormData> | null>(null);

  const handleCompleteSelection = (data?: Partial<EditorFormData>) => {
    if (data) {
      setFetchedData(data);
    } else {
      // Custom mode: Generate a random ID with -note suffix to prevent overriding existing LeetCode problems
      const randomId = Math.floor(Math.random() * 1000000);
      setFetchedData({ pid: `${randomId}-note` });
    }
    setHasSelected(true);
  };

  const handleCancel = () => {
    router.back();
  };

  if (!hasSelected) {
    return (
      <PlatformSelector
        onComplete={handleCompleteSelection}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <QuestionEditor
      mode="create"
      preferredLang={preferredLang}
      initialData={fetchedData as any}
    />
  );
}
