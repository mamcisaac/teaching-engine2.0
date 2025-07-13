import React, { useEffect, useState } from 'react';
// TODO: Substitute info hooks not yet implemented - using substitute plan hooks instead
// import { useSubstituteInfo, useSaveSubstituteInfo } from '../../api';
// import { useSubstitutePlans } from '../../api';

export function SubstituteInfoForm(): React.ReactElement {
  // TODO: Substitute info hooks not yet implemented
  // const { data } = useSubstituteInfo();
  // const save = useSaveSubstituteInfo();

  // Mock data - in reality this would come from the API
  const data = null as { procedures?: string; allergies?: string } | null;
  const save = { mutate: (_data: { procedures: string; allergies: string }): void => {} }; // Placeholder
  const [procedures, setProcedures] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect((): void => {
    // Since data is always null in this mock, skip the update
    // When real hooks are implemented, this will work properly
    if (data && typeof data === 'object') {
      setProcedures(data.procedures ?? '');
      setAllergies(data.allergies ?? '');
    }
  }, [data]);

  const handleSave = (): void => {
    save.mutate({ procedures, allergies });
  };

  return (
    <div className="space-y-2">
      <textarea
        className="border p-1 w-full"
        maxLength={1000}
        placeholder="Procedures"
        value={procedures}
        onChange={(e): void => {
 setProcedures(e.target.value); 
}}
      />
      <textarea
        className="border p-1 w-full"
        maxLength={1000}
        placeholder="Allergies"
        value={allergies}
        onChange={(e): void => {
 setAllergies(e.target.value); 
}}
      />
      <button className="px-2 py-1 bg-blue-600 text-white" onClick={handleSave}>
        Save
      </button>
    </div>
  );
}
