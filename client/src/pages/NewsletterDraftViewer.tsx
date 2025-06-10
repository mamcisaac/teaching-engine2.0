import { useEffect, useState } from 'react';
import { useCreateNewsletterDraft, useCreateNewsletter } from '../api';
import RichTextEditor from '../components/RichTextEditor';

export default function NewsletterDraftViewer() {
  const createNewsletter = useCreateNewsletter();
  const { mutateAsync } = useCreateNewsletterDraft();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    mutateAsync({
      completedActivities: [],
      classMilestones: [],
      teacherTone: 'warm, professional',
      term: 'Term 2',
      includeUpcomingTopics: true,
    }).then((d) => {
      setContent(d.content);
      setTitle(d.title);
    });
  }, [mutateAsync]);

  const handleSave = () => {
    createNewsletter.mutate({ title, content });
  };

  return (
    <div className="space-y-2 p-2">
      <input
        className="border p-1 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <RichTextEditor value={content} onChange={setContent} />
      <button className="bg-blue-600 text-white px-2 py-1" onClick={handleSave}>
        Save Newsletter
      </button>
    </div>
  );
}
