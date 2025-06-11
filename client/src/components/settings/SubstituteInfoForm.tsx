import { useEffect, useState } from 'react';
import { useSubstituteInfo, useSaveSubstituteInfo } from '../../api';

export default function SubstituteInfoForm() {
  const { data } = useSubstituteInfo();
  const save = useSaveSubstituteInfo();
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
