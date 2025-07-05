import { useEffect, useState } from 'react';
// TODO: Substitute info hooks not yet implemented - using substitute plan hooks instead
// import { useSubstituteInfo, useSaveSubstituteInfo } from '../../api';
// import { useSubstitutePlans } from '../../api';

export default function SubstituteInfoForm() {
  // TODO: Substitute info hooks not yet implemented
  // const { data } = useSubstituteInfo();
  // const save = useSaveSubstituteInfo();
  const data: { procedures?: string; allergies?: string } | null = null; // Placeholder
  const save = { mutate: (_data: { procedures: string; allergies: string }) => {} }; // Placeholder
  const [procedures, setProcedures] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    if (data) {
      setProcedures(data.procedures ?? '');
      setAllergies(data.allergies ?? '');
    }
  }, [data]);

  const handleSave = () => {
    save.mutate({ procedures, allergies });
  };

  return (
    <div className="space-y-2">
      <textarea
        className="border p-1 w-full"
        placeholder="Procedures"
        value={procedures}
        onChange={(e) => setProcedures(e.target.value)}
        maxLength={1000}
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Allergies"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        maxLength={1000}
      />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
